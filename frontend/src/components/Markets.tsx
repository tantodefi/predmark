"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useDisconnect,
  useWriteContract,
  useBalance,
  useConnect
} from "wagmi";
import { readContract } from 'wagmi/actions'
import { parseEther, formatEther, formatUnits } from "viem";
import { marketAddress, marketAbi, DIA_PRICE_FEEDS, DIA_ADAPTERS } from "../constants";
import ConnectButton from "./ConnectButton";
import { type Config } from 'wagmi';

const Markets = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  const [markets, setMarkets] = useState<Array<any>>([]);
  const [isCreatingMarket, setIsCreatingMarket] = useState(false);
  const [newMarket, setNewMarket] = useState({
    cryptoPair: "",
    strikePrice: "",
    endTime: "",
    resolutionTime: "",
    diaOracleKey: DIA_PRICE_FEEDS.ETH_USD, // Default to ETH/USD
  });
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const { writeContract, isPending: isWritePending } = useWriteContract();
  const [buyAmounts, setBuyAmounts] = useState<{ [key: string]: string }>({});
  const [isBuying, setIsBuying] = useState(false);
  const [buyingMarketId, setBuyingMarketId] = useState<number | null>(null);
  const [buyingIsYes, setBuyingIsYes] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [marketCount, setMarketCount] = useState<bigint>(BigInt(0));
  const [mounted, setMounted] = useState(false);
  const [currentFeedPrice, setCurrentFeedPrice] = useState<string | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(false);

  // Get LYX balance
  const { data: lyxBalance } = useBalance({
    address
  });

  // Format LYX balance
  const formatLyxBalance = (balance: bigint | undefined) => {
    if (!balance) {
      return '0';
    }

    try {
      const formatted = formatUnits(balance, 18);
      const num = parseFloat(formatted);
      
      // Format with commas and 2 decimal places
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } catch (error) {
      console.error("Error formatting LYX balance:", error);
      return '0';
    }
  };

  // Fetch market data
  const fetchMarkets = async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      // Get market count directly without parameters
      const count = await readContract({
        address: marketAddress,
        abi: marketAbi,
        functionName: "marketCount",
        args: [],
        chainId: 43
      });
      
      setMarketCount(count as bigint);
      
      if ((count as bigint) > BigInt(0)) {
        // Get all markets
        const allMarkets = await readContract({
          address: marketAddress,
          abi: marketAbi,
          functionName: "getAllMarkets",
          args: [],
          chainId: 43
        });
        
        setMarkets(allMarkets as any);
      } else {
        setMarkets([]);
      }
    } catch (error) {
      console.error("Error fetching markets:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a useEffect to set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initial data fetch - update to check mounted state
  useEffect(() => {
    if (isConnected && mounted) {
      fetchMarkets();
    }
  }, [isConnected, mounted]);

  // Update the buyShares function to directly use LYX
  const handleBuyShares = async (marketId: number, isYes: boolean) => {
    if (!isConnected) {
      // Don't try to connect here, just alert the user
      alert("Please connect your wallet first");
      return;
    }

    const amount = buyAmounts[marketId.toString()];
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setIsBuying(true);
    setBuyingMarketId(marketId);
    setBuyingIsYes(isYes);

    try {
      // For LYX transactions, we use msg.value instead of approval
      const tx = await writeContract({
        address: marketAddress,
        abi: marketAbi,
        functionName: "buyShares",
        args: [BigInt(marketId), isYes, parseEther(amount)],
        value: parseEther(amount) // Send LYX with the transaction
      });

      // Instead of setting hash state, just use the tx hash in the alert
      alert(`Transaction submitted! Hash: ${tx}`);
      
      // Reset form and refresh data
      setBuyAmounts(prev => ({
        ...prev,
        [marketId.toString()]: ""
      }));
      fetchMarkets();
    } catch (error) {
      console.error("Error buying shares:", error);
    } finally {
      setIsBuying(false);
      setBuyingMarketId(null);
    }
  };

  // Create market function
  const handleCreateMarket = async () => {
    if (!isConnected) {
      // Don't try to connect here, just alert the user
      alert("Please connect your wallet first");
      return;
    }

    // Validate inputs
    if (!newMarket.cryptoPair || !newMarket.strikePrice || !newMarket.endTime || !newMarket.resolutionTime) {
      alert("Please fill in all fields");
      return;
    }

    try {
      // Convert inputs to appropriate format
      const strikePrice = parseEther(newMarket.strikePrice);
      const endTimeUnix = Math.floor(new Date(newMarket.endTime).getTime() / 1000);
      const resolutionTimeUnix = Math.floor(new Date(newMarket.resolutionTime).getTime() / 1000);

      // Create market transaction with LYX fee (5 LYX)
      const hash = await writeContract({
        address: marketAddress,
        abi: marketAbi,
        functionName: "createMarket",
        args: [
          newMarket.cryptoPair,
          strikePrice,
          BigInt(endTimeUnix),
          BigInt(resolutionTimeUnix),
          newMarket.diaOracleKey
        ],
        value: parseEther("5") // 5 LYX market creation fee
      });

      alert(`Market creation submitted! Hash: ${hash}`);
      
      // Reset form and close modal
      setNewMarket({
        cryptoPair: "",
        strikePrice: "",
        endTime: "",
        resolutionTime: "",
        diaOracleKey: DIA_PRICE_FEEDS.ETH_USD,
      });
      setIsCreatingMarket(false);
      
      // Refresh markets
      fetchMarkets();
    } catch (error) {
      console.error("Error creating market:", error);
    }
  };

  // Add a function to fetch price for the selected feed
  const fetchSelectedFeedPrice = async (feed: string) => {
    try {
      setIsLoadingPrice(true);
      
      // Extract coin symbol from feed (e.g., "ETH/USD" -> "ETH")
      const coin = feed.split('/')[0];
      
      // Use the correct DIA API endpoint
      const response = await fetch(`https://api.diadata.org/v1/assetQuotation/${coin}/USD`);
      const data = await response.json();
      
      if (data && data.Price) {
        setCurrentFeedPrice(data.Price.toFixed(2));
      } else {
        setCurrentFeedPrice(null);
      }
    } catch (error) {
      console.error(`Error fetching price for ${feed}:`, error);
      setCurrentFeedPrice(null);
    } finally {
      setIsLoadingPrice(false);
    }
  };

  // Add useEffect to fetch the price when the modal opens
  useEffect(() => {
    if (isCreatingMarket && newMarket.diaOracleKey) {
      fetchSelectedFeedPrice(newMarket.diaOracleKey);
    }
  }, [isCreatingMarket]);

  // Render a single market card
  const renderMarket = (market: any) => {
    const hasAdapter = market.diaOracleKey === "EUR/USD" || market.diaOracleKey === "stETH/USD";
    
    return (
      <div key={market.id.toString()} className="bg-white rounded-lg p-4 shadow">
        <h3 className="text-xl font-bold mb-2">{market.cryptoPair}</h3>
        <p>Strike Price: {formatEther(market.strikePrice)} USD</p>
        <p>End Time: {new Date(Number(market.endTime) * 1000).toLocaleString()}</p>
        <p>Resolution Time: {new Date(Number(market.resolutionTime) * 1000).toLocaleString()}</p>
        <p>Oracle Key: {market.diaOracleKey}</p>
        {hasAdapter && <p className="text-sm text-gray-500">Using special adapter</p>}
        <p>Total Pool: {formatEther(market.totalPool)} LYX</p>
        <p>Resolved: {market.resolved ? "Yes" : "No"}</p>
      
      {!market.resolved && (
        <div className="mt-4">
          <input
            type="number"
            placeholder="Amount to buy"
            value={buyAmounts[market.id.toString()] || ""}
            onChange={(e) => setBuyAmounts(prev => ({
              ...prev,
              [market.id.toString()]: e.target.value
            }))}
            className="p-2 border rounded mr-2 text-black"
            min="0"
            step="0.01"
            disabled={isBuying}
          />
          <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleBuyShares(Number(market.id), true)}
                  disabled={isBuying}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                {isBuying && buyingMarketId === Number(market.id) && buyingIsYes ? 'Buying...' : 'Buy Yes'}
                </button>
                <button
                  onClick={() => handleBuyShares(Number(market.id), false)}
                  disabled={isBuying}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
                >
                {isBuying && buyingMarketId === Number(market.id) && !buyingIsYes ? 'Buying...' : 'Buy No'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
  };

  // Replace the renderConnectButton function with a simpler implementation
  const renderConnectButton = () => {
    if (isConnected) {
      return (
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Disconnect
        </button>
      );
    }
    
    // Use the ConnectButton component that is already properly typed
    return <ConnectButton />;
  };

  // Update the return statement to conditionally render based on mounted state
  if (!mounted) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-white">Loading markets...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4 items-center">
          {isConnected && (
            <>
              <button
                onClick={() => setIsCreatingMarket(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Create Market
              </button>
              <div className="text-white">
                LYX Balance: {lyxBalance ? formatLyxBalance(lyxBalance.value) : '0'} LYX
              </div>
            </>
          )}
          {renderConnectButton()}
        </div>
      </div>

      <h2 className="text-3xl font-bold mb-6 text-white">Prediction Markets</h2>

      {/* Add loading and error states */}
      {isLoading && <div className="text-white">Loading markets...</div>}
      {hasError && <div className="text-white">Error loading markets. Please try again.</div>}
      
      {/* Market count display */}
      <div className="text-white">
        Total Markets: {marketCount?.toString() || '0'}
      </div>

      {/* Markets display */}
      <div>
        <h2 className="text-white">Markets ({markets.length})</h2>
        {markets.length === 0 ? (
          <p className="text-white">No markets available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map(renderMarket)}
          </div>
        )}
      </div>

      {/* Modal for creating a new market - keep modal content black text for readability */}
      {isCreatingMarket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create New Market</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Price Feed
              </label>
              <select
                value={newMarket.diaOracleKey}
                onChange={(e) => {
                  const selectedFeed = e.target.value;
                  setNewMarket({ ...newMarket, diaOracleKey: selectedFeed });
                  fetchSelectedFeedPrice(selectedFeed);
                }}
                className="w-full p-2 border rounded"
                required
              >
                <option value={DIA_PRICE_FEEDS.ETH_USD}>ETH/USD</option>
                <option value={DIA_PRICE_FEEDS.BTC_USD}>BTC/USD</option>
                <option value={DIA_PRICE_FEEDS.DIA_USD}>DIA/USD</option>
                <option value={DIA_PRICE_FEEDS.USDC_USD}>USDC/USD</option>
                <option value={DIA_PRICE_FEEDS.EUR_USD}>EUR/USD</option>
                <option value={DIA_PRICE_FEEDS.STETH_USD}>stETH/USD</option>
              </select>
              
              {/* Add price display */}
              <div className="mt-2">
                <p className="text-sm text-gray-700">
                  Current Price: 
                  {isLoadingPrice ? (
                    <span className="ml-2 inline-block w-16 h-4 bg-gray-300 animate-pulse rounded"></span>
                  ) : currentFeedPrice ? (
                    <span className="ml-2 font-semibold">${currentFeedPrice} USD</span>
                  ) : (
                    <span className="ml-2 text-gray-500">Not available</span>
                  )}
                </p>
              </div>
              
              {(newMarket.diaOracleKey === DIA_PRICE_FEEDS.EUR_USD || 
                newMarket.diaOracleKey === DIA_PRICE_FEEDS.STETH_USD) && (
                <p className="text-xs text-gray-500 mt-1">
                  Using adapter: {newMarket.diaOracleKey === DIA_PRICE_FEEDS.EUR_USD ? 
                    DIA_ADAPTERS.EUR_USD : DIA_ADAPTERS.STETH_USD}
                </p>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Market Description
              </label>
              <input
                type="text"
                value={newMarket.cryptoPair}
                onChange={(e) =>
                  setNewMarket({ ...newMarket, cryptoPair: e.target.value })
                }
                className="w-full p-2 border rounded"
                placeholder={`${newMarket.diaOracleKey.split('/')[0]} > $X`}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Strike Price (in USD)
              </label>
              <input
                type="number"
                value={newMarket.strikePrice}
                onChange={(e) =>
                  setNewMarket({ ...newMarket, strikePrice: e.target.value })
                }
                className="w-full p-2 border rounded"
                placeholder="80000"
                step="0.01"
                min="0"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                End Time
              </label>
              <input
                type="datetime-local"
                value={newMarket.endTime}
                onChange={(e) =>
                  setNewMarket({ ...newMarket, endTime: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Resolution Time
              </label>
              <input
                type="datetime-local"
                value={newMarket.resolutionTime}
                onChange={(e) =>
                  setNewMarket({ ...newMarket, resolutionTime: e.target.value })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div className="mt-6 flex gap-2">
                <button
                onClick={handleCreateMarket}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  disabled={isWritePending}
                >
                {isWritePending ? "Creating..." : "Create Market"}
                </button>
                <button
                onClick={() => setIsCreatingMarket(false)}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                >
                Cancel
                </button>
              </div>
            
            <p className="mt-4 text-sm text-gray-500">
              Note: Creating a market requires a 5 LYX fee.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Markets;
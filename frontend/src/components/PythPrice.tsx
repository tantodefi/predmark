"use client";

import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { diaOracleAddress, DIA_PRICE_FEEDS, DIA_ADAPTERS } from "@/constants";

// Interface for the DIA Oracle
const diaOracleAbi = [
  {
    "type": "function",
    "name": "getValue",
    "inputs": [
      { "name": "key", "type": "string", "internalType": "string" }
    ],
    "outputs": [
      { "name": "", "type": "uint128", "internalType": "uint128" },
      { "name": "", "type": "uint128", "internalType": "uint128" }
    ],
    "stateMutability": "view"
  }
] as const;

export function DIAPrice() {
  const [selectedFeed, setSelectedFeed] = useState<string>(DIA_PRICE_FEEDS.ETH_USD);
  const [isSpecialAdapter, setIsSpecialAdapter] = useState<boolean>(false);
  const [price, setPrice] = useState<string>("N/A");
  const [timestamp, setTimestamp] = useState<string>("N/A");
  
  // Check if we need to use a special adapter
  useEffect(() => {
    setIsSpecialAdapter(
      selectedFeed === DIA_PRICE_FEEDS.EUR_USD || 
      selectedFeed === DIA_PRICE_FEEDS.STETH_USD
    );
  }, [selectedFeed]);

  // Get adapter address if needed
  const getAdapterAddress = () => {
    if (selectedFeed === DIA_PRICE_FEEDS.EUR_USD) {
      return DIA_ADAPTERS.EUR_USD as `0x${string}`;
    } else if (selectedFeed === DIA_PRICE_FEEDS.STETH_USD) {
      return DIA_ADAPTERS.STETH_USD as `0x${string}`;
    }
    return diaOracleAddress;
  };

  // Read price from oracle
  const { 
    data: priceData, 
    isLoading, 
    isError,
    refetch 
  } = useReadContract({
    address: getAdapterAddress(),
    abi: diaOracleAbi,
    functionName: "getValue",
    args: [selectedFeed]
  });

  // Process price data when it changes
  useEffect(() => {
    if (priceData && Array.isArray(priceData) && priceData.length >= 2) {
      try {
        // Format price (first element)
        const priceValue = formatUnits(BigInt(priceData[0].toString()), 8);
        setPrice(priceValue);
        
        // Format timestamp (second element)
        const timestampValue = new Date(Number(priceData[1].toString()) * 1000).toLocaleString();
        setTimestamp(timestampValue);
      } catch (error) {
        console.error("Error formatting price data:", error);
        setPrice("Error");
        setTimestamp("Error");
      }
    } else if (priceData === undefined && !isLoading && !isError) {
      setPrice("No data");
      setTimestamp("No data");
    }
  }, [priceData, isLoading, isError]);

  return (
    <div className="mt-6 p-4 bg-gray-700 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">DIA Price Feeds</h2>
      
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Select Price Feed</label>
        <select 
          value={selectedFeed}
          onChange={(e) => setSelectedFeed(e.target.value)}
          className="w-full p-2 bg-gray-800 text-white rounded"
        >
          <option value={DIA_PRICE_FEEDS.ETH_USD}>ETH/USD</option>
          <option value={DIA_PRICE_FEEDS.BTC_USD}>BTC/USD</option>
          <option value={DIA_PRICE_FEEDS.DIA_USD}>DIA/USD</option>
          <option value={DIA_PRICE_FEEDS.USDC_USD}>USDC/USD</option>
          <option value={DIA_PRICE_FEEDS.EUR_USD}>EUR/USD</option>
          <option value={DIA_PRICE_FEEDS.STETH_USD}>stETH/USD</option>
        </select>
        
        {isSpecialAdapter && (
          <p className="text-xs text-gray-400 mt-1">
            Using adapter: {selectedFeed === DIA_PRICE_FEEDS.EUR_USD ? 
              DIA_ADAPTERS.EUR_USD : DIA_ADAPTERS.STETH_USD}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Price:</span>
            <span className="text-white font-mono">
              {isLoading ? "Loading..." : isError ? "Error loading price" : 
                `$${price}`}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Last Updated:</span>
            <span className="text-white font-mono">
              {isLoading ? "Loading..." : isError ? "Error loading timestamp" : 
                timestamp}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-800"
          >
            {isLoading ? "Refreshing..." : "Refresh Price"}
          </button>
        </div>
      </div>
    </div>
  );
}

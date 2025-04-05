"use client";
import { useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { formatUnits, parseEther } from "viem";
import { marketAddress, marketAbi, DIA_ADAPTERS } from "../constants";

interface MarketProps {
  market: {
    id: string | bigint;
    cryptoPair: string;
    strikePrice: string | bigint;
    endTime: string | bigint;
    diaOracleKey: string;
    resolutionTime: string | bigint;
    yesSharesToken: string;
    noSharesToken: string;
    totalPool: string | bigint;
    resolved: boolean;
    outcome: boolean;
  };
}

const Market = ({ market }: MarketProps) => {
  const [amount, setAmount] = useState("");
  const [isYes, setIsYes] = useState(true);
  const {
    data: hash,
    writeContractAsync,
  } = useWriteContract();

  const handleBuy = async () => {
    if (!amount || isNaN(Number(amount))) return;
    
    try {
      // Convert amount to LYX value
      const valueInWei = parseEther(amount);
      
      const buyShareTx = await writeContractAsync({
        address: marketAddress,
        abi: marketAbi,
        functionName: "buyShares",
        args: [BigInt(market.id.toString()), isYes, valueInWei],
        value: valueInWei, // Send LYX with the transaction
      });
      console.log("transaction hash", buyShareTx);
    } catch (err: any) {
      console.log("Transaction Failed: " + err.message);
    }
  };

  const handleResolveMarket = async () => {
    console.log("Resolving market with DIA Oracle Key:", market.diaOracleKey);

    try {
      const resolveMarketTx = await writeContractAsync({
        address: marketAddress,
        abi: marketAbi,
        functionName: "resolveMarket",
        args: [BigInt(market.id.toString())],
      });

      console.log("Transaction data", resolveMarketTx);
    } catch (err: any) {
      console.log("Transaction Failed: " + err.message);
    }
  };

  const handleClaimRewards = async () => {
    try {
      const claimRewardsTx = await writeContractAsync({
        address: marketAddress,
        abi: marketAbi,
        functionName: "claimRewards",
        args: [BigInt(market.id.toString())],
      });

      console.log("Transaction data", claimRewardsTx);
    } catch (err: any) {
      console.log("Transaction Failed: " + err.message);
    }
  };

  // UseWaitForTransactionReceipt hook
  const { isLoading: isBuyLoading, isSuccess: isBuySuccess } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Check if this price feed uses a special adapter
  const hasAdapter = market.diaOracleKey === "EUR/USD" || market.diaOracleKey === "stETH/USD";
  const adapterAddress = market.diaOracleKey === "EUR/USD" 
    ? DIA_ADAPTERS.EUR_USD 
    : market.diaOracleKey === "stETH/USD" 
      ? DIA_ADAPTERS.STETH_USD 
      : null;

  // Convert values to proper formats for display
  const strikePriceFormatted = formatUnits(BigInt(market.strikePrice.toString()), 18);
  const endTimeDate = new Date(Number(market.endTime.toString()) * 1000);
  const resolutionTimeDate = new Date(Number(market.resolutionTime.toString()) * 1000);
  const totalPoolFormatted = formatUnits(BigInt(market.totalPool.toString()), 18);

  return (
    <div className="bg-white shadow-md rounded-lg p-6 text-black">
      <h3 className="text-xl font-semibold mb-2">{market.cryptoPair}</h3>
      <div className="">
        <div className="flex items-center justify-between">
          <p className="mb-2">
            Strike Price: {strikePriceFormatted}
          </p>
          <p className="mb-4">
            End Time: {endTimeDate.toLocaleString()}
          </p>
        </div>

        <div className="text-sm mb-3">
          <p>Price Feed: {market.diaOracleKey}</p>
          {hasAdapter && (
            <p className="text-xs text-gray-500">
              Using adapter: {adapterAddress}
            </p>
          )}
          <p>Total pool: {totalPoolFormatted} LYX</p>
          <p>Yes Token: {market.yesSharesToken.slice(0, 6)}...{market.yesSharesToken.slice(-4)}</p>
          <p>No Token: {market.noSharesToken.slice(0, 6)}...{market.noSharesToken.slice(-4)}</p>
        </div>

        {market.resolved ? (
          <div className="p-2 bg-gray-100 rounded mb-3">
            <p>Market resolved: {market.outcome ? "YES won" : "NO won"}</p>
            <button
              onClick={handleClaimRewards}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 my-2 px-4 rounded disabled:bg-gray-400"
            >
              Claim Rewards
            </button>
          </div>
        ) : (
          <>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (LYX)"
              className="w-full p-2 mb-2 border rounded"
            />
            <select
              value={isYes ? "yes" : "no"}
              onChange={(e) => setIsYes(e.target.value === "yes")}
              className="w-full p-2 mb-4 border rounded"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
            <button
              onClick={handleBuy}
              disabled={isBuyLoading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
            >
              {isBuyLoading ? "Buying..." : "Buy Shares"}
            </button>

            {Date.now() > Number(market.endTime.toString()) * 1000 && 
             Date.now() > Number(market.resolutionTime.toString()) * 1000 && (
              <button
                onClick={handleResolveMarket}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 my-2 px-4 rounded disabled:bg-gray-400"
              >
                Resolve Market
              </button>
            )}
          </>
        )}

        {isBuySuccess && <p className="mt-2 text-green-600">Purchase successful!</p>}
      </div>
    </div>
  );
};

export default Market;
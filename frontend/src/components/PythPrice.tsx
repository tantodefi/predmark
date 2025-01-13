"use client";

import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";
import { useEffect, useState } from "react";
import { useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { priceConsumerAbi, priceConsumerAddress } from "@/constants";

export function PythPrice() {
  const [price, setPrice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { writeContractAsync } = useWriteContract();

  const pythPriceId =
    "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace"; // Example ETH/USD price feed ID

  const fetchPrice = async () => {
    setIsLoading(true);
    try {
      const connection = new EvmPriceServiceConnection(
        "https://hermes.pyth.network"
      );
      const priceFeeds = await connection.getLatestPriceFeeds([pythPriceId]);

      if (priceFeeds && priceFeeds[0]) {
        const price = priceFeeds[0].getPriceNoOlderThan(60);
        if (price) {
          // Convert price to human readable format
          console.log("price", price);
          const humanReadablePrice = (
            Number(price.price) * Math.pow(10, price.expo)
          ).toFixed(2);
          setPrice(humanReadablePrice);
        }
      }
    } catch (error) {
      console.error("Error fetching price:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePriceOnChain = async () => {
    try {
      const connection = new EvmPriceServiceConnection(
        "https://hermes.pyth.network"
      );
      const priceFeedUpdateData = await connection.getPriceFeedsUpdateData([
        pythPriceId,
      ]);

      await writeContractAsync({
        address: priceConsumerAddress,
        abi: priceConsumerAbi,
        functionName: "updatePrice",
        args: [priceFeedUpdateData],
        value: parseEther("0.001"), // Fee for updating price
      });
    } catch (err: any) {
      console.error("Failed to update price on chain:", err.message);
    }
  };

  return (
    <div className="mt-6 p-4 bg-gray-700 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Pyth Price Feed</h2>
      <p className="text-gray-300 my-4">
        Call the updatePriceOnChain function first to fetch the price from the
        Pyth network
      </p>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Current ETH/USD Price:</span>
          <span className="text-white font-mono">
            {isLoading ? "Loading..." : price ? `$${price}` : "Not fetched"}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchPrice}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-800"
          >
            {isLoading ? "Fetching..." : "Fetch Price"}
          </button>

          <button
            onClick={updatePriceOnChain}
            disabled={isLoading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-green-800"
          >
            Update On-Chain
          </button>
        </div>
      </div>
    </div>
  );
}

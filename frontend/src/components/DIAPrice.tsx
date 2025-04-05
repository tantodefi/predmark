"use client";

import { useState, useEffect } from 'react';
import { diaOracleAddress, DIA_PRICE_FEEDS } from '../constants';

// Define the price data interface
interface PriceData {
  symbol: string;
  price: string;
  isLoading: boolean;
}

export const DIAPrice = () => {
  const [prices, setPrices] = useState<Record<string, PriceData>>({
    'ETH/USD': { symbol: 'ETH/USD', price: 'N/A', isLoading: true },
    'BTC/USD': { symbol: 'BTC/USD', price: 'N/A', isLoading: true },
    'DIA/USD': { symbol: 'DIA/USD', price: 'N/A', isLoading: true },
    'USDC/USD': { symbol: 'USDC/USD', price: 'N/A', isLoading: true },
    'EUR/USD': { symbol: 'EUR/USD', price: 'N/A', isLoading: true },
    'stETH/USD': { symbol: 'stETH/USD', price: 'N/A', isLoading: true }
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchAllPrices = async () => {
      // Update loading state for all price feeds
      setPrices(prevPrices => {
        const newPrices = { ...prevPrices };
        Object.keys(newPrices).forEach(key => {
          newPrices[key] = { ...newPrices[key], isLoading: true };
        });
        return newPrices;
      });

      try {
        // Create an array of promises to fetch prices for each asset
        const assets = [
          { symbol: 'ETH/USD', coin: 'ETH' },
          { symbol: 'BTC/USD', coin: 'BTC' },
          { symbol: 'DIA/USD', coin: 'DIA' },
          { symbol: 'USDC/USD', coin: 'USDC' },
          { symbol: 'EUR/USD', coin: 'EUR' },
          { symbol: 'stETH/USD', coin: 'stETH' }
        ];

        // Fetch each price sequentially to avoid API rate limits
        for (const asset of assets) {
          try {
            // Use the correct DIA API endpoint
            const response = await fetch(`https://api.diadata.org/v1/assetQuotation/${asset.coin}/USD`);
            const data = await response.json();
            
            if (data && data.Price) {
              setPrices(prevPrices => ({
                ...prevPrices,
                [asset.symbol]: {
                  symbol: asset.symbol,
                  price: data.Price.toFixed(2),
                  isLoading: false
                }
              }));
            } else {
              setPrices(prevPrices => ({
                ...prevPrices,
                [asset.symbol]: {
                  ...prevPrices[asset.symbol],
                  isLoading: false
                }
              }));
            }
          } catch (error) {
            console.error(`Error fetching ${asset.symbol} price:`, error);
            setPrices(prevPrices => ({
              ...prevPrices,
              [asset.symbol]: {
                ...prevPrices[asset.symbol],
                isLoading: false
              }
            }));
          }
          
          // Add a small delay between requests
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error("Error fetching DIA prices:", error);
        
        // Set loading to false for all price feeds on error
        setPrices(prevPrices => {
          const newPrices = { ...prevPrices };
          Object.keys(newPrices).forEach(key => {
            newPrices[key] = { ...newPrices[key], isLoading: false };
          });
          return newPrices;
        });
      }
    };

    fetchAllPrices();
    
    // Set up interval to refresh prices every 60 seconds
    const interval = setInterval(fetchAllPrices, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="bg-gray-900 p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Loading Price Feeds...</h3>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold text-white mb-2">DIA Price Feeds</h3>
      <p className="text-sm text-gray-400 mb-4">Powered by DIA Oracle on LUKSO ({diaOracleAddress.substring(0, 6)}...{diaOracleAddress.substring(diaOracleAddress.length - 4)})</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.values(prices).map((priceData) => (
          <div key={priceData.symbol} className="bg-gray-800 p-3 rounded">
            <p className="text-gray-400 text-sm">{priceData.symbol}</p>
            {priceData.isLoading ? (
              <div className="h-6 w-24 bg-gray-700 animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-white font-bold text-xl">${priceData.price}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

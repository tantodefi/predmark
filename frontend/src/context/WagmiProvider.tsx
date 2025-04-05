"use client";

import React, { ReactNode } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LUKSO_NETWORKS } from "@/constants";
import { mainnet } from "wagmi/chains"; // Import a chain type to help with typing

// Setup chains
const luksoMainnet = {
  id: parseInt(LUKSO_NETWORKS.MAINNET.chainId, 16),
  name: LUKSO_NETWORKS.MAINNET.chainName,
  nativeCurrency: LUKSO_NETWORKS.MAINNET.nativeCurrency,
  rpcUrls: {
    default: { http: LUKSO_NETWORKS.MAINNET.rpcUrls },
  },
} as const;

const luksoTestnet = {
  id: parseInt(LUKSO_NETWORKS.TESTNET.chainId, 16),
  name: LUKSO_NETWORKS.TESTNET.chainName,
  nativeCurrency: LUKSO_NETWORKS.TESTNET.nativeCurrency,
  rpcUrls: {
    default: { http: LUKSO_NETWORKS.TESTNET.rpcUrls },
  },
} as const;

// Create wagmi config with the correct type for chains
const config = createConfig({
  chains: [luksoMainnet, luksoTestnet] as const,
  transports: {
    [luksoMainnet.id]: http(luksoMainnet.rpcUrls.default.http[0]),
    [luksoTestnet.id]: http(luksoTestnet.rpcUrls.default.http[0]),
  },
});

// Setup queryClient
const queryClient = new QueryClient();

export default function WagmiProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
} 
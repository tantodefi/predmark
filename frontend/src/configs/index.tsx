"use client";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

import { cookieStorage, createStorage, http } from "@wagmi/core";
import { LUKSO_NETWORKS } from "@/constants";

// Get projectId at https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) throw new Error("Project ID is not defined");

// Convert LUKSO networks to appropriate format
const luksoMainnet = {
  id: parseInt(LUKSO_NETWORKS.MAINNET.chainId, 16),
  name: LUKSO_NETWORKS.MAINNET.chainName,
  nativeCurrency: LUKSO_NETWORKS.MAINNET.nativeCurrency,
  rpcUrls: {
    default: { http: LUKSO_NETWORKS.MAINNET.rpcUrls },
    public: { http: LUKSO_NETWORKS.MAINNET.rpcUrls },
  },
  blockExplorers: {
    default: { name: "Explorer", url: LUKSO_NETWORKS.MAINNET.blockExplorerUrls[0] },
  },
};

const luksoTestnet = {
  id: parseInt(LUKSO_NETWORKS.TESTNET.chainId, 16),
  name: LUKSO_NETWORKS.TESTNET.chainName,
  nativeCurrency: LUKSO_NETWORKS.TESTNET.nativeCurrency,
  rpcUrls: {
    default: { http: LUKSO_NETWORKS.TESTNET.rpcUrls },
    public: { http: LUKSO_NETWORKS.TESTNET.rpcUrls },
  },
  blockExplorers: {
    default: { name: "Explorer", url: LUKSO_NETWORKS.TESTNET.blockExplorerUrls[0] },
  },
};

// Create wagmiConfig
const networks = [luksoMainnet, luksoTestnet];

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});

export const config = wagmiAdapter.wagmiConfig;

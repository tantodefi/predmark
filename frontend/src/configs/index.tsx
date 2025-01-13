"use client";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

import { cookieStorage, createStorage, http } from "@wagmi/core";
import { morphHolesky } from "@reown/appkit/networks";

// Get projectId at https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) throw new Error("Project ID is not defined");

// Create wagmiConfig
const networks = [morphHolesky];

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});

export const config = wagmiAdapter.wagmiConfig;

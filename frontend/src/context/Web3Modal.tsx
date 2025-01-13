"use client";

import React, { ReactNode } from "react";
import { wagmiAdapter, projectId } from "@/configs";
import { morphHolesky } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";

// Setup queryClient
const queryClient = new QueryClient();

if (!projectId) throw new Error("Project ID is not defined");

// Set up metadata
const metadata = {
  name: "appkit-example",
  description: "AppKit Example",
  url: "https://appkitexampleapp.com", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [morphHolesky],
  defaultNetwork: morphHolesky,
  metadata: metadata,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
});

function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;

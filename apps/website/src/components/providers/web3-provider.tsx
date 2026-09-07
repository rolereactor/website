"use client";

import * as React from "react";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  bsc,
  sepolia,
  type AppKitNetwork,
} from "@reown/appkit/networks";

// Suppress non-actionable empty object errors logged by @walletconnect/core pino logger
if (typeof window !== "undefined") {
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      args.length === 1 &&
      typeof args[0] === "object" &&
      args[0] !== null &&
      Object.keys(args[0]).length === 0
    ) {
      return;
    }
    if (
      args.some(
        (arg) =>
          typeof arg === "string" &&
          (arg.includes("[Reown Config]") || arg.includes("@walletconnect"))
      )
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

// NOTE: Every dApp that relies on WalletConnect needs a projectId
// from WalletConnect Cloud (https://cloud.reown.com/).
const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ||
  "8053131e37af1718bc074ab6ae6827d4";

const allowTestnet =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_ALLOW_TESTNET === "true";
const networks = (allowTestnet
  ? [mainnet, polygon, optimism, arbitrum, base, bsc, sepolia]
  : [mainnet, polygon, optimism, arbitrum, base, bsc]) as unknown as [
  AppKitNetwork,
  ...AppKitNetwork[],
];

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  ssr: true,
});

// 2. Setup query client
const queryClient = new QueryClient();

// 3. Create AppKit
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: "Role Reactor",
    description: "Role Reactor",
    url: "https://rolereactor.xyz",
    icons: ["https://rolereactor.xyz/logo.png"],
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#0891b2", // cyan-600
    "--w3m-border-radius-master": "2px",
    "--w3m-font-family": "inherit",
  },
  features: {
    email: false,
    socials: false,
  },
});

import { GlobalPaymentRecovery } from "../crypto/global-payment-recovery";

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
        <GlobalPaymentRecovery />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

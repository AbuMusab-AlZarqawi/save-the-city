import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

// Define Ritual Chain Testnet
export const ritualChain = defineChain({
  id: 1979,
  name: "Ritual Chain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "RITUAL",
    symbol: "RITUAL",
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RITUAL_RPC_URL || "https://rpc.ritualfoundation.org"],
    },
  },
  blockExplorers: {
    default: {
      name: "Ritual Explorer",
      url: "https://explorer.ritualfoundation.org",
    },
  },
  testnet: true,
});

export const wagmiConfig = getDefaultConfig({
  appName: "Save The City",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "placeholder-project-id",
  chains: [ritualChain],
  ssr: true,
});

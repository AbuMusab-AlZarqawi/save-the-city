"use client";

import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import { Cinzel, Rajdhani, Share_Tech_Mono } from "next/font/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { wagmiConfig, ritualChain } from "@/lib/wagmi";
import AudioPlayer from "@/components/AudioPlayer";
import { useState } from "react";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "600", "700", "900"],
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  variable: "--font-rajdhani",
  weight: ["300", "400", "500", "600", "700"],
});

const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  variable: "--font-share-tech-mono",
  weight: "400",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${rajdhani.variable} ${shareTechMono.variable}`}
    >
      <head>
        <title>Save The City | Onchain AI Game on Ritual Chain</title>
        <meta
          name="description"
          content="An onchain AI game powered by Ritual Chain's native LLM precompile. Choose your hero and save the city — every story is permanently recorded onchain."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-ash text-white font-body antialiased">
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider
              theme={darkTheme({
                accentColor: "#c9a227",
                accentColorForeground: "#000",
                borderRadius: "medium",
                fontStack: "system",
              })}
              initialChain={ritualChain}
            >
              {children}
              <AudioPlayer />
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}

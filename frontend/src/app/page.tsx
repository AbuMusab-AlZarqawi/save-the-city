"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion, AnimatePresence } from "framer-motion";
import HeroSelect from "@/components/HeroSelect";
import ThreatReveal from "@/components/ThreatReveal";
import StoryDisplay from "@/components/StoryDisplay";
import RecentSaves from "@/components/RecentSaves";
import HeroStats from "@/components/HeroStats";
import { getRandomScenario } from "@/lib/scenarios";

type GamePhase = "idle" | "threat" | "hero-select" | "playing" | "result";

export interface GameState {
  scenario: string;
  heroId: number | null;
  story: string | null;
  txHash: string | null;
  gameNumber: number | null;
}

export default function Home() {
  const { isConnected } = useAccount();
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [gameState, setGameState] = useState<GameState>({
    scenario: "",
    heroId: null,
    story: null,
    txHash: null,
    gameNumber: null,
  });
  const [refreshFeed, setRefreshFeed] = useState(0);

  // Fire ember particles
  const [embers, setEmbers] = useState<{ id: number; x: number; size: number; duration: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEmbers((prev) => {
        const newEmber = {
          id: Date.now(),
          x: Math.random() * 100,
          size: Math.random() * 4 + 2,
          duration: Math.random() * 3 + 2,
        };
        return [...prev.slice(-15), newEmber];
      });
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const startNewGame = () => {
    const scenario = getRandomScenario();
    setGameState({
      scenario,
      heroId: null,
      story: null,
      txHash: null,
      gameNumber: null,
    });
    setPhase("threat");
  };

  const onThreatRevealed = () => {
    setTimeout(() => setPhase("hero-select"), 500);
  };

  const onHeroSelected = (heroId: number) => {
    setGameState((prev) => ({ ...prev, heroId }));
    setPhase("playing");
  };

  const onGameComplete = (story: string, txHash: string, gameNumber: number) => {
    setGameState((prev) => ({ ...prev, story, txHash, gameNumber }));
    setPhase("result");
    setRefreshFeed((n) => n + 1);
  };

  const onPlayAgain = () => {
    setPhase("idle");
  };

  return (
    <main className="city-grid-bg scanlines min-h-screen relative overflow-hidden">
      {/* Ember particles */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {embers.map((ember) => (
          <div
            key={ember.id}
            className="ember"
            style={{
              left: `${ember.x}%`,
              bottom: "0",
              width: `${ember.size}px`,
              height: `${ember.size}px`,
              animationDuration: `${ember.duration}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      {/* City skyline at bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-40 city-skyline opacity-40 z-0 pointer-events-none" />

      {/* Red alert overlay when game active */}
      <AnimatePresence>
        {(phase === "threat" || phase === "hero-select") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-5"
            style={{
              background:
                "radial-gradient(ellipse at top, rgba(255,45,45,0.08) 0%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="relative z-20 border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-danger rounded-sm flex items-center justify-center">
              <span className="text-white font-display font-black text-sm">⚡</span>
            </div>
            <div>
              <h1 className="font-display font-black text-xl tracking-widest gold-shimmer">
                SAVE THE CITY
              </h1>
              <p className="font-mono text-xs text-gold/60 tracking-widest">
                RITUAL CHAIN · ONCHAIN AI GAME
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <HeroStats />
            <ConnectButton
              showBalance={false}
              chainStatus="none"
              accountStatus="avatar"
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">

          {/* IDLE: Landing screen */}
          {phase === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              {/* Hero title */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="mb-2"
              >
                <span className="font-mono text-danger/80 tracking-[0.5em] text-sm uppercase">
                  ⚠ EMERGENCY ALERT ⚠
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-display font-black text-5xl md:text-7xl text-white mb-4 leading-none tracking-tight"
              >
                THE CITY
                <br />
                <span className="text-glow-danger text-danger">NEEDS YOU</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="font-body text-white/60 text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
              >
                A catastrophic threat has emerged. An AI oracle will reveal the danger.
                Choose your hero. Your story is written onchain — permanent, immutable, yours.
                <br />
                <span className="text-gold font-semibold">Each save costs 0.01 RITUAL.</span>
              </motion.p>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-8 mb-10 font-mono text-sm text-white/40"
              >
                <span>⛓ ONCHAIN AI</span>
                <span className="text-gold/30">|</span>
                <span>🔒 TEE VERIFIED</span>
                <span className="text-gold/30">|</span>
                <span>♾ PERMANENT RECORD</span>
              </motion.div>

              {/* CTA */}
              {!isConnected ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col items-center gap-4"
                >
                  <p className="text-white/40 font-body text-sm mb-2">
                    Connect your wallet to play
                  </p>
                  <ConnectButton />
                </motion.div>
              ) : (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={startNewGame}
                  className="relative px-12 py-5 font-display font-bold text-xl tracking-widest text-black bg-gold border-2 border-gold hover:bg-yellow-400 transition-colors duration-200 uppercase"
                  style={{
                    clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                  }}
                >
                  RECEIVE DISTRESS SIGNAL
                </motion.button>
              )}

              {/* Recent saves feed */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-16"
              >
                <RecentSaves refreshTrigger={refreshFeed} />
              </motion.div>
            </motion.div>
          )}

          {/* THREAT REVEAL */}
          {phase === "threat" && (
            <motion.div
              key="threat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ThreatReveal
                scenario={gameState.scenario}
                onComplete={onThreatRevealed}
              />
            </motion.div>
          )}

          {/* HERO SELECT */}
          {phase === "hero-select" && (
            <motion.div
              key="hero-select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <HeroSelect
                scenario={gameState.scenario}
                onSelect={onHeroSelected}
              />
            </motion.div>
          )}

          {/* PLAYING / RESULT */}
          {(phase === "playing" || phase === "result") && (
            <motion.div
              key="story"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <StoryDisplay
                gameState={gameState}
                phase={phase}
                onGameComplete={onGameComplete}
                onPlayAgain={onPlayAgain}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}

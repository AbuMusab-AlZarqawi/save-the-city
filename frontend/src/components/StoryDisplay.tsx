"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { parseEther, decodeEventLog } from "viem";
import { SAVE_THE_CITY_ABI, CONTRACT_ADDRESS } from "@/lib/contract";
import { HEROES } from "@/lib/heroes";
import { GameState } from "@/app/page";

interface StoryDisplayProps {
  gameState: GameState;
  phase: "playing" | "result";
  onGameComplete: (story: string, txHash: string, gameNumber: number) => void;
  onPlayAgain: () => void;
}

export default function StoryDisplay({
  gameState,
  phase,
  onGameComplete,
  onPlayAgain,
}: StoryDisplayProps) {
  const { scenario, heroId, story, txHash } = gameState;
  const hero = heroId !== null ? HEROES[heroId] : null;
  const [displayedStory, setDisplayedStory] = useState("");
  const [storyDone, setStoryDone] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Preparing deployment...");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const hasFired = useRef(false);
  const publicClient = usePublicClient();

  const { writeContract, data: writeTxHash, error: writeError } = useWriteContract();

  const { data: receipt, isLoading: isMining } = useWaitForTransactionReceipt({
    hash: writeTxHash,
  });

  // Fire transaction on mount
  useEffect(() => {
    if (hasFired.current || heroId === null) return;
    hasFired.current = true;

    setTimeout(() => {
      setStatusMsg("Confirm transaction in MetaMask...");
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: SAVE_THE_CITY_ABI,
        functionName: "playGame",
        args: [heroId, scenario],
        value: parseEther("0.01"),
      });
    }, 800);
  }, [heroId, scenario, writeContract]);

  // Handle write error
  useEffect(() => {
    if (writeError) {
      setErrorMsg(writeError.message.includes("User rejected")
        ? "Transaction rejected. Hit Play Again to try."
        : `Error: ${writeError.message.slice(0, 100)}`
      );
    }
  }, [writeError]);

  // Handle receipt
  useEffect(() => {
    if (!receipt || !publicClient) return;
    setStatusMsg("Decoding onchain story...");

    try {
      // Find the GamePlayed event in the receipt
      let story = "";
      let gameNumber = 0;

      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: SAVE_THE_CITY_ABI,
            data: log.data,
            topics: log.topics,
            eventName: "GamePlayed",
          });
          story = decoded.args.story as string;
          gameNumber = Number(decoded.args.gameNumber);
          break;
        } catch {
          // not this log
        }
      }

      if (story) {
        onGameComplete(story, receipt.transactionHash, gameNumber);
      } else {
        setErrorMsg("Story not found in transaction — the LLM precompile may still be warming up on testnet.");
      }
    } catch (err) {
      setErrorMsg("Failed to decode story from transaction.");
    }
  }, [receipt, publicClient, onGameComplete]);

  // Status messages while mining
  useEffect(() => {
    if (!writeTxHash || receipt) return;
    const msgs = [
      "Transaction submitted to Ritual Chain...",
      "LLM precompile processing your request inside TEE...",
      "AI is generating your unique story onchain...",
      "Story being cryptographically sealed...",
      "Waiting for block confirmation...",
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % msgs.length;
      setStatusMsg(msgs[i]);
    }, 3000);
    return () => clearInterval(interval);
  }, [writeTxHash, receipt]);

  // Animate story text
  useEffect(() => {
    if (!story) return;
    let i = 0;
    setDisplayedStory("");
    setStoryDone(false);
    const interval = setInterval(() => {
      if (i < story.length) {
        setDisplayedStory(story.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setStoryDone(true);
      }
    }, 22);
    return () => clearInterval(interval);
  }, [story]);

  if (!hero) return null;

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Hero header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <div
          className="relative w-20 h-20 rounded-sm overflow-hidden border-2 flex-shrink-0"
          style={{ borderColor: hero.color, boxShadow: `0 0 20px ${hero.glowColor}` }}
        >
          <Image
            src={hero.image}
            alt={hero.name}
            fill
            className="object-cover object-top"
          />
        </div>
        <div>
          <p className="font-mono text-xs tracking-widest text-white/40 uppercase mb-1">
            Hero Dispatched
          </p>
          <h2
            className="font-display font-black text-3xl"
            style={{ color: hero.color, textShadow: `0 0 15px ${hero.glowColor}` }}
          >
            {hero.name}
          </h2>
          <p className="font-mono text-xs text-white/40">{hero.title}</p>
        </div>
        <div className="ml-auto text-right hidden md:block">
          <p className="font-mono text-xs text-white/30">THREAT LEVEL</p>
          <p className="font-display text-danger font-black text-2xl">CRITICAL</p>
        </div>
      </motion.div>

      {/* Scenario */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="border border-danger/20 bg-black/40 p-4 mb-8"
      >
        <p className="font-mono text-xs text-danger/60 tracking-widest mb-2">ACTIVE THREAT</p>
        <p className="font-body text-white/70 text-sm leading-relaxed">{scenario}</p>
      </motion.div>

      {/* Story / Loading area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="relative border-2 p-8"
        style={{
          borderColor: phase === "result" ? `${hero.color}80` : "rgba(255,45,45,0.3)",
          background:
            phase === "result"
              ? `linear-gradient(135deg, ${hero.glowColor}10 0%, rgba(0,0,0,0.8) 100%)`
              : "rgba(0,0,0,0.6)",
          boxShadow: phase === "result" ? `0 0 40px ${hero.glowColor}30` : "none",
        }}
      >
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2" style={{ borderColor: hero.color }} />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2" style={{ borderColor: hero.color }} />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2" style={{ borderColor: hero.color }} />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2" style={{ borderColor: hero.color }} />

        <AnimatePresence mode="wait">
          {phase === "playing" && !errorMsg && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              {/* Animated orb */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div
                  className="absolute inset-0 rounded-full border-2 spin"
                  style={{ borderColor: `${hero.color}40`, borderTopColor: hero.color }}
                />
                <div
                  className="absolute inset-2 rounded-full border spin"
                  style={{
                    borderColor: `${hero.color}20`,
                    borderBottomColor: hero.color,
                    animationDirection: "reverse",
                    animationDuration: "0.7s",
                  }}
                />
                <div
                  className="absolute inset-0 flex items-center justify-center text-2xl"
                >
                  ⚡
                </div>
              </div>

              <p
                className="font-mono text-sm tracking-widest"
                style={{ color: hero.color }}
              >
                {statusMsg}
              </p>
              <p className="font-mono text-xs text-white/30 mt-2">
                AI inference runs onchain inside TEE
              </p>
            </motion.div>
          )}

          {errorMsg && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <p className="text-danger font-body mb-4">{errorMsg}</p>
              <button
                onClick={onPlayAgain}
                className="px-8 py-3 font-display font-bold text-sm tracking-widest border border-gold text-gold hover:bg-gold hover:text-black transition-colors"
              >
                PLAY AGAIN
              </button>
            </motion.div>
          )}

          {phase === "result" && story && (
            <motion.div
              key="story"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p
                className="font-mono text-xs tracking-widest mb-4"
                style={{ color: hero.color }}
              >
                ⚡ ONCHAIN STORY — TEE VERIFIED
              </p>
              <p className="font-body text-white text-lg leading-relaxed">
                {displayedStory}
                {!storyDone && (
                  <span
                    className="inline-block w-0.5 h-5 ml-1 align-middle"
                    style={{
                      backgroundColor: hero.color,
                      animation: "alertFlicker 0.6s ease-in-out infinite",
                    }}
                  />
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Result footer */}
      {phase === "result" && storyDone && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          {/* Onchain proof */}
          <div className="border border-white/10 bg-black/40 p-4 mb-6">
            <p className="font-mono text-xs text-white/30 tracking-widest mb-2">
              PERMANENT ONCHAIN RECORD
            </p>
            {txHash && (
              <p className="font-mono text-xs text-gold/70 break-all">
                TX: {txHash}
              </p>
            )}
            {gameState.gameNumber && (
              <p className="font-mono text-xs text-white/40 mt-1">
                Save #{gameState.gameNumber}
              </p>
            )}
          </div>

          {/* Victory banner */}
          <div
            className="text-center border-2 py-6 mb-6"
            style={{
              borderColor: hero.color,
              boxShadow: `0 0 30px ${hero.glowColor}`,
              background: `linear-gradient(135deg, ${hero.glowColor}20, transparent)`,
            }}
          >
            <p className="font-display font-black text-3xl text-white mb-1">
              🏙 CITY SAVED
            </p>
            <p className="font-mono text-sm" style={{ color: hero.color }}>
              {hero.name} is the hero this city deserved.
            </p>
          </div>

          {/* Play again */}
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={onPlayAgain}
              className="px-12 py-4 font-display font-bold text-lg tracking-widest text-black bg-gold border-2 border-gold hover:bg-yellow-400 transition-colors uppercase"
              style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
            >
              NEW THREAT INCOMING →
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

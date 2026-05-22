"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { decodeEventLog } from "viem";
import { SAVE_THE_CITY_ABI, CONTRACT_ADDRESS } from "@/lib/contract";
import { HEROES } from "@/lib/heroes";
import { GameState } from "@/app/page";

interface StoryDisplayProps {
  gameState: GameState;
  phase: "playing" | "result";
  onGameComplete: (story: string, txHash: string, gameNumber: number) => void;
  onPlayAgain: () => void;
}

type Step = "generating" | "confirm-tx" | "mining" | "done" | "error";

export default function StoryDisplay({
  gameState,
  phase,
  onGameComplete,
  onPlayAgain,
}: StoryDisplayProps) {
  const { scenario, heroId, story, txHash } = gameState;
  const hero = heroId !== null ? HEROES[heroId] : null;

  const [step, setStep] = useState<Step>("generating");
  const [generatedStory, setGeneratedStory] = useState<string>("");
  const [displayedStory, setDisplayedStory] = useState("");
  const [storyDone, setStoryDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("Summoning the AI oracle...");
  const hasFired = useRef(false);

  const { writeContract, data: writeTxHash, error: writeError } = useWriteContract();
  const { data: receipt } = useWaitForTransactionReceipt({ hash: writeTxHash });

  // ── Step 1: Call the API route to generate the story ──────────────────────
  useEffect(() => {
    if (hasFired.current || heroId === null) return;
    hasFired.current = true;

    const generate = async () => {
      try {
        setStep("generating");
        setStatusMsg("AI is writing your hero's story...");

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ heroId, scenario }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Generation failed");
        }

        const { story } = await res.json();
        setGeneratedStory(story);

        // Step 2: Now submit to chain
        setStep("confirm-tx");
        setStatusMsg("Story ready! Confirm the transaction in MetaMask to save it onchain...");

        writeContract({
          address: CONTRACT_ADDRESS,
          abi: SAVE_THE_CITY_ABI,
          functionName: "playGame",
          args: [heroId, scenario, story],
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setErrorMsg(message);
        setStep("error");
      }
    };

    generate();
  }, [heroId, scenario, writeContract]);

  // ── Handle write error (user rejected etc) ────────────────────────────────
  useEffect(() => {
    if (!writeError) return;
    const msg = writeError.message;
    if (msg.includes("User rejected") || msg.includes("user rejected")) {
      setErrorMsg("Transaction rejected. Your story was generated but not saved onchain. Hit Play Again to retry.");
    } else {
      setErrorMsg(`Transaction error: ${msg.slice(0, 120)}`);
    }
    setStep("error");
  }, [writeError]);

  // ── Step 3: Wait for mining ───────────────────────────────────────────────
  useEffect(() => {
    if (!writeTxHash || receipt) return;
    setStep("mining");
    setStatusMsg("Transaction submitted — saving your story to Ritual Chain...");
  }, [writeTxHash, receipt]);

  // ── Step 4: Receipt confirmed ─────────────────────────────────────────────
  useEffect(() => {
    if (!receipt) return;

    let gameNumber = 0;
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: SAVE_THE_CITY_ABI,
          data: log.data,
          topics: log.topics,
          eventName: "GamePlayed",
        });
        gameNumber = Number(decoded.args.gameNumber);
        break;
      } catch {
        // not this log
      }
    }

    setStep("done");
    onGameComplete(generatedStory, receipt.transactionHash, gameNumber);
  }, [receipt, generatedStory, onGameComplete]);

  // ── Typewriter for story reveal ───────────────────────────────────────────
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

  const stepLabel: Record<Step, string> = {
    generating: "🤖 AI generating story...",
    "confirm-tx": "✍️ Confirm in MetaMask...",
    mining: "⛓ Saving to Ritual Chain...",
    done: "✅ Saved onchain!",
    error: "❌ Error",
  };

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
          <Image src={hero.image} alt={hero.name} fill className="object-cover object-top" />
        </div>
        <div>
          <p className="font-mono text-xs tracking-widest text-white/40 uppercase mb-1">Hero Dispatched</p>
          <h2 className="font-display font-black text-3xl" style={{ color: hero.color, textShadow: `0 0 15px ${hero.glowColor}` }}>
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

      {/* Progress steps — shown while playing */}
      {phase === "playing" && !errorMsg && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border border-white/10 bg-black/40 p-4 mb-6"
        >
          <div className="flex flex-col gap-3">
            {(["generating", "confirm-tx", "mining", "done"] as Step[]).map((s, i) => {
              const stepOrder = ["generating", "confirm-tx", "mining", "done"];
              const currentIndex = stepOrder.indexOf(step);
              const thisIndex = stepOrder.indexOf(s);
              const isDone = thisIndex < currentIndex || step === "done";
              const isActive = s === step;

              return (
                <div key={s} className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{
                      borderColor: isDone ? hero.color : isActive ? hero.color : "rgba(255,255,255,0.2)",
                      backgroundColor: isDone ? hero.color : "transparent",
                      color: isDone ? "#000" : isActive ? hero.color : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {isDone ? "✓" : i + 1}
                  </div>
                  <span
                    className="font-mono text-xs tracking-wide"
                    style={{
                      color: isDone ? hero.color : isActive ? "white" : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {stepLabel[s]}
                    {isActive && <span className="ml-2 animate-pulse">●</span>}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="font-mono text-xs text-white/40 mt-4 border-t border-white/10 pt-3">
            {statusMsg}
          </p>
        </motion.div>
      )}

      {/* Story / Error box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="relative border-2 p-8"
        style={{
          borderColor: phase === "result" ? `${hero.color}80` : errorMsg ? "rgba(255,45,45,0.4)" : "rgba(255,255,255,0.1)",
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
          {/* Loading spinner while generating */}
          {phase === "playing" && !errorMsg && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
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
                <div className="absolute inset-0 flex items-center justify-center text-2xl">⚡</div>
              </div>
              <p className="font-mono text-sm tracking-widest" style={{ color: hero.color }}>
                {step === "generating" ? "AI crafting your story..." : step === "confirm-tx" ? "Check MetaMask now ↗" : "Confirming onchain..."}
              </p>
            </motion.div>
          )}

          {/* Error state */}
          {errorMsg && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <p className="text-danger font-body mb-2 text-sm leading-relaxed">{errorMsg}</p>
              {generatedStory && (
                <div className="mt-4 mb-6 text-left border border-white/10 p-4">
                  <p className="font-mono text-xs text-white/30 mb-2">YOUR GENERATED STORY (not yet saved):</p>
                  <p className="font-body text-white/70 text-sm leading-relaxed">{generatedStory}</p>
                </div>
              )}
              <button
                onClick={onPlayAgain}
                className="px-8 py-3 font-display font-bold text-sm tracking-widest border border-gold text-gold hover:bg-gold hover:text-black transition-colors"
              >
                PLAY AGAIN
              </button>
            </motion.div>
          )}

          {/* Story reveal */}
          {phase === "result" && story && (
            <motion.div key="story" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="font-mono text-xs tracking-widest mb-4" style={{ color: hero.color }}>
                ⚡ ONCHAIN STORY — PERMANENT RECORD
              </p>
              <p className="font-body text-white text-lg leading-relaxed">
                {displayedStory}
                {!storyDone && (
                  <span
                    className="inline-block w-0.5 h-5 ml-1 align-middle"
                    style={{ backgroundColor: hero.color, animation: "alertFlicker 0.6s ease-in-out infinite" }}
                  />
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Result footer */}
      {phase === "result" && storyDone && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8">
          <div className="border border-white/10 bg-black/40 p-4 mb-6">
            <p className="font-mono text-xs text-white/30 tracking-widest mb-2">PERMANENT ONCHAIN RECORD</p>
            {txHash && <p className="font-mono text-xs text-gold/70 break-all">TX: {txHash}</p>}
            {gameState.gameNumber && (
              <p className="font-mono text-xs text-white/40 mt-1">Save #{gameState.gameNumber}</p>
            )}
          </div>

          <div
            className="text-center border-2 py-6 mb-6"
            style={{
              borderColor: hero.color,
              boxShadow: `0 0 30px ${hero.glowColor}`,
              background: `linear-gradient(135deg, ${hero.glowColor}20, transparent)`,
            }}
          >
            <p className="font-display font-black text-3xl text-white mb-1">🏙 CITY SAVED</p>
            <p className="font-mono text-sm" style={{ color: hero.color }}>
              {hero.name} is the hero this city deserved.
            </p>
          </div>

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

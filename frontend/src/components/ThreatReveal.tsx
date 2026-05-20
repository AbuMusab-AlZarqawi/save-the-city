"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ThreatRevealProps {
  scenario: string;
  onComplete: () => void;
}

export default function ThreatReveal({ scenario, onComplete }: ThreatRevealProps) {
  const [displayText, setDisplayText] = useState("");
  const [done, setDone] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    let i = 0;
    setDisplayText("");
    setDone(false);
    setShowButton(false);

    // Small delay before starting
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < scenario.length) {
          setDisplayText(scenario.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          setDone(true);
          setTimeout(() => setShowButton(true), 500);
        }
      }, 28);
      return () => clearInterval(interval);
    }, 600);

    return () => clearTimeout(startTimeout);
  }, [scenario]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      {/* ALERT header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div
          className="inline-block border border-danger/60 px-6 py-2 mb-4 danger-pulse"
          style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
        >
          <span className="font-mono text-danger tracking-[0.4em] text-sm font-bold alert-flicker">
            ⚠ INCOMING THREAT DETECTED ⚠
          </span>
        </div>

        <h2 className="font-display font-black text-4xl md:text-5xl text-white tracking-tight">
          CITY UNDER <span className="text-glow-danger text-danger">ATTACK</span>
        </h2>
      </motion.div>

      {/* Scenario text box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="relative max-w-3xl w-full"
      >
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-danger" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-danger" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-danger" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-danger" />

        <div
          className="border border-danger/30 bg-black/60 backdrop-blur-sm p-8 md:p-12"
          style={{ background: "linear-gradient(135deg, rgba(20,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)" }}
        >
          <p className="font-body text-xl md:text-2xl text-white/90 leading-relaxed min-h-[4rem]">
            {displayText}
            {!done && (
              <span
                className="inline-block w-0.5 h-6 bg-danger ml-1 align-middle"
                style={{ animation: "alertFlicker 0.7s ease-in-out infinite" }}
              />
            )}
          </p>
        </div>
      </motion.div>

      {/* Proceed button */}
      {showButton && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10"
        >
          <p className="font-mono text-white/40 text-sm mb-4 tracking-widest">
            THE CITY CALLS FOR A HERO
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={onComplete}
            className="px-10 py-4 font-display font-bold text-lg tracking-widest text-black bg-danger border-2 border-danger hover:bg-red-400 transition-colors uppercase"
            style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
          >
            RESPOND TO THREAT →
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

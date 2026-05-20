"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [showVolume, setShowVolume] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Create audio element once on mount
  useEffect(() => {
    const audio = new Audio("/theme.mp3");
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    // Autoplay as soon as the user interacts with the page (browser policy)
    const handleFirstInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        audio.play().then(() => setPlaying(true)).catch(() => {});
        window.removeEventListener("click", handleFirstInteraction);
        window.removeEventListener("keydown", handleFirstInteraction);
      }
    };

    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);

    return () => {
      audio.pause();
      audio.src = "";
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
      {/* Volume slider — appears on hover */}
      <AnimatePresence>
        {showVolume && (
          <motion.div
            initial={{ opacity: 0, x: 10, width: 0 }}
            animate={{ opacity: 1, x: 0, width: "100px" }}
            exit={{ opacity: 0, x: 10, width: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 border border-gold/30 bg-black/80 backdrop-blur-sm px-3 py-2">
              <span className="text-gold/50 text-xs">🔈</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolume}
                onClick={(e) => e.stopPropagation()}
                className="w-full accent-gold cursor-pointer"
                style={{ accentColor: "#c9a227" }}
              />
              <span className="text-gold/50 text-xs">🔊</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Play / Pause button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={togglePlay}
        onMouseEnter={() => setShowVolume(true)}
        onMouseLeave={() => setShowVolume(false)}
        className="relative w-12 h-12 border-2 border-gold/60 bg-black/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group"
        style={{
          clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)",
          boxShadow: playing ? "0 0 20px rgba(201,162,39,0.4)" : "none",
          borderColor: playing ? "#c9a227" : "rgba(201,162,39,0.4)",
        }}
        title={playing ? "Pause music" : "Play music"}
      >
        {/* Pulse ring when playing */}
        {playing && (
          <motion.div
            className="absolute inset-0 border-2 border-gold/30"
            animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />
        )}

        {/* Icon */}
        <span className="text-gold text-lg">
          {playing ? "⏸" : "▶"}
        </span>
      </motion.button>

      {/* "Now playing" label — only when playing */}
      <AnimatePresence>
        {playing && !showVolume && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="absolute right-14 bottom-0 pointer-events-none"
          >
            <div className="border border-gold/20 bg-black/70 px-2 py-1 whitespace-nowrap">
              <p className="font-mono text-xs text-gold/60 tracking-widest">♪ THEME PLAYING</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
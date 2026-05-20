"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { HEROES } from "@/lib/heroes";

interface HeroSelectProps {
  scenario: string;
  onSelect: (heroId: number) => void;
}

export default function HeroSelect({ scenario, onSelect }: HeroSelectProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleSelect = (heroId: number) => {
    setSelectedId(heroId);
    setTimeout(() => onSelect(heroId), 600);
  };

  return (
    <div className="py-8">
      {/* Scenario reminder */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <p className="font-mono text-danger/70 text-xs tracking-widest mb-3">ACTIVE THREAT</p>
        <div
          className="inline-block border border-danger/30 bg-black/40 px-6 py-3 max-w-2xl"
        >
          <p className="font-body text-white/70 text-sm leading-relaxed">{scenario}</p>
        </div>
      </motion.div>

      {/* Choose heading */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-12"
      >
        <h2 className="font-display font-black text-3xl md:text-5xl text-white tracking-tight">
          CHOOSE YOUR <span className="text-glow-gold text-gold">CHAMPION</span>
        </h2>
        <p className="font-body text-white/40 text-sm mt-2 tracking-widest">
          0.01 RITUAL · ONE SHOT · PERMANENT ONCHAIN
        </p>
      </motion.div>

      {/* Hero cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {HEROES.map((hero, index) => {
          const isHovered = hoveredId === hero.id;
          const isSelected = selectedId === hero.id;
          const isOtherSelected = selectedId !== null && selectedId !== hero.id;

          return (
            <motion.div
              key={hero.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: isOtherSelected ? 0.3 : 1,
                y: 0,
                scale: isSelected ? 1.05 : 1,
              }}
              transition={{
                delay: index * 0.15,
                duration: 0.4,
                opacity: { duration: 0.2 },
              }}
              className="hero-card cursor-pointer"
              onMouseEnter={() => setHoveredId(hero.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => !selectedId && handleSelect(hero.id)}
            >
              <div
                className="relative border-2 bg-black/60 backdrop-blur-sm overflow-hidden transition-all duration-300"
                style={{
                  borderColor: isHovered || isSelected ? hero.color : `${hero.color}40`,
                  boxShadow: isHovered || isSelected
                    ? `0 0 30px ${hero.glowColor}, 0 0 60px ${hero.glowColor}50, inset 0 0 20px ${hero.glowColor}20`
                    : "none",
                  background: isHovered || isSelected
                    ? `linear-gradient(135deg, ${hero.glowColor}20 0%, rgba(0,0,0,0.8) 100%)`
                    : "rgba(0,0,0,0.6)",
                }}
              >
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2" style={{ borderColor: hero.color }} />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2" style={{ borderColor: hero.color }} />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2" style={{ borderColor: hero.color }} />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2" style={{ borderColor: hero.color }} />

                {/* Hero image */}
                <div className="relative w-full aspect-square overflow-hidden">
                  <Image
                    src={hero.image}
                    alt={hero.name}
                    fill
                    className="object-cover object-top transition-transform duration-500"
                    style={{
                      transform: isHovered ? "scale(1.05)" : "scale(1)",
                      filter: isHovered
                        ? `drop-shadow(0 0 20px ${hero.color})`
                        : "none",
                    }}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.9) 100%)`,
                    }}
                  />

                  {/* Selected overlay */}
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: `${hero.glowColor}30` }}
                    >
                      <span className="font-display font-black text-2xl text-white" style={{ textShadow: `0 0 20px ${hero.color}` }}>
                        DEPLOYING...
                      </span>
                    </motion.div>
                  )}
                </div>

                {/* Hero info */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3
                        className="font-display font-black text-2xl tracking-wide"
                        style={{ color: hero.color, textShadow: `0 0 10px ${hero.glowColor}` }}
                      >
                        {hero.name}
                      </h3>
                      <p className="font-mono text-xs tracking-widest text-white/40 uppercase">
                        {hero.title}
                      </p>
                    </div>
                    <div
                      className="w-2 h-2 rounded-full mt-2"
                      style={{
                        backgroundColor: hero.color,
                        boxShadow: `0 0 8px ${hero.color}`,
                        animation: isHovered ? "alertFlicker 0.8s infinite" : "none",
                      }}
                    />
                  </div>

                  <p className="font-body text-white/60 text-sm leading-relaxed mb-4">
                    {hero.description}
                  </p>

                  <div className="flex gap-3 text-xs font-mono">
                    <div className="flex-1 border border-white/10 px-2 py-1 text-center">
                      <div style={{ color: hero.color }} className="font-bold text-xs truncate">
                        {hero.power}
                      </div>
                      <div className="text-white/30 text-xs">POWER</div>
                    </div>
                    <div className="flex-1 border border-white/10 px-2 py-1 text-center">
                      <div className="text-danger/70 font-bold text-xs truncate">{hero.weakness}</div>
                      <div className="text-white/30 text-xs">WEAKNESS</div>
                    </div>
                  </div>

                  {/* Deploy button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-4 w-full py-3 font-display font-bold text-sm tracking-widest uppercase transition-all duration-200"
                    style={{
                      backgroundColor: isHovered ? hero.color : "transparent",
                      color: isHovered ? "#000" : hero.color,
                      border: `2px solid ${hero.color}`,
                      clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)",
                    }}
                  >
                    {isSelected ? "DEPLOYING →" : `DEPLOY ${hero.name.toUpperCase()}`}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

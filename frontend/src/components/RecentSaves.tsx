"use client";

import { useReadContract } from "wagmi";
import { motion } from "framer-motion";
import { SAVE_THE_CITY_ABI, CONTRACT_ADDRESS } from "@/lib/contract";
import { HEROES } from "@/lib/heroes";

interface GameRecord {
  player: string;
  heroId: number;
  heroName: string;
  scenario: string;
  story: string;
  timestamp: bigint;
  gameNumber: bigint;
}

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function timeAgo(timestamp: bigint) {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - Number(timestamp);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function RecentSaves({ refreshTrigger }: { refreshTrigger: number }) {
  const { data: recentGames, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SAVE_THE_CITY_ABI,
    functionName: "getRecentGames",
    args: [BigInt(5)],
    query: {
      refetchInterval: 15000,
      // Force refresh when refreshTrigger changes
    },
  });

  const { data: totalGames } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SAVE_THE_CITY_ABI,
    functionName: "getTotalGames",
  });

  const games = (recentGames as GameRecord[] | undefined) || [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-bold text-xl text-white tracking-wide">
            RECENT <span className="text-gold">SAVES</span>
          </h3>
          <p className="font-mono text-xs text-white/30 tracking-widest">
            LIVE FROM RITUAL CHAIN
          </p>
        </div>
        {totalGames !== undefined && (
          <div className="text-right">
            <p className="font-display font-black text-2xl text-gold">{totalGames.toString()}</p>
            <p className="font-mono text-xs text-white/30">TOTAL SAVES</p>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div
            className="inline-block w-6 h-6 border-2 border-gold/40 border-t-gold rounded-full spin"
          />
          <p className="font-mono text-xs text-white/30 mt-3">Loading onchain data...</p>
        </div>
      )}

      {!isLoading && games.length === 0 && (
        <div className="border border-white/10 bg-black/30 p-8 text-center">
          <p className="font-body text-white/40">
            No saves recorded yet. Be the first hero!
          </p>
        </div>
      )}

      {games.length > 0 && (
        <div className="space-y-3">
          {[...games].reverse().map((game, i) => {
            const hero = HEROES[game.heroId] || HEROES[0];
            return (
              <motion.div
                key={`${game.gameNumber}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="border border-white/10 bg-black/40 p-4 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Game number */}
                  <div className="flex-shrink-0 text-center">
                    <div
                      className="font-display font-black text-lg"
                      style={{ color: hero.color }}
                    >
                      #{game.gameNumber.toString()}
                    </div>
                    <div className="font-mono text-xs text-white/30">
                      {timeAgo(game.timestamp)}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-px self-stretch bg-white/10 flex-shrink-0" />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className="font-display font-bold text-sm"
                        style={{ color: hero.color }}
                      >
                        {game.heroName}
                      </span>
                      <span className="font-mono text-xs text-white/30">saved by</span>
                      <span className="font-mono text-xs text-white/50">
                        {shortenAddress(game.player)}
                      </span>
                    </div>
                    <p className="font-body text-white/40 text-xs leading-relaxed mb-1 line-clamp-1">
                      Threat: {game.scenario}
                    </p>
                    <p className="font-body text-white/70 text-sm leading-relaxed line-clamp-2">
                      {game.story}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

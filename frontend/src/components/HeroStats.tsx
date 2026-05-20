"use client";

import { useReadContract } from "wagmi";
import { SAVE_THE_CITY_ABI, CONTRACT_ADDRESS } from "@/lib/contract";
import { HEROES } from "@/lib/heroes";

export default function HeroStats() {
  const { data } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SAVE_THE_CITY_ABI,
    functionName: "getHeroStats",
    query: { refetchInterval: 30000 },
  });

  const counts = data as [bigint, bigint, bigint] | undefined;
  if (!counts) return null;

  const total = counts[0] + counts[1] + counts[2];
  if (total === BigInt(0)) return null;

  return (
    <div className="hidden md:flex items-center gap-3">
      {HEROES.map((hero, i) => {
        const count = counts[i];
        const pct = total > BigInt(0) ? Math.round((Number(count) / Number(total)) * 100) : 0;
        return (
          <div key={hero.id} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: hero.color, boxShadow: `0 0 6px ${hero.color}` }}
            />
            <span
              className="font-mono text-xs"
              style={{ color: hero.color }}
            >
              {hero.name} {pct}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

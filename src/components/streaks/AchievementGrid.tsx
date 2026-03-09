"use client";

import { useState, useEffect } from "react";
import { getAchievements, type Achievement } from "@/lib/storage";
import { Sprout, Flame, Dumbbell, Zap, Trophy, Crown, Target, Lock } from "lucide-react";

const ACHIEVEMENT_ICONS: Record<string, typeof Flame> = {
  seedling: Sprout,
  flame: Flame,
  biceps: Dumbbell,
  zap: Zap,
  trophy: Trophy,
  crown: Crown,
  target: Target,
};

export function AchievementGrid() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setAchievements(getAchievements());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Achievements
        </h3>
        <span className="text-xs text-muted-foreground">
          {unlockedCount}/{achievements.length} unlocked
        </span>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {achievements.map((achievement) => {
          const Icon = ACHIEVEMENT_ICONS[achievement.icon] || Target;
          return (
            <div
              key={achievement.id}
              className="flex flex-col items-center gap-1"
              title={`${achievement.name} — ${achievement.description}`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  achievement.unlocked
                    ? "bg-accent/15 text-accent"
                    : "bg-muted text-muted-foreground/30"
                }`}
              >
                {achievement.unlocked ? (
                  <Icon className="w-5 h-5" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </div>
              <span className={`text-[9px] font-medium text-center leading-tight ${
                achievement.unlocked ? "text-foreground" : "text-muted-foreground/50"
              }`}>
                {achievement.requirement}d
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

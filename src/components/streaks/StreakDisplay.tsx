"use client";

import { useState, useEffect, useRef } from "react";
import { getCurrentStreak, getLongestStreak } from "@/lib/storage";
import { Flame } from "lucide-react";

interface StreakDisplayProps {
  compact?: boolean;
}

export function StreakDisplay({ compact = false }: StreakDisplayProps) {
  const [current, setCurrent] = useState(0);
  const [longest, setLongest] = useState(0);
  const [displayValue, setDisplayValue] = useState(0);
  const [mounted, setMounted] = useState(false);
  const animatedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setCurrent(getCurrentStreak());
    setLongest(getLongestStreak());
    setMounted(true);
  }, []);

  // Animate counter on mount
  useEffect(() => {
    if (!mounted || animatedRef.current || current === 0) {
      setDisplayValue(current);
      return;
    }
    animatedRef.current = true;
    let frame = 0;
    const target = current;
    const step = Math.max(1, Math.floor(target / 25));
    const timer = setInterval(() => {
      frame = Math.min(frame + step, target);
      setDisplayValue(frame);
      if (frame >= target) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [mounted, current]);

  if (!mounted) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Flame className={`w-4 h-4 ${current > 0 ? "text-accent" : "text-muted-foreground"}`} />
        <span className="text-sm font-medium">
          {current > 0 ? (
            <>
              <span className="text-accent">{displayValue}d</span>
              <span className="text-muted-foreground"> streak</span>
            </>
          ) : (
            <span className="text-muted-foreground">Start your streak</span>
          )}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
          current > 0
            ? "bg-accent/10"
            : "bg-muted"
        }`}>
          <Flame className={`w-6 h-6 ${
            current > 0 ? "text-accent animate-pulse" : "text-muted-foreground"
          }`} />
        </div>
        <div>
          {current > 0 ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-semibold metric-display" style={{ fontFamily: 'var(--font-display)' }}>
                  {displayValue}
                </span>
                <span className="text-sm text-muted-foreground font-medium">day streak</span>
              </div>
              {longest > current && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Best: {longest} days
                </p>
              )}
            </>
          ) : (
            <>
              <p className="font-medium text-foreground">No active streak</p>
              <p className="text-xs text-muted-foreground mt-0.5">Complete 80% of habits to start one</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

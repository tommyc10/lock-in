"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

interface CompletionCelebrationProps {
  onDismiss: () => void;
}

// Pre-computed confetti positions to avoid Math.random() during render
const CONFETTI_PARTICLES = Array.from({ length: 20 }).map((_, i) => ({
  left: `${(i * 5 + (i * 37) % 17) % 100}%`,
  animationDelay: `${(i * 0.025) % 0.5}s`,
  animationDuration: `${1.5 + ((i * 7) % 15) / 10}s`,
  backgroundColor: [
    "var(--primary)",
    "var(--accent)",
    "var(--success)",
    "var(--chart-4)",
    "var(--chart-5)",
  ][i % 5],
}));

export function CompletionCelebration({ onDismiss }: CompletionCelebrationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onDismiss}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Confetti particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {CONFETTI_PARTICLES.map((particle, i) => (
          <div
            key={i}
            className="confetti-particle absolute"
            style={particle}
          />
        ))}
      </div>

      {/* Center message */}
      <div className="relative z-10 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-success flex items-center justify-center mx-auto mb-4 check-animation">
          <Check className="w-10 h-10 text-white" strokeWidth={3} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          All habits complete!
        </h2>
        <p className="text-white/70 text-sm">Keep the streak going</p>
      </div>
    </div>
  );
}

/**
 * Check if celebration should be shown for today.
 * Returns true only once per day when all habits are completed.
 */
export function shouldShowCelebration(completed: number, total: number): boolean {
  if (total === 0 || completed < total) return false;

  const today = new Date().toISOString().split("T")[0];
  const lastCelebration = localStorage.getItem("lockin_last_celebration");
  if (lastCelebration === today) return false;

  localStorage.setItem("lockin_last_celebration", today);
  return true;
}

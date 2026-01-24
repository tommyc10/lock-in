"use client";

import { getTodayDate } from "@/lib/storage";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Sun, Moon } from "lucide-react";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function getGreeting(): { greeting: string; message: string } {
  const hour = new Date().getHours();
  if (hour < 12) {
    return { greeting: "Good morning", message: "Start strong today" };
  }
  if (hour < 17) {
    return { greeting: "Good afternoon", message: "Keep the momentum" };
  }
  if (hour < 21) {
    return { greeting: "Good evening", message: "Finish strong" };
  }
  return { greeting: "Good night", message: "Rest well, champion" };
}

export function Header() {
  const today = getTodayDate();
  const { greeting, message } = getGreeting();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-card/90 backdrop-blur-xl sticky top-0 z-40 border-b border-border/50 shadow-[0_1px_3px_oklch(0_0_0/0.05)]">
      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
              Lock In
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {formatDate(today)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{greeting}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{message}</p>
            </div>
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-all duration-300 hover:scale-105"
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Sun className="w-4 h-4 text-accent" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

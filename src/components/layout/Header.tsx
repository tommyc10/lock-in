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
    <header className="bg-card/80 backdrop-blur-sm sticky top-0 z-40 border-b border-border/50">
      <div className="max-w-3xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Lock In
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">{formatDate(today)}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-muted/50 hover:bg-muted flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-amber-400" />
              )}
            </button>
            <div className="text-right">
              <p className="text-base font-medium text-foreground">{greeting}</p>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

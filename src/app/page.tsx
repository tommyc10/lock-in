"use client";

import { useState, useEffect, useMemo } from "react";
import { Priority, Reflection, CountdownEvent, EVENT_CATEGORIES, VISION_CATEGORIES } from "@/lib/types";
import {
  getCompletions,
  getTodayDate,
  getPriorities,
  getReflections,
  getWorkouts,
  getNextEvent,
  getDaysUntil,
  getDueHabits,
} from "@/lib/storage";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import {
  Target,
  Dumbbell,
  Moon,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

// Helper to compute today's stats with O(1) lookups
function computeTodayStats(today: string) {
  const dueHabits = getDueHabits(today);
  const completions = getCompletions(today);
  // Use Set for O(1) lookups instead of O(n²) find() calls
  const dueHabitIds = new Set(dueHabits.map(h => h.id));
  const completed = completions.filter(c => dueHabitIds.has(c.habitId) && c.completed).length;
  return { completed, total: dueHabits.length };
}

// Helper to compute weekly workouts
function computeWeeklyWorkouts() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);
  monday.setHours(0, 0, 0, 0);
  const allWorkouts = getWorkouts();
  return allWorkouts.filter(w => new Date(w.date) >= monday).length;
}

export default function Home() {
  const today = useMemo(() => getTodayDate(), []);

  // Lazy state initialization (rule: rerender-lazy-state-init)
  const [todayStats] = useState(() => {
    if (typeof window === "undefined") return { completed: 0, total: 0 };
    return computeTodayStats(today);
  });
  const [priorities] = useState<Priority[]>(() => {
    if (typeof window === "undefined") return [];
    return getPriorities(today);
  });
  const [reflections] = useState<Reflection[]>(() => {
    if (typeof window === "undefined") return [];
    return getReflections(today);
  });
  const [weeklyWorkouts] = useState(() => {
    if (typeof window === "undefined") return 0;
    return computeWeeklyWorkouts();
  });
  const [nextEvent] = useState<CountdownEvent | null>(() => {
    if (typeof window === "undefined") return null;
    return getNextEvent();
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize derived values (rule: rerender-memo)
  const prioritiesCompleted = useMemo(() => priorities.filter((p) => p.completed).length, [priorities]);
  const reflectionsCount = reflections.length;

  // Calculate progress percentage for visual indicator
  const progressPercent = todayStats.total > 0
    ? Math.round((todayStats.completed / todayStats.total) * 100)
    : 0;

  return (
    <div className="min-h-screen pb-24">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Countdown Widget */}
        {nextEvent && (
          <Link href="/countdown" className="block mb-6">
            <Card className={`bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
              <CardContent className="py-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{getDaysUntil(nextEvent.date)}</span>
                    <span className="text-[10px] text-primary/80 font-semibold tracking-wide">DAYS</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{EVENT_CATEGORIES.find(c => c.value === nextEvent.category)?.emoji}</span>
                      <h3 className="font-semibold text-lg truncate">{nextEvent.name}</h3>
                    </div>
                    {nextEvent.focusAreas.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Focus: {nextEvent.focusAreas.map(a => VISION_CATEGORIES.find(c => c.value === a)?.label).join(", ")}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-primary flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Today's Progress */}
        <div className={`mb-8 ${mounted ? "animate-fade-in animate-fade-in-delay-1" : "opacity-0"}`}>
          <Card className="overflow-hidden">
            <CardContent className="py-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-lg text-muted-foreground">Today&apos;s Progress</h3>
                {todayStats.total > 0 && (
                  <span className="text-sm font-medium text-primary">{progressPercent}%</span>
                )}
              </div>

              {/* Progress bar */}
              {todayStats.total > 0 && (
                <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold tracking-tight">{todayStats.completed}</span>
                    <span className="text-xl text-muted-foreground/60">/ {todayStats.total}</span>
                    <span className="text-sm text-muted-foreground ml-1">habits</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-muted-foreground">{weeklyWorkouts}</p>
                  <p className="text-xs text-muted-foreground/70">workouts this week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className={`flex flex-col gap-4 ${mounted ? "animate-fade-in animate-fade-in-delay-2" : "opacity-0"}`}>
          {/* Habits Link */}
          <Link href="/habits" className="block">
            <Card className="group hover:bg-muted/30 transition-all duration-200 hover:shadow-md">
              <CardContent className="py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">Habits</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {todayStats.total === 0
                          ? "Set up your daily habits"
                          : `${todayStats.completed} of ${todayStats.total} completed`}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Workout Link */}
          <Link href="/workout" className="block">
            <Card className="group hover:bg-muted/30 transition-all duration-200 hover:shadow-md">
              <CardContent className="py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/15 transition-colors">
                      <Dumbbell className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">Workout</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {weeklyWorkouts === 0
                          ? "Start your first workout"
                          : `${weeklyWorkouts} workout${weeklyWorkouts === 1 ? '' : 's'} this week`}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Reflection Link */}
          <Link href="/reflection" className="block">
            <Card className="group hover:bg-muted/30 transition-all duration-200 hover:shadow-md">
              <CardContent className="py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/15 transition-colors">
                      <Moon className="w-6 h-6 text-violet-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">Reflection</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {priorities.length === 0 && reflectionsCount === 0
                          ? "Set priorities & reflect"
                          : `${prioritiesCompleted}/${priorities.length} priorities done`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {reflectionsCount > 0 && (
                      <span className="text-xs text-success font-medium bg-success/10 px-2.5 py-1 rounded-full">
                        Reflected
                      </span>
                    )}
                    <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Motivation Quote */}
        <div className={`mt-12 text-center ${mounted ? "animate-fade-in animate-fade-in-delay-3" : "opacity-0"}`}>
          <p className="text-sm text-muted-foreground/60 italic">
            &ldquo;Small daily improvements over time lead to stunning results.&rdquo;
          </p>
        </div>
      </main>
    </div>
  );
}

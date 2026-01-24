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
          <Link href="/countdown" className="block mb-8">
            <Card className={`relative overflow-hidden card-premium hover:shadow-lg group ${mounted ? "animate-fade-in" : "opacity-0"}`}>
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
              <CardContent className="py-6 relative">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-primary/10 to-accent/5 flex flex-col items-center justify-center">
                      <span className="text-3xl font-semibold text-primary metric-display" style={{ fontFamily: 'var(--font-display)' }}>{getDaysUntil(nextEvent.date)}</span>
                      <span className="text-xs text-muted-foreground font-medium">days</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                      <span className="text-sm">{EVENT_CATEGORIES.find(c => c.value === nextEvent.category)?.emoji}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate" style={{ fontFamily: 'var(--font-display)' }}>{nextEvent.name}</h3>
                    {nextEvent.focusAreas.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {nextEvent.focusAreas.map(a => VISION_CATEGORIES.find(c => c.value === a)?.label).join(", ")}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Today's Progress */}
        <div className={`mb-10 ${mounted ? "animate-fade-in animate-fade-in-delay-1" : "opacity-0"}`}>
          <Card className="overflow-hidden card-premium relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <CardContent className="py-8 relative">
              <div className="flex items-start justify-between mb-6">
                <h3 className="font-semibold text-xl text-muted-foreground" style={{ fontFamily: 'var(--font-display)' }}>Today&apos;s Progress</h3>
                {todayStats.total > 0 && (
                  <span className="text-2xl font-semibold text-primary metric-display">{progressPercent}%</span>
                )}
              </div>

              {/* Progress bar - elegant style */}
              {todayStats.total > 0 && (
                <div className="h-2 bg-muted rounded-full overflow-hidden mb-8 relative">
                  <div
                    className="h-full bg-linear-to-r from-primary to-accent rounded-full transition-all duration-700 relative"
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  </div>
                </div>
              )}

              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-semibold tracking-tight metric-display" style={{ fontFamily: 'var(--font-display)' }}>{todayStats.completed}</span>
                    <span className="text-3xl text-muted-foreground font-normal" style={{ fontFamily: 'var(--font-display)' }}>/ {todayStats.total}</span>
                  </div>
                  <span className="text-sm text-muted-foreground mt-2 block">habits completed</span>
                </div>
                <div className="text-right bg-accent/5 px-6 py-4 rounded-2xl border border-accent/10">
                  <p className="text-3xl font-semibold text-accent metric-display" style={{ fontFamily: 'var(--font-display)' }}>{weeklyWorkouts}</p>
                  <p className="text-xs text-muted-foreground mt-1">workouts this week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className={`flex flex-col gap-4 ${mounted ? "animate-fade-in animate-fade-in-delay-2" : "opacity-0"}`}>
          {/* Habits Link */}
          <Link href="/habits" className="block group">
            <Card className="card-premium group-hover:shadow-lg">
              <CardContent className="py-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                <div className="flex items-center justify-between relative">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-all">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ fontFamily: 'var(--font-display)' }}>Habits</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {todayStats.total === 0
                          ? "Set up your daily habits"
                          : `${todayStats.completed} of ${todayStats.total} completed`}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Workout Link */}
          <Link href="/workout" className="block group">
            <Card className="card-premium group-hover:shadow-lg">
              <CardContent className="py-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl" />
                <div className="flex items-center justify-between relative">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/15 transition-all">
                      <Dumbbell className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ fontFamily: 'var(--font-display)' }}>Workout</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {weeklyWorkouts === 0
                          ? "Start your first workout"
                          : `${weeklyWorkouts} workout${weeklyWorkouts === 1 ? '' : 's'} this week`}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Reflection Link */}
          <Link href="/reflection" className="block group">
            <Card className="card-premium group-hover:shadow-lg">
              <CardContent className="py-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-full blur-3xl" />
                <div className="flex items-center justify-between relative">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/15 transition-all">
                      <Moon className="w-6 h-6 text-destructive" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ fontFamily: 'var(--font-display)' }}>Reflection</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {priorities.length === 0 && reflectionsCount === 0
                          ? "Set priorities & reflect"
                          : `${prioritiesCompleted}/${priorities.length} priorities done`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {reflectionsCount > 0 && (
                      <span className="text-xs text-success font-medium bg-success/10 px-3 py-1 rounded-full">
                        Reflected
                      </span>
                    )}
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Motivation Quote */}
        <div className={`mt-16 relative ${mounted ? "animate-fade-in animate-fade-in-delay-3" : "opacity-0"}`}>
          <div className="relative text-center px-8 py-12">
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary/5 to-transparent rounded-3xl" />
            <p className="text-lg text-foreground/80 font-medium italic relative" style={{ fontFamily: 'var(--font-display)' }}>
              &ldquo;Small daily improvements over time lead to stunning results.&rdquo;
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

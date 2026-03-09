"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Priority, Reflection, CountdownEvent, EVENT_CATEGORIES, VISION_CATEGORIES, HABIT_TEMPLATES } from "@/lib/types";
import {
  getPriorities,
  getReflections,
  getNextEvent,
  getDaysUntil,
  getWaterLog,
  addWater,
  removeWater,
  getHabits,
  getTodayDate,
} from "@/lib/storage";
import { computeTodayStats, computeWeeklyWorkouts } from "@/lib/stats";
import { getTodayQuote } from "@/lib/quotes";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { Header } from "@/components/layout/Header";
import { StreakDisplay } from "@/components/streaks/StreakDisplay";
import { AchievementGrid } from "@/components/streaks/AchievementGrid";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Target,
  Dumbbell,
  Moon,
  ChevronRight,
  Droplets,
  Plus,
  Minus,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const today = useMemo(() => getTodayDate(), []);

  const [todayStats, setTodayStats] = useState(() => {
    if (typeof window === "undefined") return { completed: 0, total: 0 };
    return computeTodayStats(today);
  });
  const [priorities, setPriorities] = useState<Priority[]>(() => {
    if (typeof window === "undefined") return [];
    return getPriorities(today);
  });
  const [reflections, setReflections] = useState<Reflection[]>(() => {
    if (typeof window === "undefined") return [];
    return getReflections(today);
  });
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(() => {
    if (typeof window === "undefined") return 0;
    return computeWeeklyWorkouts();
  });
  const [nextEvent, setNextEvent] = useState<CountdownEvent | null>(() => {
    if (typeof window === "undefined") return null;
    return getNextEvent();
  });
  const [waterLog, setWaterLog] = useState(() => {
    if (typeof window === "undefined") return { date: "", glasses: 0, target: 8 };
    return getWaterLog();
  });
  const [hasHabits, setHasHabits] = useState(() => {
    if (typeof window === "undefined") return true;
    return getHabits().length > 0;
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const refreshData = useCallback(() => {
    setTodayStats(computeTodayStats(today));
    setPriorities(getPriorities(today));
    setReflections(getReflections(today));
    setWeeklyWorkouts(computeWeeklyWorkouts());
    setNextEvent(getNextEvent());
    setWaterLog(getWaterLog());
    setHasHabits(getHabits().length > 0);
  }, [today]);

  useRefreshOnFocus(refreshData);

  const prioritiesCompleted = useMemo(() => priorities.filter((p) => p.completed).length, [priorities]);
  const reflectionsCount = reflections.length;
  const progressPercent = todayStats.total > 0
    ? Math.round((todayStats.completed / todayStats.total) * 100)
    : 0;
  const quote = useMemo(() => getTodayQuote(), []);

  const handleAddWater = () => setWaterLog(addWater());
  const handleRemoveWater = () => setWaterLog(removeWater());

  return (
    <div className="min-h-screen pb-24">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Countdown Widget */}
        {nextEvent && (
          <Link href="/countdown" className="block mb-6">
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

        {/* Streak Display */}
        <Card className={`mb-6 card-premium ${mounted ? "animate-fade-in" : "opacity-0"}`}>
          <CardContent className="py-5">
            <StreakDisplay />
          </CardContent>
        </Card>

        {/* Today's Progress with Progress Ring */}
        <div className={`mb-6 ${mounted ? "animate-fade-in animate-fade-in-delay-1" : "opacity-0"}`}>
          <Card className="overflow-hidden card-premium relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <CardContent className="py-8 relative">
              {!hasHabits ? (
                <div className="text-center py-4">
                  <h3 className="font-semibold text-xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>Welcome to Lock In</h3>
                  <p className="text-muted-foreground text-sm mb-6">Start by adding your daily habits</p>
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {HABIT_TEMPLATES.slice(0, 4).map((t) => (
                      <span key={t.name} className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground">{t.name}</span>
                    ))}
                  </div>
                  <Link href="/habits">
                    <Button><Plus className="w-4 h-4 mr-2" />Add Your First Habit</Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-3" style={{ fontFamily: 'var(--font-display)' }}>Today&apos;s Progress</h3>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-semibold tracking-tight metric-display" style={{ fontFamily: 'var(--font-display)' }}>{todayStats.completed}</span>
                      <span className="text-3xl text-muted-foreground font-normal" style={{ fontFamily: 'var(--font-display)' }}>/ {todayStats.total}</span>
                    </div>
                    <span className="text-sm text-muted-foreground mt-2 block">habits completed</span>
                  </div>
                  <ProgressRing percent={progressPercent} size={90} strokeWidth={7}>
                    <span className="text-lg font-semibold text-primary metric-display">{progressPercent}%</span>
                  </ProgressRing>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Water Tracker + Weekly Workouts Row */}
        <div className={`grid grid-cols-2 gap-4 mb-6 ${mounted ? "animate-fade-in animate-fade-in-delay-2" : "opacity-0"}`}>
          <Card className="card-premium">
            <CardContent className="py-5">
              <div className="flex items-center gap-2 mb-3">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-muted-foreground">Water</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-semibold metric-display" style={{ fontFamily: 'var(--font-display)' }}>
                  {waterLog.glasses}<span className="text-base text-muted-foreground font-normal">/{waterLog.target}</span>
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${Math.min((waterLog.glasses / waterLog.target) * 100, 100)}%` }} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRemoveWater} disabled={waterLog.glasses === 0} className="flex-1 h-8"><Minus className="w-3 h-3" /></Button>
                <Button variant="outline" size="sm" onClick={handleAddWater} className="flex-1 h-8"><Plus className="w-3 h-3" /></Button>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium">
            <CardContent className="py-5">
              <div className="flex items-center gap-2 mb-3">
                <Dumbbell className="w-4 h-4 text-accent" />
                <span className="text-xs font-medium text-muted-foreground">Workouts</span>
              </div>
              <p className="text-2xl font-semibold metric-display mb-2" style={{ fontFamily: 'var(--font-display)' }}>{weeklyWorkouts}</p>
              <p className="text-xs text-muted-foreground">this week</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className={`flex flex-col gap-4 ${mounted ? "animate-fade-in animate-fade-in-delay-3" : "opacity-0"}`}>
          <Link href="/habits" className="block group">
            <Card className="card-premium group-hover:shadow-lg">
              <CardContent className="py-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                <div className="flex items-center justify-between relative">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-all"><Target className="w-5 h-5 text-primary" /></div>
                    <div>
                      <h3 className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Habits</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{todayStats.total === 0 ? "Set up your daily habits" : `${todayStats.completed} of ${todayStats.total} completed`}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/workout" className="block group">
            <Card className="card-premium group-hover:shadow-lg">
              <CardContent className="py-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl" />
                <div className="flex items-center justify-between relative">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/15 transition-all"><Dumbbell className="w-5 h-5 text-accent" /></div>
                    <div>
                      <h3 className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Workout</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{weeklyWorkouts === 0 ? "Start your first workout" : `${weeklyWorkouts} workout${weeklyWorkouts === 1 ? '' : 's'} this week`}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/reflection" className="block group">
            <Card className="card-premium group-hover:shadow-lg">
              <CardContent className="py-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-full blur-3xl" />
                <div className="flex items-center justify-between relative">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/15 transition-all"><Moon className="w-5 h-5 text-destructive" /></div>
                    <div>
                      <h3 className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Reflection</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{priorities.length === 0 && reflectionsCount === 0 ? "Set priorities & reflect" : `${prioritiesCompleted}/${priorities.length} priorities done`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {reflectionsCount > 0 && (<span className="text-xs text-success font-medium bg-success/10 px-3 py-1 rounded-full">Reflected</span>)}
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Achievements */}
        <div className={`mt-8 ${mounted ? "animate-fade-in animate-fade-in-delay-4" : "opacity-0"}`}>
          <Card className="card-premium">
            <CardContent className="py-6">
              <AchievementGrid />
            </CardContent>
          </Card>
        </div>

        {/* Daily Quote */}
        <div className={`mt-8 relative ${mounted ? "animate-fade-in animate-fade-in-delay-4" : "opacity-0"}`}>
          <div className="relative text-center px-8 py-10">
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary/5 to-transparent rounded-3xl" />
            <p className="text-lg text-foreground/80 font-medium italic relative" style={{ fontFamily: 'var(--font-display)' }}>
              &ldquo;{quote}&rdquo;
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

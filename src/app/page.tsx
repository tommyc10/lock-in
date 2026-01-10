"use client";

import { useState, useEffect, useCallback } from "react";
import { Habit, Priority, Reflection } from "@/lib/types";
import {
  getHabits,
  getCompletions,
  getTodayDate,
  getPriorities,
  getReflections,
  getCompletionRate,
  getWorkouts,
} from "@/lib/storage";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Target,
  Dumbbell,
  Moon,
  ChevronRight,
  CheckCircle2,
  Circle,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayStats, setTodayStats] = useState({ completed: 0, total: 0 });
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [completionRate, setCompletionRate] = useState(0);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(0);
  const [mounted, setMounted] = useState(false);

  const today = getTodayDate();

  const loadData = useCallback(() => {
    const loadedHabits = getHabits();
    setHabits(loadedHabits);

    // Calculate today's habit stats
    const completions = getCompletions(today);
    const completed = completions.filter((c) => c.completed).length;
    setTodayStats({ completed, total: loadedHabits.length });

    setPriorities(getPriorities(today));
    setReflections(getReflections(today));
    setCompletionRate(getCompletionRate(7));

    // Calculate weekly workouts
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const allWorkouts = getWorkouts();
    const thisWeek = allWorkouts.filter(w => new Date(w.date) >= weekAgo);
    setWeeklyWorkouts(thisWeek.length);
  }, [today]);

  useEffect(() => {
    loadData();
    setMounted(true);
  }, [loadData]);

  const prioritiesCompleted = priorities.filter((p) => p.completed).length;
  const reflectionsCount = reflections.length;
  const habitProgressPercent = todayStats.total > 0
    ? Math.round((todayStats.completed / todayStats.total) * 100)
    : 0;

  return (
    <div className="min-h-screen pb-24">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Main Progress Ring */}
        <div className={`mb-6 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">7-day streak</p>
                  <p className="text-5xl font-bold text-foreground tracking-tight mt-1">{completionRate}%</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {completionRate === 0 ? "Start tracking today" :
                     completionRate >= 80 ? "Outstanding consistency" :
                     completionRate >= 50 ? "Building momentum" : "Every day counts"}
                  </p>
                </div>
                <div className="w-32 h-32 relative">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      className="stroke-muted"
                      strokeWidth="10"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      className={`stroke-primary ${mounted ? "progress-ring-animated" : ""}`}
                      strokeWidth="10"
                      strokeDasharray={`${completionRate * 3.52} 352`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Grid */}
        <div className={`grid grid-cols-2 gap-4 mb-8 ${mounted ? "animate-fade-in animate-fade-in-delay-1" : "opacity-0"}`}>
          <Card className="bg-muted/30">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{todayStats.completed}/{todayStats.total}</p>
                  <p className="text-xs text-muted-foreground">Today&apos;s habits</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{weeklyWorkouts}</p>
                  <p className="text-xs text-muted-foreground">Workouts this week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className={`space-y-3 ${mounted ? "animate-fade-in animate-fade-in-delay-2" : "opacity-0"}`}>
          {/* Habits Link */}
          <Link href="/habits">
            <Card className="group hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Habits</h3>
                      <p className="text-sm text-muted-foreground">
                        {todayStats.total === 0
                          ? "Set up your daily habits"
                          : `${todayStats.completed} of ${todayStats.total} completed`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {todayStats.total > 0 && (
                      <div className="flex items-center gap-0.5 mr-2">
                        {Array.from({ length: Math.min(todayStats.total, 5) }).map((_, i) => (
                          i < todayStats.completed ? (
                            <CheckCircle2 key={i} className="w-4 h-4 text-success" />
                          ) : (
                            <Circle key={i} className="w-4 h-4 text-muted-foreground/30" />
                          )
                        ))}
                        {todayStats.total > 5 && (
                          <span className="text-xs text-muted-foreground ml-1">+{todayStats.total - 5}</span>
                        )}
                      </div>
                    )}
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Workout Link */}
          <Link href="/workout">
            <Card className="group hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Dumbbell className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Workout</h3>
                      <p className="text-sm text-muted-foreground">
                        {weeklyWorkouts === 0
                          ? "Start your first workout"
                          : `${weeklyWorkouts} workout${weeklyWorkouts === 1 ? '' : 's'} this week`}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Reflection Link */}
          <Link href="/reflection">
            <Card className="group hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                      <Moon className="w-6 h-6 text-violet-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Reflection</h3>
                      <p className="text-sm text-muted-foreground">
                        {priorities.length === 0 && reflectionsCount === 0
                          ? "Set priorities & reflect"
                          : `${prioritiesCompleted}/${priorities.length} priorities done`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {reflectionsCount > 0 && (
                      <span className="text-xs text-success font-medium bg-success/10 px-2 py-0.5 rounded-full mr-2">
                        Reflected
                      </span>
                    )}
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Motivation Quote */}
        <div className={`mt-10 text-center ${mounted ? "animate-fade-in animate-fade-in-delay-3" : "opacity-0"}`}>
          <p className="text-sm text-muted-foreground italic">
            &ldquo;Small daily improvements over time lead to stunning results.&rdquo;
          </p>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { Habit, Priority, Reflection, CountdownEvent, EVENT_CATEGORIES, VISION_CATEGORIES } from "@/lib/types";
import {
  getHabits,
  getCompletions,
  getTodayDate,
  getPriorities,
  getReflections,
  getCompletionRate,
  getWorkouts,
  getNextEvent,
  getDaysUntil,
  getCurrentStreak,
  getLongestStreak,
  getAchievements,
  Achievement,
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
  Clock,
  Flame,
  Trophy,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayStats, setTodayStats] = useState({ completed: 0, total: 0 });
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [completionRate, setCompletionRate] = useState(0);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(0);
  const [nextEvent, setNextEvent] = useState<CountdownEvent | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
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

    // Get next upcoming event
    setNextEvent(getNextEvent());

    // Get streak data
    setCurrentStreak(getCurrentStreak());
    setLongestStreak(getLongestStreak());
    setAchievements(getAchievements());
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
        {/* Streak Card */}
        <div className={`mb-6 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                  </div>
                  <p className="text-5xl font-bold text-foreground tracking-tight">
                    {currentStreak}
                    <span className="text-2xl font-normal text-muted-foreground ml-2">
                      {currentStreak === 1 ? "day" : "days"}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {currentStreak === 0 ? "Complete 80%+ habits to start" :
                     currentStreak >= longestStreak && currentStreak > 0 ? "Personal best!" :
                     `Best: ${longestStreak} days`}
                  </p>
                </div>
                <div className="w-28 h-28 relative">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      fill="none"
                      className="stroke-muted/30"
                      strokeWidth="8"
                    />
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      fill="none"
                      className={`stroke-orange-500 ${mounted ? "progress-ring-animated" : ""}`}
                      strokeWidth="8"
                      strokeDasharray={`${Math.min(currentStreak / 30, 1) * 301} 301`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Flame className={`w-8 h-8 ${currentStreak > 0 ? "text-orange-500" : "text-muted-foreground/30"}`} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        {achievements.some(a => a.unlocked) && (
          <div className={`mb-6 ${mounted ? "animate-fade-in animate-fade-in-delay-1" : "opacity-0"}`}>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-medium text-muted-foreground">Achievements</h3>
            </div>
            <div className="flex gap-2 flex-wrap">
              {achievements.filter(a => a.unlocked).map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5"
                  title={achievement.description}
                >
                  <span>{achievement.icon}</span>
                  <span className="text-sm font-medium">{achievement.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Countdown Widget */}
        {nextEvent && (
          <Link href="/countdown">
            <Card className={`mb-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer ${mounted ? "animate-fade-in animate-fade-in-delay-1" : "opacity-0"}`}>
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-primary">{getDaysUntil(nextEvent.date)}</span>
                    <span className="text-[9px] text-primary font-medium">DAYS</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span>{EVENT_CATEGORIES.find(c => c.value === nextEvent.category)?.emoji}</span>
                      <h3 className="font-semibold">{nextEvent.name}</h3>
                    </div>
                    {nextEvent.focusAreas.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Focus: {nextEvent.focusAreas.map(a => VISION_CATEGORIES.find(c => c.value === a)?.label).join(", ")}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Quick Stats Grid */}
        <div className={`grid grid-cols-3 gap-3 mb-8 ${mounted ? "animate-fade-in animate-fade-in-delay-2" : "opacity-0"}`}>
          <Card className="bg-muted/30">
            <CardContent className="pt-4 pb-4 px-3">
              <div className="text-center">
                <p className="text-2xl font-bold">{todayStats.completed}/{todayStats.total}</p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="pt-4 pb-4 px-3">
              <div className="text-center">
                <p className="text-2xl font-bold">{completionRate}%</p>
                <p className="text-xs text-muted-foreground">7-day rate</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="pt-4 pb-4 px-3">
              <div className="text-center">
                <p className="text-2xl font-bold">{weeklyWorkouts}</p>
                <p className="text-xs text-muted-foreground">Workouts</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className={`space-y-3 ${mounted ? "animate-fade-in animate-fade-in-delay-3" : "opacity-0"}`}>
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
        <div className={`mt-10 text-center ${mounted ? "animate-fade-in animate-fade-in-delay-4" : "opacity-0"}`}>
          <p className="text-sm text-muted-foreground italic">
            &ldquo;Small daily improvements over time lead to stunning results.&rdquo;
          </p>
        </div>
      </main>
    </div>
  );
}

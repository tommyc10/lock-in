"use client";

import { useState, useEffect, useCallback } from "react";
import { Habit, Priority, Reflection, CountdownEvent, EVENT_CATEGORIES, VISION_CATEGORIES } from "@/lib/types";
import {
  getHabits,
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

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayStats, setTodayStats] = useState({ completed: 0, total: 0 });
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(0);
  const [nextEvent, setNextEvent] = useState<CountdownEvent | null>(null);
  const [mounted, setMounted] = useState(false);

  const today = getTodayDate();

  const loadData = useCallback(() => {
    const loadedHabits = getHabits();
    setHabits(loadedHabits);

    // Calculate today's habit stats (only count due habits)
    const dueHabits = getDueHabits(today);
    const completions = getCompletions(today);
    const completed = completions.filter((c) => {
      const habit = dueHabits.find((h) => h.id === c.habitId);
      return habit && c.completed;
    }).length;
    setTodayStats({ completed, total: dueHabits.length });

    setPriorities(getPriorities(today));
    setReflections(getReflections(today));

    // Calculate weekly workouts (Mon-Sun)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days since Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() - mondayOffset);
    monday.setHours(0, 0, 0, 0);
    const allWorkouts = getWorkouts();
    const thisWeek = allWorkouts.filter(w => new Date(w.date) >= monday);
    setWeeklyWorkouts(thisWeek.length);

    // Get next upcoming event
    setNextEvent(getNextEvent());
  }, [today]);

  useEffect(() => {
    loadData();
    setMounted(true);
  }, [loadData]);

  const prioritiesCompleted = priorities.filter((p) => p.completed).length;
  const reflectionsCount = reflections.length;

  return (
    <div className="min-h-screen pb-24">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Countdown Widget */}
        {nextEvent && (
          <Link href="/countdown">
            <Card className={`mb-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer ${mounted ? "animate-fade-in" : "opacity-0"}`}>
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

        {/* Today's Progress */}
        <div className={`mb-8 ${mounted ? "animate-fade-in animate-fade-in-delay-1" : "opacity-0"}`}>
          <Card>
            <CardContent className="py-6">
              <h3 className="font-semibold text-lg mb-3">Today&apos;s Progress</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold">{todayStats.completed}</span>
                <span className="text-xl text-muted-foreground">/ {todayStats.total}</span>
                <span className="text-sm text-muted-foreground ml-2">habits</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {weeklyWorkouts} workout{weeklyWorkouts === 1 ? "" : "s"} this week
              </p>
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
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
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

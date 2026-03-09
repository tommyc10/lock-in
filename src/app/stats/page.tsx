"use client";

import { useState, useEffect } from "react";
import {
  getCompletionRate,
  getCompletions,
} from "@/lib/storage";
import { computeWeeklyWorkouts } from "@/lib/stats";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StreakDisplay } from "@/components/streaks/StreakDisplay";
import { AchievementGrid } from "@/components/streaks/AchievementGrid";
import { WeeklyProgress } from "@/components/stats/WeeklyProgress";
import { BarChart3, Target, Dumbbell, TrendingUp } from "lucide-react";

export default function StatsPage() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    weeklyRate: 0,
    monthlyRate: 0,
    totalCompleted: 0,
    weeklyWorkouts: 0,
  });

  useEffect(() => {
    const allCompletions = getCompletions();
    const totalCompleted = allCompletions.filter(c => c.completed).length;

    setStats({
      weeklyRate: getCompletionRate(7),
      monthlyRate: getCompletionRate(30),
      totalCompleted,
      weeklyWorkouts: computeWeeklyWorkouts(),
    });
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen pb-24"><Header /></div>;

  return (
    <div className="min-h-screen pb-24">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className={`mb-6 animate-fade-in`}>
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Progress</h2>
          </div>
          <p className="text-muted-foreground">Track your consistency over time</p>
        </div>

        {/* Streak */}
        <Card className="mb-6 card-premium animate-fade-in">
          <CardContent className="py-6">
            <StreakDisplay />
          </CardContent>
        </Card>

        {/* Weekly Chart */}
        <Card className="mb-6 animate-fade-in animate-fade-in-delay-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyProgress />
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6 animate-fade-in animate-fade-in-delay-2">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold metric-display text-primary" style={{ fontFamily: 'var(--font-display)' }}>
                {stats.weeklyRate}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">7-day completion</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold metric-display text-primary" style={{ fontFamily: 'var(--font-display)' }}>
                {stats.monthlyRate}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">30-day completion</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="w-4 h-4 text-accent" />
              </div>
              <p className="text-3xl font-bold metric-display" style={{ fontFamily: 'var(--font-display)' }}>
                {stats.totalCompleted}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Total completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Dumbbell className="w-4 h-4 text-accent" />
              </div>
              <p className="text-3xl font-bold metric-display" style={{ fontFamily: 'var(--font-display)' }}>
                {stats.weeklyWorkouts}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Workouts this week</p>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="animate-fade-in animate-fade-in-delay-3">
          <CardContent className="py-6">
            <AchievementGrid />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

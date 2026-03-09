"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Habit, HabitFrequency, DayOfWeek } from "@/lib/types";
import {
  getHabits,
  saveHabit,
  updateHabit,
  deleteHabit,
  getMissedHabitsYesterday,
  hasRecoveryForHabit,
  getTodayDate,
} from "@/lib/storage";
import { computeTodayStats } from "@/lib/stats";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import { Header } from "@/components/layout/Header";
import { HabitList } from "@/components/habits/HabitList";
import { HabitForm } from "@/components/habits/HabitForm";
import { RecoveryModal, RecoveryBanner } from "@/components/habits/RecoveryModal";
import { StreakDisplay } from "@/components/streaks/StreakDisplay";
import { CompletionCelebration, shouldShowCelebration } from "@/components/celebrations/CompletionCelebration";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

type View = "list" | "add" | "edit";

// Helper to get missed habits that need recovery
function getMissedHabitsNeedingRecovery() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  return getMissedHabitsYesterday().filter(h => !hasRecoveryForHabit(h.id, yesterdayStr));
}

export default function HabitsPage() {
  const today = useMemo(() => getTodayDate(), []);

  // Lazy state initialization (rule: rerender-lazy-state-init)
  const [habits, setHabits] = useState<Habit[]>(() => {
    if (typeof window === "undefined") return [];
    return getHabits();
  });
  const [view, setView] = useState<View>("list");
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [missedHabits, setMissedHabits] = useState<Habit[]>(() => {
    if (typeof window === "undefined") return [];
    return getMissedHabitsNeedingRecovery();
  });
  const [currentRecoveryIndex, setCurrentRecoveryIndex] = useState(0);
  const [showRecovery, setShowRecovery] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [todayStats, setTodayStats] = useState(() => {
    if (typeof window === "undefined") return { completed: 0, total: 0 };
    return computeTodayStats(today);
  });

  const [showCelebration, setShowCelebration] = useState(false);

  const loadData = useCallback(() => {
    setHabits(getHabits());
    const stats = computeTodayStats(today);
    setTodayStats(stats);
    setMissedHabits(getMissedHabitsNeedingRecovery());

    // Check if all habits are done for celebration
    if (shouldShowCelebration(stats.completed, stats.total)) {
      setShowCelebration(true);
    }
  }, [today]);

  useRefreshOnFocus(loadData);

  useEffect(() => {
    setMounted(true);
  }, []);

  interface HabitFormData {
    name: string;
    timeOfDay: Habit["timeOfDay"];
    frequency: HabitFrequency;
    weeklyTarget?: number;
    specificDays?: DayOfWeek[];
  }

  const handleAddHabit = (data: HabitFormData) => {
    saveHabit({
      name: data.name,
      timeOfDay: data.timeOfDay,
      frequency: data.frequency,
      weeklyTarget: data.weeklyTarget,
      specificDays: data.specificDays,
    });
    loadData();
    setView("list");
  };

  const handleEditHabit = (data: HabitFormData) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, {
        name: data.name,
        timeOfDay: data.timeOfDay,
        frequency: data.frequency,
        weeklyTarget: data.weeklyTarget,
        specificDays: data.specificDays,
      });
      loadData();
      setEditingHabit(null);
      setView("list");
    }
  };

  const handleDeleteHabit = (habitId: string) => {
    if (confirm("Are you sure you want to delete this habit?")) {
      deleteHabit(habitId);
      loadData();
    }
  };

  const handleRecoveryComplete = () => {
    if (currentRecoveryIndex < missedHabits.length - 1) {
      setCurrentRecoveryIndex((prev) => prev + 1);
    } else {
      setShowRecovery(false);
      setCurrentRecoveryIndex(0);
      loadData();
    }
  };

  const progressPercent = todayStats.total > 0
    ? Math.round((todayStats.completed / todayStats.total) * 100)
    : 0;

  return (
    <div className="min-h-screen pb-24">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Recovery Banner */}
        {missedHabits.length > 0 && !showRecovery && (
          <RecoveryBanner
            missedCount={missedHabits.length}
            onReview={() => setShowRecovery(true)}
          />
        )}

        {/* Streak Display */}
        <Card className={`mb-4 card-premium ${mounted ? "animate-fade-in" : "opacity-0"}`}>
          <CardContent className="py-4">
            <StreakDisplay compact />
          </CardContent>
        </Card>

        {/* Today's Progress */}
        <Card className={`mb-6 card-premium ${mounted ? "animate-fade-in" : "opacity-0"}`}>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today&apos;s Progress</p>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-4xl font-semibold tracking-tight metric-display" style={{ fontFamily: 'var(--font-display)' }}>
                    {todayStats.completed}
                  </span>
                  <span className="text-2xl text-muted-foreground font-normal" style={{ fontFamily: 'var(--font-display)' }}>
                    / {todayStats.total}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {progressPercent === 100
                    ? "All done! Great work"
                    : progressPercent >= 50
                    ? "Keep going!"
                    : "Let's get started"}
                </p>
              </div>
              <ProgressRing percent={progressPercent} size={72} strokeWidth={6}>
                <span className="text-sm font-semibold text-primary metric-display">{progressPercent}%</span>
              </ProgressRing>
            </div>
          </CardContent>
        </Card>

        {/* Habits List */}
        {view === "list" && (
          <div className={mounted ? "animate-fade-in animate-fade-in-delay-1" : "opacity-0"}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold tracking-tight">Your Habits</h2>
              <Button onClick={() => setView("add")}>
                <Plus className="w-4 h-4" />
                Add Habit
              </Button>
            </div>
            <HabitList
              habits={habits}
              onToggle={loadData}
              onEdit={(habit) => {
                setEditingHabit(habit);
                setView("edit");
              }}
              onDelete={handleDeleteHabit}
            />
          </div>
        )}

        {view === "add" && (
          <HabitForm onSubmit={handleAddHabit} onCancel={() => setView("list")} />
        )}

        {view === "edit" && editingHabit && (
          <HabitForm
            onSubmit={handleEditHabit}
            onCancel={() => {
              setEditingHabit(null);
              setView("list");
            }}
            initialName={editingHabit.name}
            initialTimeOfDay={editingHabit.timeOfDay}
            initialFrequency={editingHabit.frequency || "daily"}
            initialWeeklyTarget={editingHabit.weeklyTarget}
            initialSpecificDays={editingHabit.specificDays}
            isEditing
          />
        )}
      </main>

      {/* Recovery Modal */}
      {showRecovery && missedHabits[currentRecoveryIndex] && (
        <RecoveryModal
          habit={missedHabits[currentRecoveryIndex]}
          onComplete={handleRecoveryComplete}
          onSkip={() => {
            if (currentRecoveryIndex < missedHabits.length - 1) {
              setCurrentRecoveryIndex((prev) => prev + 1);
            } else {
              setShowRecovery(false);
              setCurrentRecoveryIndex(0);
            }
          }}
        />
      )}

      {/* Celebration overlay */}
      {showCelebration && (
        <CompletionCelebration onDismiss={() => setShowCelebration(false)} />
      )}
    </div>
  );
}

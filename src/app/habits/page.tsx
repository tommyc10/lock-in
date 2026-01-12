"use client";

import { useState, useEffect, useCallback } from "react";
import { Habit, HabitFrequency, DayOfWeek } from "@/lib/types";
import {
  getHabits,
  saveHabit,
  updateHabit,
  deleteHabit,
  getMissedHabitsYesterday,
  hasRecoveryForHabit,
  getTodayDate,
  getCompletions,
  getDueHabits,
} from "@/lib/storage";
import { Header } from "@/components/layout/Header";
import { HabitList } from "@/components/habits/HabitList";
import { HabitForm } from "@/components/habits/HabitForm";
import { RecoveryModal, RecoveryBanner } from "@/components/habits/RecoveryModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, CheckCircle2, Circle } from "lucide-react";

type View = "list" | "add" | "edit";

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [view, setView] = useState<View>("list");
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [missedHabits, setMissedHabits] = useState<Habit[]>([]);
  const [currentRecoveryIndex, setCurrentRecoveryIndex] = useState(0);
  const [showRecovery, setShowRecovery] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [todayStats, setTodayStats] = useState({ completed: 0, total: 0 });

  const today = getTodayDate();

  const loadData = useCallback(() => {
    const loadedHabits = getHabits();
    setHabits(loadedHabits);

    // Calculate today's stats (only count due habits)
    const dueHabits = getDueHabits(today);
    const completions = getCompletions(today);
    const completed = completions.filter((c) => {
      const habit = dueHabits.find((h) => h.id === c.habitId);
      return habit && c.completed;
    }).length;
    setTodayStats({ completed, total: dueHabits.length });

    // Check for missed habits
    const missed = getMissedHabitsYesterday().filter((h) => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return !hasRecoveryForHabit(h.id, yesterday.toISOString().split("T")[0]);
    });
    setMissedHabits(missed);
  }, [today]);

  useEffect(() => {
    loadData();
    setMounted(true);
  }, [loadData]);

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

        {/* Today's Progress */}
        <Card className={`mb-6 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today&apos;s Progress</p>
                <p className="text-4xl font-bold tracking-tight mt-1">
                  {todayStats.completed}/{todayStats.total}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {progressPercent === 100
                    ? "All done! Great work"
                    : progressPercent >= 50
                    ? "Keep going!"
                    : "Let's get started"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: todayStats.total }).map((_, i) => (
                  i < todayStats.completed ? (
                    <CheckCircle2 key={i} className="w-6 h-6 text-success" />
                  ) : (
                    <Circle key={i} className="w-6 h-6 text-muted" />
                  )
                ))}
              </div>
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
    </div>
  );
}

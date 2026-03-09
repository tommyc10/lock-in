"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Workout } from "@/lib/types";
import { getWorkouts, saveWorkout, deleteWorkout, getTodayDate } from "@/lib/storage";
import { Header } from "@/components/layout/Header";
import { WorkoutHome } from "@/components/workout/WorkoutHome";
import { LogWorkout, type ExerciseEntry } from "@/components/workout/LogWorkout";
import { WorkoutHistory } from "@/components/workout/WorkoutHistory";

type View = "home" | "log" | "history";

export default function WorkoutPage() {
  const today = useMemo(() => getTodayDate(), []);
  const [view, setView] = useState<View>("home");
  const [workoutHistory, setWorkoutHistory] = useState<Workout[]>(() => {
    if (typeof window === "undefined") return [];
    return getWorkouts();
  });
  const [mounted, setMounted] = useState(false);

  const [workoutDate, setWorkoutDate] = useState(today);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [currentExercise, setCurrentExercise] = useState({
    name: "", sets: "", reps: "", weight: "",
  });

  const loadData = useCallback(() => {
    setWorkoutHistory(getWorkouts());
  }, []);

  useEffect(() => { setMounted(true); }, []);

  const handleAddExercise = useCallback(() => {
    if (currentExercise.name.trim() && parseInt(currentExercise.sets) > 0 && parseInt(currentExercise.reps) > 0) {
      const entry: ExerciseEntry = {
        id: crypto.randomUUID(),
        name: currentExercise.name.trim(),
        sets: parseInt(currentExercise.sets),
        reps: parseInt(currentExercise.reps),
        weight: parseFloat(currentExercise.weight) || 0,
      };
      setExercises(prev => [...prev, entry]);
      setCurrentExercise({ name: "", sets: "", reps: "", weight: "" });
    }
  }, [currentExercise]);

  const handleSaveWorkout = () => {
    if (exercises.length === 0) return;
    saveWorkout({
      date: workoutDate,
      exercises: exercises.map((e) => ({
        id: e.id, name: e.name,
        sets: Array.from({ length: e.sets }, () => ({ weight: e.weight, reps: e.reps })),
      })),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });
    setExercises([]);
    setWorkoutDate(getTodayDate());
    setView("home");
    loadData();
  };

  const handleDeleteWorkout = useCallback((id: string) => {
    if (confirm("Delete this workout?")) {
      deleteWorkout(id);
      setWorkoutHistory(prev => prev.filter(w => w.id !== id));
    }
  }, []);

  const resetForm = useCallback(() => {
    setExercises([]);
    setWorkoutDate(today);
    setCurrentExercise({ name: "", sets: "", reps: "", weight: "" });
    setView("home");
  }, [today]);

  return (
    <div className="min-h-screen pb-24">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-8">
        {view === "home" && (
          <WorkoutHome mounted={mounted} history={workoutHistory} onLogWorkout={() => setView("log")} onViewHistory={() => setView("history")} onDeleteWorkout={handleDeleteWorkout} />
        )}
        {view === "log" && (
          <LogWorkout date={workoutDate} onDateChange={setWorkoutDate} exercises={exercises} currentExercise={currentExercise} onCurrentExerciseChange={setCurrentExercise} onAddExercise={handleAddExercise} onRemoveExercise={(id) => setExercises(prev => prev.filter(e => e.id !== id))} onSave={handleSaveWorkout} onCancel={resetForm} />
        )}
        {view === "history" && (
          <WorkoutHistory workouts={workoutHistory} onBack={() => setView("home")} onDelete={handleDeleteWorkout} />
        )}
      </main>
    </div>
  );
}

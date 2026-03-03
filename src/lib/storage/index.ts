// Barrel re-export — all existing imports from "@/lib/storage" continue to work
export { STORAGE_KEYS, generateId, getTodayDate, clearStorageCache } from "./core";
export { getHabits, saveHabit, updateHabit, deleteHabit, isHabitDueOnDate, getDueHabits, getWeeklyCompletionCount, hasMetWeeklyTarget } from "./habits";
export { getCompletions, toggleCompletion, isHabitCompleted } from "./completions";
export { getRecoveries, saveRecovery, hasRecoveryForHabit } from "./recoveries";
export { getReflections, saveReflection } from "./reflections";
export { getPriorities, savePriority, updatePriority, deletePriority } from "./priorities";
export { getWorkouts, getWorkout, startWorkout, saveWorkout, updateWorkout, completeWorkout, deleteWorkout, addExerciseToWorkout, addSetToExercise, updateSet, removeSet, removeExercise, getSavedExercises, saveExerciseToLibrary, updateSavedExercise, deleteSavedExercise, getWorkoutStats } from "./workouts";
export { getVisionItems, saveVisionItem, updateVisionItem, deleteVisionItem, reorderVisionItems } from "./vision";
export { getCountdownEvents, getUpcomingEvents, getNextEvent, saveCountdownEvent, updateCountdownEvent, deleteCountdownEvent, getDaysUntil } from "./countdown";
export { getCurrentStreak, getHabitStreak, getLongestStreak, getCompletionRate, getAchievements } from "./streaks";
export type { Achievement } from "./streaks";
export { getWaterLog, addWater, removeWater, setWaterTarget } from "./water";
export { exportAllData, importAllData } from "./backup";

// getMissedHabitsYesterday lives here to avoid circular dependency between habits.ts and completions.ts
import { Habit } from "../types";
import { getHabits, isHabitDueOnDate } from "./habits";
import { getCompletions } from "./completions";
import { getTodayDate } from "./core";

export function getMissedHabitsYesterday(): Habit[] {
  const habits = getHabits();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const completions = getCompletions(yesterdayStr);

  return habits.filter((habit) => {
    const habitCreatedDate = habit.createdAt.split("T")[0];
    if (habitCreatedDate >= getTodayDate()) {
      return false;
    }

    if (!isHabitDueOnDate(habit, yesterdayStr)) {
      return false;
    }

    const completion = completions.find((c) => c.habitId === habit.id);
    return !completion?.completed;
  });
}

import { HabitCompletion } from "../types";
import { STORAGE_KEYS, getFromStorage, saveToStorage } from "./core";

export function getCompletions(date?: string): HabitCompletion[] {
  const completions = getFromStorage<HabitCompletion>(STORAGE_KEYS.COMPLETIONS);
  if (date) {
    return completions.filter((c) => c.date === date);
  }
  return completions;
}

export function toggleCompletion(habitId: string, date: string): HabitCompletion {
  const completions = getCompletions();
  const existingIndex = completions.findIndex(
    (c) => c.habitId === habitId && c.date === date
  );

  if (existingIndex !== -1) {
    completions[existingIndex].completed = !completions[existingIndex].completed;
    if (completions[existingIndex].completed) {
      completions[existingIndex].completedAt = new Date().toISOString();
    } else {
      delete completions[existingIndex].completedAt;
    }
    saveToStorage(STORAGE_KEYS.COMPLETIONS, completions);
    return completions[existingIndex];
  } else {
    const newCompletion: HabitCompletion = {
      habitId,
      date,
      completed: true,
      completedAt: new Date().toISOString(),
    };
    completions.push(newCompletion);
    saveToStorage(STORAGE_KEYS.COMPLETIONS, completions);
    return newCompletion;
  }
}

export function isHabitCompleted(habitId: string, date: string): boolean {
  const completions = getCompletions(date);
  const completion = completions.find((c) => c.habitId === habitId);
  return completion?.completed ?? false;
}


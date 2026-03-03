import { Habit, DayOfWeek } from "../types";
import { STORAGE_KEYS, getFromStorage, saveToStorage, generateId } from "./core";
import { isHabitCompleted } from "./completions";

export function getHabits(): Habit[] {
  return getFromStorage<Habit>(STORAGE_KEYS.HABITS);
}

export function saveHabit(habit: Omit<Habit, "id" | "createdAt">): Habit {
  const habits = getHabits();
  const newHabit: Habit = {
    ...habit,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  habits.push(newHabit);
  saveToStorage(STORAGE_KEYS.HABITS, habits);
  return newHabit;
}

export function updateHabit(id: string, updates: Partial<Habit>): void {
  const habits = getHabits();
  const index = habits.findIndex((h) => h.id === id);
  if (index !== -1) {
    habits[index] = { ...habits[index], ...updates };
    saveToStorage(STORAGE_KEYS.HABITS, habits);
  }
}

export function deleteHabit(id: string): void {
  const habits = getHabits().filter((h) => h.id !== id);
  saveToStorage(STORAGE_KEYS.HABITS, habits);
}

export function isHabitDueOnDate(habit: Habit, dateStr: string): boolean {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay() as DayOfWeek;

  if (!habit.frequency || habit.frequency === "daily") {
    return true;
  }

  if (habit.frequency === "specific_days") {
    return habit.specificDays?.includes(dayOfWeek) ?? false;
  }

  if (habit.frequency === "weekly") {
    return true;
  }

  return true;
}

export function getWeeklyCompletionCount(habitId: string, dateStr: string): number {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  let count = 0;
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(monday);
    checkDate.setDate(monday.getDate() + i);
    const checkDateStr = checkDate.toISOString().split("T")[0];

    if (checkDateStr > dateStr) break;

    if (isHabitCompleted(habitId, checkDateStr)) {
      count++;
    }
  }
  return count;
}

export function hasMetWeeklyTarget(habit: Habit, dateStr: string): boolean {
  if (habit.frequency !== "weekly" || !habit.weeklyTarget) return true;
  const count = getWeeklyCompletionCount(habit.id, dateStr);
  return count >= habit.weeklyTarget;
}

export function getDueHabits(dateStr?: string): Habit[] {
  const date = dateStr || new Date().toISOString().split("T")[0];
  const habits = getHabits();
  return habits.filter((habit) => isHabitDueOnDate(habit, date));
}

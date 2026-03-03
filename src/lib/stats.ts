import { getDueHabits, getCompletions, getWorkouts } from "./storage";

export function computeTodayStats(dateStr: string) {
  const dueHabits = getDueHabits(dateStr);
  const completions = getCompletions(dateStr);
  const dueHabitIds = new Set(dueHabits.map(h => h.id));
  const completed = completions.filter(c => dueHabitIds.has(c.habitId) && c.completed).length;
  return { completed, total: dueHabits.length };
}

export function getStartOfWeek(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function computeWeeklyWorkouts(): number {
  const monday = getStartOfWeek();
  return getWorkouts().filter(w => new Date(w.date) >= monday).length;
}

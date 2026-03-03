import { getHabits, isHabitDueOnDate } from "./habits";
import { getCompletions, isHabitCompleted } from "./completions";
import { getTodayDate } from "./core";

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  unlocked: boolean;
};

// Get the current overall streak (consecutive days with 80%+ habit completion)
export function getCurrentStreak(): number {
  const habits = getHabits();
  if (habits.length === 0) return 0;

  const today = getTodayDate();
  let streak = 0;
  const checkDate = new Date(today);

  const todayDueHabits = habits.filter((h) => {
    if (h.createdAt.split("T")[0] > today) return false;
    return isHabitDueOnDate(h, today);
  });
  const todayCompletions = getCompletions(today);

  const todayDueIds = new Set(todayDueHabits.map(h => h.id));
  const todayCompleted = todayCompletions.filter(c => todayDueIds.has(c.habitId) && c.completed).length;
  const todayRate = todayDueHabits.length > 0 ? todayCompleted / todayDueHabits.length : 0;

  if (todayRate < 0.8) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = checkDate.toISOString().split("T")[0];
    const completions = getCompletions(dateStr);

    const dueHabitsOnDate = habits.filter((h) => {
      if (h.createdAt.split("T")[0] > dateStr) return false;
      return isHabitDueOnDate(h, dateStr);
    });

    if (dueHabitsOnDate.length === 0) {
      checkDate.setDate(checkDate.getDate() - 1);
      if (new Date(today).getTime() - checkDate.getTime() > 365 * 24 * 60 * 60 * 1000) break;
      continue;
    }

    const dueIds = new Set(dueHabitsOnDate.map(h => h.id));
    const completed = completions.filter(c => dueIds.has(c.habitId) && c.completed).length;
    const rate = completed / dueHabitsOnDate.length;

    if (rate >= 0.8) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }

    if (streak > 365) break;
  }

  return streak;
}

// Get streak for a specific habit
export function getHabitStreak(habitId: string): number {
  const habit = getHabits().find((h) => h.id === habitId);
  if (!habit) return 0;

  const today = getTodayDate();
  let streak = 0;
  const checkDate = new Date(today);

  const todayComplete = isHabitCompleted(habitId, today);
  if (!todayComplete) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = checkDate.toISOString().split("T")[0];

    if (dateStr < habit.createdAt.split("T")[0]) break;

    if (isHabitCompleted(habitId, dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }

    if (streak > 365) break;
  }

  return streak;
}

// Get longest streak ever
export function getLongestStreak(): number {
  const habits = getHabits();
  if (habits.length === 0) return 0;

  const earliestDate = habits.reduce((earliest, h) => {
    const created = h.createdAt.split("T")[0];
    return created < earliest ? created : earliest;
  }, getTodayDate());

  let longestStreak = 0;
  let currentStreak = 0;
  const checkDate = new Date(earliestDate);
  const today = new Date(getTodayDate());

  while (checkDate <= today) {
    const dateStr = checkDate.toISOString().split("T")[0];
    const completions = getCompletions(dateStr);

    const dueHabitsOnDate = habits.filter((h) => {
      if (h.createdAt.split("T")[0] > dateStr) return false;
      return isHabitDueOnDate(h, dateStr);
    });

    if (dueHabitsOnDate.length === 0) {
      checkDate.setDate(checkDate.getDate() + 1);
      continue;
    }

    const dueIds = new Set(dueHabitsOnDate.map(h => h.id));
    const completed = completions.filter(c => dueIds.has(c.habitId) && c.completed).length;
    const rate = completed / dueHabitsOnDate.length;

    if (rate >= 0.8) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }

    checkDate.setDate(checkDate.getDate() + 1);
  }

  return longestStreak;
}

// Stats helpers
export function getCompletionRate(days: number = 7): number {
  const habits = getHabits();
  if (habits.length === 0) return 0;

  let totalExpected = 0;
  let totalCompleted = 0;

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const completions = getCompletions(dateStr);

    const dueHabits = habits.filter((h) => {
      if (h.createdAt.split("T")[0] > dateStr) return false;
      return isHabitDueOnDate(h, dateStr);
    });

    totalExpected += dueHabits.length;

    const dueHabitIds = new Set(dueHabits.map(h => h.id));
    totalCompleted += completions.filter(c => dueHabitIds.has(c.habitId) && c.completed).length;
  }

  return totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;
}

// Get achievements based on streaks
export function getAchievements(): Achievement[] {
  const currentStreak = getCurrentStreak();
  const longestStreak = getLongestStreak();
  const bestStreak = Math.max(currentStreak, longestStreak);

  return [
    { id: "streak-3", name: "First Steps", description: "3 day streak", icon: "seedling", requirement: 3, unlocked: bestStreak >= 3 },
    { id: "streak-7", name: "One Week", description: "7 day streak", icon: "flame", requirement: 7, unlocked: bestStreak >= 7 },
    { id: "streak-14", name: "Two Weeks", description: "14 day streak", icon: "biceps", requirement: 14, unlocked: bestStreak >= 14 },
    { id: "streak-30", name: "Locked In", description: "30 day streak", icon: "zap", requirement: 30, unlocked: bestStreak >= 30 },
    { id: "streak-60", name: "Unstoppable", description: "60 day streak", icon: "trophy", requirement: 60, unlocked: bestStreak >= 60 },
    { id: "streak-100", name: "Centurion", description: "100 day streak", icon: "crown", requirement: 100, unlocked: bestStreak >= 100 },
    { id: "streak-365", name: "Year of Discipline", description: "365 day streak", icon: "target", requirement: 365, unlocked: bestStreak >= 365 },
  ];
}

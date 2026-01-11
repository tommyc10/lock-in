import { Habit, HabitCompletion, Recovery, Reflection, Priority, Workout, SavedExercise, Exercise, ExerciseSet, VisionItem, VisionCategory, CountdownEvent } from "./types";

const STORAGE_KEYS = {
  HABITS: "lockin_habits",
  COMPLETIONS: "lockin_completions",
  RECOVERIES: "lockin_recoveries",
  REFLECTIONS: "lockin_reflections",
  PRIORITIES: "lockin_priorities",
  WORKOUTS: "lockin_workouts",
  SAVED_EXERCISES: "lockin_saved_exercises",
  VISION_BOARD: "lockin_vision_board",
  COUNTDOWN_EVENTS: "lockin_countdown_events",
} as const;

// Generate a simple unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get today's date in YYYY-MM-DD format
export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

// Generic storage helpers
function getFromStorage<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

// Habits
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

// Completions
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
    // Toggle existing
    completions[existingIndex].completed = !completions[existingIndex].completed;
    if (completions[existingIndex].completed) {
      completions[existingIndex].completedAt = new Date().toISOString();
    } else {
      delete completions[existingIndex].completedAt;
    }
    saveToStorage(STORAGE_KEYS.COMPLETIONS, completions);
    return completions[existingIndex];
  } else {
    // Create new completion
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

// Check if a habit was missed yesterday (for recovery prompts)
export function getMissedHabitsYesterday(): Habit[] {
  const habits = getHabits();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const completions = getCompletions(yesterdayStr);

  return habits.filter((habit) => {
    // Only count as missed if the habit existed before today
    const habitCreatedDate = habit.createdAt.split("T")[0];
    if (habitCreatedDate >= getTodayDate()) {
      return false; // Habit was created today, can't be "missed" yesterday
    }

    const completion = completions.find((c) => c.habitId === habit.id);
    return !completion?.completed;
  });
}

// Recoveries
export function getRecoveries(): Recovery[] {
  return getFromStorage<Recovery>(STORAGE_KEYS.RECOVERIES);
}

export function saveRecovery(recovery: Omit<Recovery, "id" | "createdAt">): Recovery {
  const recoveries = getRecoveries();
  const newRecovery: Recovery = {
    ...recovery,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  recoveries.push(newRecovery);
  saveToStorage(STORAGE_KEYS.RECOVERIES, recoveries);
  return newRecovery;
}

export function hasRecoveryForHabit(habitId: string, date: string): boolean {
  const recoveries = getRecoveries();
  return recoveries.some((r) => r.habitId === habitId && r.date === date);
}

// Reflections
export function getReflections(date?: string): Reflection[] {
  const reflections = getFromStorage<Reflection>(STORAGE_KEYS.REFLECTIONS);
  if (date) {
    return reflections.filter((r) => r.date === date);
  }
  return reflections;
}

export function saveReflection(reflection: Omit<Reflection, "id" | "createdAt">): Reflection {
  const reflections = getReflections();
  // Replace if same type and date exists
  const existingIndex = reflections.findIndex(
    (r) => r.date === reflection.date && r.type === reflection.type
  );

  const newReflection: Reflection = {
    ...reflection,
    id: existingIndex !== -1 ? reflections[existingIndex].id : generateId(),
    createdAt: new Date().toISOString(),
  };

  if (existingIndex !== -1) {
    reflections[existingIndex] = newReflection;
  } else {
    reflections.push(newReflection);
  }

  saveToStorage(STORAGE_KEYS.REFLECTIONS, reflections);
  return newReflection;
}

// Priorities
export function getPriorities(date?: string): Priority[] {
  const priorities = getFromStorage<Priority>(STORAGE_KEYS.PRIORITIES);
  if (date) {
    return priorities.filter((p) => p.date === date).sort((a, b) => a.order - b.order);
  }
  return priorities;
}

export function savePriority(priority: Omit<Priority, "id">): Priority {
  const priorities = getPriorities();
  const newPriority: Priority = {
    ...priority,
    id: generateId(),
  };
  priorities.push(newPriority);
  saveToStorage(STORAGE_KEYS.PRIORITIES, priorities);
  return newPriority;
}

export function updatePriority(id: string, updates: Partial<Priority>): void {
  const priorities = getPriorities();
  const index = priorities.findIndex((p) => p.id === id);
  if (index !== -1) {
    priorities[index] = { ...priorities[index], ...updates };
    saveToStorage(STORAGE_KEYS.PRIORITIES, priorities);
  }
}

export function deletePriority(id: string): void {
  const priorities = getPriorities().filter((p) => p.id !== id);
  saveToStorage(STORAGE_KEYS.PRIORITIES, priorities);
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
    totalExpected += habits.length;
    totalCompleted += completions.filter((c) => c.completed).length;
  }

  return totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;
}

// ============ WORKOUTS ============

// Get all workouts, optionally filtered by date
export function getWorkouts(date?: string): Workout[] {
  const workouts = getFromStorage<Workout>(STORAGE_KEYS.WORKOUTS);
  if (date) {
    return workouts.filter((w) => w.date === date);
  }
  return workouts.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

// Get a single workout by ID
export function getWorkout(id: string): Workout | undefined {
  const workouts = getWorkouts();
  return workouts.find((w) => w.id === id);
}

// Start a new workout
export function startWorkout(): Workout {
  const workouts = getWorkouts();
  const newWorkout: Workout = {
    id: generateId(),
    date: getTodayDate(),
    exercises: [],
    startedAt: new Date().toISOString(),
  };
  workouts.push(newWorkout);
  saveToStorage(STORAGE_KEYS.WORKOUTS, workouts);
  return newWorkout;
}

// Save a complete workout
export function saveWorkout(workout: Omit<Workout, "id">): Workout {
  const workouts = getWorkouts();
  const newWorkout: Workout = {
    ...workout,
    id: generateId(),
  };
  workouts.push(newWorkout);
  saveToStorage(STORAGE_KEYS.WORKOUTS, workouts);
  return newWorkout;
}

// Update a workout
export function updateWorkout(id: string, updates: Partial<Workout>): void {
  const workouts = getWorkouts();
  const index = workouts.findIndex((w) => w.id === id);
  if (index !== -1) {
    workouts[index] = { ...workouts[index], ...updates };
    saveToStorage(STORAGE_KEYS.WORKOUTS, workouts);
  }
}

// Complete a workout
export function completeWorkout(id: string): void {
  updateWorkout(id, { completedAt: new Date().toISOString() });
}

// Delete a workout
export function deleteWorkout(id: string): void {
  const workouts = getWorkouts().filter((w) => w.id !== id);
  saveToStorage(STORAGE_KEYS.WORKOUTS, workouts);
}

// Add exercise to workout
export function addExerciseToWorkout(workoutId: string, exerciseName: string): Exercise {
  const workout = getWorkout(workoutId);
  if (!workout) throw new Error("Workout not found");

  const newExercise: Exercise = {
    id: generateId(),
    name: exerciseName,
    sets: [],
  };

  workout.exercises.push(newExercise);
  updateWorkout(workoutId, { exercises: workout.exercises });

  // Save to saved exercises for future quick-add
  saveExerciseToLibrary(exerciseName);

  return newExercise;
}

// Add set to exercise
export function addSetToExercise(workoutId: string, exerciseId: string, set: ExerciseSet): void {
  const workout = getWorkout(workoutId);
  if (!workout) throw new Error("Workout not found");

  const exercise = workout.exercises.find((e) => e.id === exerciseId);
  if (!exercise) throw new Error("Exercise not found");

  exercise.sets.push(set);
  updateWorkout(workoutId, { exercises: workout.exercises });

  // Update saved exercise with last weight/reps
  updateSavedExercise(exercise.name, set.weight, set.reps);
}

// Update a set
export function updateSet(workoutId: string, exerciseId: string, setIndex: number, set: ExerciseSet): void {
  const workout = getWorkout(workoutId);
  if (!workout) throw new Error("Workout not found");

  const exercise = workout.exercises.find((e) => e.id === exerciseId);
  if (!exercise) throw new Error("Exercise not found");

  exercise.sets[setIndex] = set;
  updateWorkout(workoutId, { exercises: workout.exercises });
}

// Remove a set
export function removeSet(workoutId: string, exerciseId: string, setIndex: number): void {
  const workout = getWorkout(workoutId);
  if (!workout) throw new Error("Workout not found");

  const exercise = workout.exercises.find((e) => e.id === exerciseId);
  if (!exercise) throw new Error("Exercise not found");

  exercise.sets.splice(setIndex, 1);
  updateWorkout(workoutId, { exercises: workout.exercises });
}

// Remove an exercise
export function removeExercise(workoutId: string, exerciseId: string): void {
  const workout = getWorkout(workoutId);
  if (!workout) throw new Error("Workout not found");

  workout.exercises = workout.exercises.filter((e) => e.id !== exerciseId);
  updateWorkout(workoutId, { exercises: workout.exercises });
}

// ============ SAVED EXERCISES (Library) ============

export function getSavedExercises(): SavedExercise[] {
  return getFromStorage<SavedExercise>(STORAGE_KEYS.SAVED_EXERCISES)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function saveExerciseToLibrary(name: string): SavedExercise {
  const exercises = getSavedExercises();
  const existing = exercises.find((e) => e.name.toLowerCase() === name.toLowerCase());

  if (existing) return existing;

  const newExercise: SavedExercise = {
    id: generateId(),
    name,
    createdAt: new Date().toISOString(),
  };
  exercises.push(newExercise);
  saveToStorage(STORAGE_KEYS.SAVED_EXERCISES, exercises);
  return newExercise;
}

export function updateSavedExercise(name: string, weight: number, reps: number): void {
  const exercises = getSavedExercises();
  const index = exercises.findIndex((e) => e.name.toLowerCase() === name.toLowerCase());

  if (index !== -1) {
    exercises[index].lastWeight = weight;
    exercises[index].lastReps = reps;
    saveToStorage(STORAGE_KEYS.SAVED_EXERCISES, exercises);
  }
}

export function deleteSavedExercise(id: string): void {
  const exercises = getSavedExercises().filter((e) => e.id !== id);
  saveToStorage(STORAGE_KEYS.SAVED_EXERCISES, exercises);
}

// Get workout stats
export function getWorkoutStats(days: number = 30): { totalWorkouts: number; totalSets: number; avgDuration: number } {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const workouts = getWorkouts().filter(
    (w) => new Date(w.startedAt) >= cutoff && w.completedAt
  );

  const totalWorkouts = workouts.length;
  const totalSets = workouts.reduce(
    (sum, w) => sum + w.exercises.reduce((eSum, e) => eSum + e.sets.length, 0),
    0
  );

  const avgDuration =
    workouts.length > 0
      ? workouts.reduce((sum, w) => {
          if (w.completedAt) {
            return sum + (new Date(w.completedAt).getTime() - new Date(w.startedAt).getTime());
          }
          return sum;
        }, 0) /
        workouts.length /
        60000 // Convert to minutes
      : 0;

  return { totalWorkouts, totalSets, avgDuration: Math.round(avgDuration) };
}

// ============ VISION BOARD ============

export function getVisionItems(category?: VisionCategory): VisionItem[] {
  const items = getFromStorage<VisionItem>(STORAGE_KEYS.VISION_BOARD);
  if (category) {
    return items.filter((item) => item.category === category).sort((a, b) => a.order - b.order);
  }
  return items.sort((a, b) => a.order - b.order);
}

export function saveVisionItem(item: Omit<VisionItem, "id" | "createdAt" | "order">): VisionItem {
  const items = getVisionItems();
  const categoryItems = items.filter((i) => i.category === item.category);
  const newItem: VisionItem = {
    ...item,
    id: generateId(),
    createdAt: new Date().toISOString(),
    order: categoryItems.length,
  };
  items.push(newItem);
  saveToStorage(STORAGE_KEYS.VISION_BOARD, items);
  return newItem;
}

export function updateVisionItem(id: string, updates: Partial<VisionItem>): void {
  const items = getVisionItems();
  const index = items.findIndex((item) => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    saveToStorage(STORAGE_KEYS.VISION_BOARD, items);
  }
}

export function deleteVisionItem(id: string): void {
  const items = getVisionItems().filter((item) => item.id !== id);
  saveToStorage(STORAGE_KEYS.VISION_BOARD, items);
}

export function reorderVisionItems(category: VisionCategory, itemIds: string[]): void {
  const items = getVisionItems();
  itemIds.forEach((id, index) => {
    const itemIndex = items.findIndex((item) => item.id === id);
    if (itemIndex !== -1) {
      items[itemIndex].order = index;
    }
  });
  saveToStorage(STORAGE_KEYS.VISION_BOARD, items);
}

// ============ COUNTDOWN EVENTS ============

export function getCountdownEvents(): CountdownEvent[] {
  return getFromStorage<CountdownEvent>(STORAGE_KEYS.COUNTDOWN_EVENTS)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getUpcomingEvents(): CountdownEvent[] {
  const today = getTodayDate();
  return getCountdownEvents().filter((event) => event.date >= today);
}

export function getNextEvent(): CountdownEvent | null {
  const upcoming = getUpcomingEvents();
  return upcoming.length > 0 ? upcoming[0] : null;
}

export function saveCountdownEvent(event: Omit<CountdownEvent, "id" | "createdAt">): CountdownEvent {
  const events = getCountdownEvents();
  const newEvent: CountdownEvent = {
    ...event,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  events.push(newEvent);
  saveToStorage(STORAGE_KEYS.COUNTDOWN_EVENTS, events);
  return newEvent;
}

export function updateCountdownEvent(id: string, updates: Partial<CountdownEvent>): void {
  const events = getCountdownEvents();
  const index = events.findIndex((e) => e.id === id);
  if (index !== -1) {
    events[index] = { ...events[index], ...updates };
    saveToStorage(STORAGE_KEYS.COUNTDOWN_EVENTS, events);
  }
}

export function deleteCountdownEvent(id: string): void {
  const events = getCountdownEvents().filter((e) => e.id !== id);
  saveToStorage(STORAGE_KEYS.COUNTDOWN_EVENTS, events);
}

export function getDaysUntil(date: string): number {
  const today = new Date(getTodayDate());
  const eventDate = new Date(date);
  const diffTime = eventDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// ============ STREAKS ============

// Get the current overall streak (consecutive days with 80%+ habit completion)
export function getCurrentStreak(): number {
  const habits = getHabits();
  if (habits.length === 0) return 0;

  const today = getTodayDate();
  let streak = 0;
  let checkDate = new Date(today);

  // Check if today is complete - if not, start from yesterday
  const todayCompletions = getCompletions(today);
  const todayCompleted = todayCompletions.filter((c) => c.completed).length;
  const todayRate = habits.length > 0 ? todayCompleted / habits.length : 0;

  if (todayRate < 0.8) {
    // Today not yet complete, check from yesterday
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Count consecutive days with 80%+ completion
  while (true) {
    const dateStr = checkDate.toISOString().split("T")[0];
    const completions = getCompletions(dateStr);

    // Get habits that existed on this date
    const habitsOnDate = habits.filter((h) => h.createdAt.split("T")[0] <= dateStr);
    if (habitsOnDate.length === 0) break;

    const completed = completions.filter((c) => c.completed).length;
    const rate = completed / habitsOnDate.length;

    if (rate >= 0.8) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }

    // Safety limit - don't check more than a year back
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
  let checkDate = new Date(today);

  // Check if today is complete for this habit
  const todayComplete = isHabitCompleted(habitId, today);
  if (!todayComplete) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Count consecutive days
  while (true) {
    const dateStr = checkDate.toISOString().split("T")[0];

    // Don't count days before habit was created
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

  // Find the earliest habit creation date
  const earliestDate = habits.reduce((earliest, h) => {
    const created = h.createdAt.split("T")[0];
    return created < earliest ? created : earliest;
  }, getTodayDate());

  let longestStreak = 0;
  let currentStreak = 0;
  let checkDate = new Date(earliestDate);
  const today = new Date(getTodayDate());

  while (checkDate <= today) {
    const dateStr = checkDate.toISOString().split("T")[0];
    const completions = getCompletions(dateStr);

    const habitsOnDate = habits.filter((h) => h.createdAt.split("T")[0] <= dateStr);
    if (habitsOnDate.length === 0) {
      checkDate.setDate(checkDate.getDate() + 1);
      continue;
    }

    const completed = completions.filter((c) => c.completed).length;
    const rate = completed / habitsOnDate.length;

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

// Get achievements based on streaks
export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  unlocked: boolean;
};

export function getAchievements(): Achievement[] {
  const currentStreak = getCurrentStreak();
  const longestStreak = getLongestStreak();
  const bestStreak = Math.max(currentStreak, longestStreak);

  const achievements: Achievement[] = [
    {
      id: "streak-3",
      name: "First Steps",
      description: "3 day streak",
      icon: "🌱",
      requirement: 3,
      unlocked: bestStreak >= 3,
    },
    {
      id: "streak-7",
      name: "One Week",
      description: "7 day streak",
      icon: "🔥",
      requirement: 7,
      unlocked: bestStreak >= 7,
    },
    {
      id: "streak-14",
      name: "Two Weeks",
      description: "14 day streak",
      icon: "💪",
      requirement: 14,
      unlocked: bestStreak >= 14,
    },
    {
      id: "streak-30",
      name: "Locked In",
      description: "30 day streak",
      icon: "⚡",
      requirement: 30,
      unlocked: bestStreak >= 30,
    },
    {
      id: "streak-60",
      name: "Unstoppable",
      description: "60 day streak",
      icon: "🏆",
      requirement: 60,
      unlocked: bestStreak >= 60,
    },
    {
      id: "streak-100",
      name: "Centurion",
      description: "100 day streak",
      icon: "👑",
      requirement: 100,
      unlocked: bestStreak >= 100,
    },
    {
      id: "streak-365",
      name: "Year of Discipline",
      description: "365 day streak",
      icon: "🎯",
      requirement: 365,
      unlocked: bestStreak >= 365,
    },
  ];

  return achievements;
}

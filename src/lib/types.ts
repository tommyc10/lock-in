export type TimeOfDay = "morning" | "afternoon" | "evening";

export interface Habit {
  id: string;
  name: string;
  timeOfDay: TimeOfDay;
  createdAt: string;
}

export interface HabitCompletion {
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  completedAt?: string;
}

export interface Recovery {
  id: string;
  habitId: string;
  date: string;
  whatHappened: string;
  howToPrevent: string;
  createdAt: string;
}

export interface Reflection {
  id: string;
  date: string;
  type: "wins" | "struggles" | "tomorrow";
  content: string;
  createdAt: string;
}

export interface Priority {
  id: string;
  date: string;
  content: string;
  completed: boolean;
  order: number;
}

export interface DayData {
  date: string;
  completions: HabitCompletion[];
  reflections: Reflection[];
  priorities: Priority[];
}

// Habit templates for quick start
export interface HabitTemplate {
  name: string;
  timeOfDay: TimeOfDay;
  category: string;
}

// Workout types
export interface ExerciseSet {
  reps: number;
  weight: number; // in kg or lbs based on user preference
}

export interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
}

export interface Workout {
  id: string;
  date: string; // YYYY-MM-DD
  exercises: Exercise[];
  notes?: string;
  startedAt: string;
  completedAt?: string;
}

// User's saved exercises (for quick add)
export interface SavedExercise {
  id: string;
  name: string;
  lastWeight?: number;
  lastReps?: number;
  createdAt: string;
}

export const HABIT_TEMPLATES: HabitTemplate[] = [
  // Morning
  { name: "Drink water", timeOfDay: "morning", category: "Health" },
  { name: "Morning stretch", timeOfDay: "morning", category: "Fitness" },
  { name: "Skincare routine", timeOfDay: "morning", category: "Appearance" },
  { name: "Review priorities", timeOfDay: "morning", category: "Productivity" },

  // Afternoon
  { name: "Gym workout", timeOfDay: "afternoon", category: "Fitness" },
  { name: "Healthy lunch", timeOfDay: "afternoon", category: "Nutrition" },
  { name: "Walk outside", timeOfDay: "afternoon", category: "Health" },

  // Evening
  { name: "Evening skincare", timeOfDay: "evening", category: "Appearance" },
  { name: "Log meals", timeOfDay: "evening", category: "Nutrition" },
  { name: "Plan tomorrow", timeOfDay: "evening", category: "Productivity" },
  { name: "Read", timeOfDay: "evening", category: "Growth" },
];

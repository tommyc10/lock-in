import { Workout, Exercise, ExerciseSet, SavedExercise } from "../types";
import { STORAGE_KEYS, getFromStorage, saveToStorage, generateId, getTodayDate } from "./core";

// ============ WORKOUTS ============

export function getWorkouts(date?: string): Workout[] {
  const workouts = getFromStorage<Workout>(STORAGE_KEYS.WORKOUTS);
  if (date) {
    return workouts.filter((w) => w.date === date);
  }
  return workouts.toSorted((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

export function getWorkout(id: string): Workout | undefined {
  const workouts = getWorkouts();
  return workouts.find((w) => w.id === id);
}

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

export function updateWorkout(id: string, updates: Partial<Workout>): void {
  const workouts = getWorkouts();
  const index = workouts.findIndex((w) => w.id === id);
  if (index !== -1) {
    workouts[index] = { ...workouts[index], ...updates };
    saveToStorage(STORAGE_KEYS.WORKOUTS, workouts);
  }
}

export function completeWorkout(id: string): void {
  updateWorkout(id, { completedAt: new Date().toISOString() });
}

export function deleteWorkout(id: string): void {
  const workouts = getWorkouts().filter((w) => w.id !== id);
  saveToStorage(STORAGE_KEYS.WORKOUTS, workouts);
}

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

  saveExerciseToLibrary(exerciseName);

  return newExercise;
}

export function addSetToExercise(workoutId: string, exerciseId: string, set: ExerciseSet): void {
  const workout = getWorkout(workoutId);
  if (!workout) throw new Error("Workout not found");

  const exercise = workout.exercises.find((e) => e.id === exerciseId);
  if (!exercise) throw new Error("Exercise not found");

  exercise.sets.push(set);
  updateWorkout(workoutId, { exercises: workout.exercises });

  updateSavedExercise(exercise.name, set.weight, set.reps);
}

export function updateSet(workoutId: string, exerciseId: string, setIndex: number, set: ExerciseSet): void {
  const workout = getWorkout(workoutId);
  if (!workout) throw new Error("Workout not found");

  const exercise = workout.exercises.find((e) => e.id === exerciseId);
  if (!exercise) throw new Error("Exercise not found");

  exercise.sets[setIndex] = set;
  updateWorkout(workoutId, { exercises: workout.exercises });
}

export function removeSet(workoutId: string, exerciseId: string, setIndex: number): void {
  const workout = getWorkout(workoutId);
  if (!workout) throw new Error("Workout not found");

  const exercise = workout.exercises.find((e) => e.id === exerciseId);
  if (!exercise) throw new Error("Exercise not found");

  exercise.sets.splice(setIndex, 1);
  updateWorkout(workoutId, { exercises: workout.exercises });
}

export function removeExercise(workoutId: string, exerciseId: string): void {
  const workout = getWorkout(workoutId);
  if (!workout) throw new Error("Workout not found");

  workout.exercises = workout.exercises.filter((e) => e.id !== exerciseId);
  updateWorkout(workoutId, { exercises: workout.exercises });
}

// ============ SAVED EXERCISES (Library) ============

export function getSavedExercises(): SavedExercise[] {
  return getFromStorage<SavedExercise>(STORAGE_KEYS.SAVED_EXERCISES)
    .toSorted((a, b) => a.name.localeCompare(b.name));
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
        60000
      : 0;

  return { totalWorkouts, totalSets, avgDuration: Math.round(avgDuration) };
}

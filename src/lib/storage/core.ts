export const STORAGE_KEYS = {
  HABITS: "lockin_habits",
  COMPLETIONS: "lockin_completions",
  RECOVERIES: "lockin_recoveries",
  REFLECTIONS: "lockin_reflections",
  PRIORITIES: "lockin_priorities",
  WORKOUTS: "lockin_workouts",
  SAVED_EXERCISES: "lockin_saved_exercises",
  VISION_BOARD: "lockin_vision_board",
  COUNTDOWN_EVENTS: "lockin_countdown_events",
  WATER: "lockin_water",
} as const;

// Storage cache for O(1) repeated reads
const storageCache = new Map<string, unknown>();

// Invalidate cache on visibility change (external changes from other tabs)
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key) storageCache.delete(e.key);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      storageCache.clear();
    }
  });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function getFromStorage<T>(key: string): T[] {
  if (typeof window === "undefined") return [];

  if (storageCache.has(key)) {
    return storageCache.get(key) as T[];
  }

  try {
    const data = localStorage.getItem(key);
    const parsed = data ? JSON.parse(data) : [];
    storageCache.set(key, parsed);
    return parsed;
  } catch (e) {
    console.error(`[Lock In] Failed to read ${key}:`, e);
    return [];
  }
}

export function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    storageCache.delete(key);
  } catch (e) {
    console.error(`[Lock In] Failed to save ${key}:`, e);
  }
}

export function clearStorageCache(): void {
  storageCache.clear();
}

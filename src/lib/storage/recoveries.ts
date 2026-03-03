import { Recovery } from "../types";
import { STORAGE_KEYS, getFromStorage, saveToStorage, generateId } from "./core";

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

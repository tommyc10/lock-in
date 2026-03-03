import { Priority } from "../types";
import { STORAGE_KEYS, getFromStorage, saveToStorage, generateId } from "./core";

export function getPriorities(date?: string): Priority[] {
  const priorities = getFromStorage<Priority>(STORAGE_KEYS.PRIORITIES);
  if (date) {
    return priorities.filter((p) => p.date === date).toSorted((a, b) => a.order - b.order);
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

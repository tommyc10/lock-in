import { Reflection } from "../types";
import { STORAGE_KEYS, getFromStorage, saveToStorage, generateId } from "./core";

export function getReflections(date?: string): Reflection[] {
  const reflections = getFromStorage<Reflection>(STORAGE_KEYS.REFLECTIONS);
  if (date) {
    return reflections.filter((r) => r.date === date);
  }
  return reflections;
}

export function saveReflection(reflection: Omit<Reflection, "id" | "createdAt">): Reflection {
  const reflections = getReflections();
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

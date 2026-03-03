import { WaterLog } from "../types";
import { STORAGE_KEYS, getFromStorage, saveToStorage, getTodayDate } from "./core";

const DEFAULT_TARGET = 8;

export function getWaterLog(date?: string): WaterLog {
  const targetDate = date || getTodayDate();
  const logs = getFromStorage<WaterLog>(STORAGE_KEYS.WATER);
  const existing = logs.find((l) => l.date === targetDate);
  return existing || { date: targetDate, glasses: 0, target: getWaterTarget() };
}

export function addWater(date?: string): WaterLog {
  const targetDate = date || getTodayDate();
  const logs = getFromStorage<WaterLog>(STORAGE_KEYS.WATER);
  const index = logs.findIndex((l) => l.date === targetDate);

  if (index !== -1) {
    logs[index].glasses++;
    saveToStorage(STORAGE_KEYS.WATER, logs);
    return logs[index];
  } else {
    const newLog: WaterLog = { date: targetDate, glasses: 1, target: getWaterTarget() };
    logs.push(newLog);
    saveToStorage(STORAGE_KEYS.WATER, logs);
    return newLog;
  }
}

export function removeWater(date?: string): WaterLog {
  const targetDate = date || getTodayDate();
  const logs = getFromStorage<WaterLog>(STORAGE_KEYS.WATER);
  const index = logs.findIndex((l) => l.date === targetDate);

  if (index !== -1 && logs[index].glasses > 0) {
    logs[index].glasses--;
    saveToStorage(STORAGE_KEYS.WATER, logs);
    return logs[index];
  }

  return getWaterLog(targetDate);
}

function getWaterTarget(): number {
  if (typeof window === "undefined") return DEFAULT_TARGET;
  try {
    const stored = localStorage.getItem("lockin_water_target");
    return stored ? parseInt(stored, 10) : DEFAULT_TARGET;
  } catch {
    return DEFAULT_TARGET;
  }
}

export function setWaterTarget(target: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("lockin_water_target", String(target));
}

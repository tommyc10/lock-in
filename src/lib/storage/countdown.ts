import { CountdownEvent } from "../types";
import { STORAGE_KEYS, getFromStorage, saveToStorage, generateId, getTodayDate } from "./core";

export function getCountdownEvents(): CountdownEvent[] {
  return getFromStorage<CountdownEvent>(STORAGE_KEYS.COUNTDOWN_EVENTS)
    .toSorted((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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

import { STORAGE_KEYS, clearStorageCache } from "./core";

interface BackupData {
  version: number;
  exportedAt: string;
  data: Record<string, unknown>;
}

export function exportAllData(): string {
  const data: Record<string, unknown> = {};
  for (const [name, key] of Object.entries(STORAGE_KEYS)) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) data[name] = JSON.parse(raw);
    } catch {
      // Skip corrupted entries
    }
  }
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      data,
    } satisfies BackupData,
    null,
    2
  );
}

export function importAllData(json: string): { success: boolean; error?: string } {
  try {
    const parsed: BackupData = JSON.parse(json);
    if (!parsed.version || !parsed.data) {
      return { success: false, error: "Invalid backup format" };
    }
    for (const [name, key] of Object.entries(STORAGE_KEYS)) {
      if (parsed.data[name]) {
        localStorage.setItem(key, JSON.stringify(parsed.data[name]));
      }
    }
    clearStorageCache();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to parse backup file" };
  }
}

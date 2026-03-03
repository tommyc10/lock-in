import { VisionItem, VisionCategory } from "../types";
import { STORAGE_KEYS, getFromStorage, saveToStorage, generateId } from "./core";

export function getVisionItems(category?: VisionCategory): VisionItem[] {
  const items = getFromStorage<VisionItem>(STORAGE_KEYS.VISION_BOARD);
  if (category) {
    return items.filter((item) => item.category === category).toSorted((a, b) => a.order - b.order);
  }
  return items.toSorted((a, b) => a.order - b.order);
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

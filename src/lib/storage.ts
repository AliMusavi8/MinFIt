// ─── MinFit — Local Storage Layer ─────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';
import { JournalEntry, StreakData } from '../types';

const KEYS = {
// Legacy key names are retained so existing MinFit data remains available after the rename.
  ENTRIES: '@flownote/entries',
  STREAK: '@flownote/streak',
};

// ─── Journal Entries ────────────────────

export async function getEntries(): Promise<JournalEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.ENTRIES);
    if (!raw) return [];
    return JSON.parse(raw) as JournalEntry[];
  } catch {
    return [];
  }
}

export async function saveEntries(entries: JournalEntry[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.ENTRIES, JSON.stringify(entries));
}

export async function addEntry(entry: JournalEntry): Promise<JournalEntry[]> {
  const entries = await getEntries();
  entries.unshift(entry); // newest first
  await saveEntries(entries);
  return entries;
}

export async function updateEntry(
  id: string,
  updates: Partial<Pick<JournalEntry, 'content'>>
): Promise<JournalEntry[]> {
  const entries = await getEntries();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx !== -1) {
    entries[idx] = {
      ...entries[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await saveEntries(entries);
  }
  return entries;
}

export async function deleteEntry(id: string): Promise<JournalEntry[]> {
  const entries = await getEntries();
  const filtered = entries.filter((e) => e.id !== id);
  await saveEntries(filtered);
  return filtered;
}

// ─── Streak Data ────────────────────

const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastCheckinDate: null,
  checkinHistory: [],
};

export async function getStreak(): Promise<StreakData> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.STREAK);
    if (!raw) return { ...DEFAULT_STREAK };
    return JSON.parse(raw) as StreakData;
  } catch {
    return { ...DEFAULT_STREAK };
  }
}

export async function saveStreak(streak: StreakData): Promise<void> {
  await AsyncStorage.setItem(KEYS.STREAK, JSON.stringify(streak));
}

export async function resetStreak(): Promise<StreakData> {
  const streak = { ...DEFAULT_STREAK };
  await saveStreak(streak);
  return streak;
}

export async function clearMinFitData(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.ENTRIES, KEYS.STREAK]);
}

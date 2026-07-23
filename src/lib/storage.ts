// ─── MinFit — Local Storage Layer ─────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';
import { JournalEntry, MinFitBackup, StreakData } from '../types';

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
    const parsed = JSON.parse(raw) as Array<JournalEntry | LegacyJournalEntry>;
    const entries = parsed.map(migrateEntry);
    if (entries.some((entry, index) => entry !== parsed[index])) {
      await saveEntries(entries);
    }
    return entries;
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
  updates: Partial<Pick<JournalEntry, 'title' | 'body'>>
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

interface LegacyJournalEntry {
  id: string;
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

function migrateEntry(entry: JournalEntry | LegacyJournalEntry): JournalEntry {
  if ('title' in entry && 'body' in entry) return entry;

  const content = entry.content
    .split('const sendContent')[0]
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(?:div|p|h[1-6]|li)>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
  const [title = 'Untitled', ...bodyLines] = content.split('\n').filter(Boolean);

  return { ...entry, title, body: bodyLines.join('\n').trim() };
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

export async function createMinFitBackup(): Promise<MinFitBackup> {
  const [entries, streak] = await Promise.all([getEntries(), getStreak()]);
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    entries,
    streak,
  };
}

function isJournalEntry(value: unknown): value is JournalEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as JournalEntry;
  return typeof entry.id === 'string'
    && typeof entry.date === 'string'
    && ((typeof entry.title === 'string' && typeof entry.body === 'string')
      || typeof (entry as unknown as LegacyJournalEntry).content === 'string')
    && typeof entry.createdAt === 'string'
    && typeof entry.updatedAt === 'string';
}

function isStreakData(value: unknown): value is StreakData {
  if (!value || typeof value !== 'object') return false;
  const streak = value as StreakData;
  return Number.isFinite(streak.currentStreak)
    && Number.isFinite(streak.longestStreak)
    && (streak.lastCheckinDate === null || typeof streak.lastCheckinDate === 'string')
    && Array.isArray(streak.checkinHistory)
    && streak.checkinHistory.every((date) => typeof date === 'string');
}

function isMinFitBackup(value: unknown): value is MinFitBackup {
  if (!value || typeof value !== 'object') return false;
  const backup = value as MinFitBackup;
  return backup.version === 1
    && typeof backup.exportedAt === 'string'
    && Array.isArray(backup.entries)
    && backup.entries.every(isJournalEntry)
    && isStreakData(backup.streak);
}

export async function restoreMinFitBackup(backup: unknown): Promise<void> {
  if (!isMinFitBackup(backup)) {
    throw new Error('This file is not a valid MinFit backup.');
  }

  await AsyncStorage.multiSet([
    [KEYS.ENTRIES, JSON.stringify(backup.entries)],
    [KEYS.STREAK, JSON.stringify(backup.streak)],
  ]);
}

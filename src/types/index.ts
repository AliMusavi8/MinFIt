// ─── MinFit — Type Definitions ──────────────────────────

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  body: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCheckinDate: string | null; // YYYY-MM-DD or null
  checkinHistory: string[]; // Primary habit dates
  secondaryCurrentStreak: number;
  secondaryLongestStreak: number;
  secondaryLastCheckinDate: string | null;
  secondaryCheckinHistory: string[];
  secondaryHabitName: string;
}

export type HabitId = 'primary' | 'secondary';

export interface MinFitBackup {
  version: 1;
  exportedAt: string;
  entries: JournalEntry[];
  streak: StreakData;
}

export type ViewMode = 'list' | 'calendar';

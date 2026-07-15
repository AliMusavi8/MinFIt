// ─── FlowNote Streak — Type Definitions ────────────────────

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCheckinDate: string | null; // YYYY-MM-DD or null
  checkinHistory: string[]; // Array of YYYY-MM-DD dates
}

export type ViewMode = 'list' | 'calendar';

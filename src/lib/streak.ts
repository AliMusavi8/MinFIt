// ─── MinFit — Streak Logic ─────────────────────────────

import dayjs from 'dayjs';
import { StreakData } from '../types';

/**
 * Process a daily check-in.
 * - If already checked in today → no-op.
 * - If last check-in was yesterday → extend streak.
 * - Otherwise → reset to 1.
 */
export function processCheckin(current: StreakData): StreakData {
  const today = dayjs().format('YYYY-MM-DD');

  // Already checked in today
  if (current.lastCheckinDate === today) {
    return current;
  }

  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  let newStreak: number;

  if (current.lastCheckinDate === yesterday) {
    // Continuing the streak
    newStreak = current.currentStreak + 1;
  } else {
    // Streak broken or first check-in
    newStreak = 1;
  }

  const newLongest = Math.max(current.longestStreak, newStreak);

  return {
    currentStreak: newStreak,
    longestStreak: newLongest,
    lastCheckinDate: today,
    checkinHistory: [...current.checkinHistory, today],
  };
}

/**
 * Check if user has checked in today.
 */
export function hasCheckedInToday(streak: StreakData): boolean {
  const today = dayjs().format('YYYY-MM-DD');
  return streak.lastCheckinDate === today;
}

/**
 * Compute the "live" current streak considering today's date.
 * If the user hasn't checked in today and the last check-in
 * wasn't yesterday, the streak has been broken → return 0.
 */
export function getLiveStreak(streak: StreakData): number {
  if (!streak.lastCheckinDate) return 0;

  const today = dayjs().format('YYYY-MM-DD');
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

  if (
    streak.lastCheckinDate === today ||
    streak.lastCheckinDate === yesterday
  ) {
    return streak.currentStreak;
  }

  // Streak is broken
  return 0;
}

/**
 * Generate a unique ID.
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

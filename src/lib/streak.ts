// ─── MinFit — Streak Logic ─────────────────────────────

import dayjs from 'dayjs';
import { HabitId, StreakData } from '../types';

export function processCheckin(current: StreakData, habit: HabitId = 'primary'): StreakData {
  const today = dayjs().format('YYYY-MM-DD');
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  const isSecondary = habit === 'secondary';
  const lastCheckinDate = isSecondary ? current.secondaryLastCheckinDate : current.lastCheckinDate;

  if (lastCheckinDate === today) return current;

  const previousStreak = isSecondary ? current.secondaryCurrentStreak : current.currentStreak;
  const nextStreak = lastCheckinDate === yesterday ? previousStreak + 1 : 1;

  if (isSecondary) {
    return {
      ...current,
      secondaryCurrentStreak: nextStreak,
      secondaryLongestStreak: Math.max(current.secondaryLongestStreak, nextStreak),
      secondaryLastCheckinDate: today,
      secondaryCheckinHistory: [...new Set([...current.secondaryCheckinHistory, today])],
    };
  }

  return {
    ...current,
    currentStreak: nextStreak,
    longestStreak: Math.max(current.longestStreak, nextStreak),
    lastCheckinDate: today,
    checkinHistory: [...new Set([...current.checkinHistory, today])],
  };
}

export function hasCheckedInToday(streak: StreakData, habit: HabitId = 'primary'): boolean {
  const lastCheckinDate = habit === 'secondary'
    ? streak.secondaryLastCheckinDate
    : streak.lastCheckinDate;
  return lastCheckinDate === dayjs().format('YYYY-MM-DD');
}

export function getLiveStreak(streak: StreakData, habit: HabitId = 'primary'): number {
  const lastCheckinDate = habit === 'secondary'
    ? streak.secondaryLastCheckinDate
    : streak.lastCheckinDate;
  const currentStreak = habit === 'secondary'
    ? streak.secondaryCurrentStreak
    : streak.currentStreak;

  if (!lastCheckinDate) return 0;

  const today = dayjs().format('YYYY-MM-DD');
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  return lastCheckinDate === today || lastCheckinDate === yesterday ? currentStreak : 0;
}

export function calculateStreakStats(history: string[]) {
  const dates = [...new Set(history)].sort();
  let longestStreak = 0;
  let run = 0;
  let previousDate: string | null = null;

  for (const date of dates) {
    run = previousDate && dayjs(date).diff(dayjs(previousDate), 'day') === 1 ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
    previousDate = date;
  }

  return {
    currentStreak: run,
    longestStreak,
    lastCheckinDate: dates.at(-1) ?? null,
  };
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

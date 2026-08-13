// ─── MinFit — Streak Hook ───────────────────────────────

import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { HabitId, StreakData } from '../types';
import * as storage from '../lib/storage';
import { processCheckin, hasCheckedInToday, getLiveStreak } from '../lib/streak';

const INITIAL_STREAK: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastCheckinDate: null,
  checkinHistory: [],
  secondaryCurrentStreak: 0,
  secondaryLongestStreak: 0,
  secondaryLastCheckinDate: null,
  secondaryCheckinHistory: [],
  secondaryHabitName: storage.DEFAULT_SECONDARY_HABIT_NAME,
};

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>(INITIAL_STREAK);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let isActive = true;
    storage.getStreak().then((data) => {
      if (isActive) {
        setStreak(data);
        setLoading(false);
      }
    });
    return () => { isActive = false; };
  }, []));

  const checkin = useCallback(async (habit: HabitId = 'primary') => {
    const updated = processCheckin(streak, habit);
    await storage.saveStreak(updated);
    setStreak(updated);
    return updated;
  }, [streak]);

  const reset = useCallback(async () => {
    const fresh = await storage.resetStreak();
    setStreak(fresh);
  }, []);

  return {
    streak,
    loading,
    checkin,
    reset,
    isCheckedInToday: hasCheckedInToday(streak),
    secondaryIsCheckedInToday: hasCheckedInToday(streak, 'secondary'),
    liveStreak: getLiveStreak(streak),
    secondaryLiveStreak: getLiveStreak(streak, 'secondary'),
  };
}

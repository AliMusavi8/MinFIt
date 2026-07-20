// ─── MinFit — Streak Hook ───────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { StreakData } from '../types';
import * as storage from '../lib/storage';
import { processCheckin, hasCheckedInToday, getLiveStreak } from '../lib/streak';

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastCheckinDate: null,
    checkinHistory: [],
  });
  const [loading, setLoading] = useState(true);

  // Load streak data on mount
  useEffect(() => {
    (async () => {
      const data = await storage.getStreak();
      setStreak(data);
      setLoading(false);
    })();
  }, []);

  const checkin = useCallback(async () => {
    const updated = processCheckin(streak);
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
    liveStreak: getLiveStreak(streak),
  };
}

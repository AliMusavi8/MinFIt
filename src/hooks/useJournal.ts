// ─── MinFit — Journal Hook ──────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { JournalEntry } from '../types';
import * as storage from '../lib/storage';
import { generateId } from '../lib/streak';
import dayjs from 'dayjs';

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load entries on mount
  useEffect(() => {
    (async () => {
      const data = await storage.getEntries();
      setEntries(data);
      setLoading(false);
    })();
  }, []);

  const addEntry = useCallback(async (title: string, body: string, date?: string) => {
    const now = new Date().toISOString();
    const entry: JournalEntry = {
      id: generateId(),
      date: date || dayjs().format('YYYY-MM-DD'),
      title,
      body,
      createdAt: now,
      updatedAt: now,
    };
    const updated = await storage.addEntry(entry);
    setEntries(updated);
    return entry;
  }, []);

  const updateEntry = useCallback(async (id: string, title: string, body: string) => {
    const updated = await storage.updateEntry(id, { title, body });
    setEntries(updated);
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    const updated = await storage.deleteEntry(id);
    setEntries(updated);
  }, []);

  const getEntryForDate = useCallback(
    (date: string) => entries.find((e) => e.date === date),
    [entries]
  );

  return {
    entries,
    loading,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntryForDate,
  };
}

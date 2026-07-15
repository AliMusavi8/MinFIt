// ─── FlowNote Streak — Heatmap Calendar Component ────────────────────

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import { colors, typography, spacing, radius } from '../lib/theme';

interface HeatmapCalendarProps {
  checkinHistory: string[];
  weeks?: number; // How many weeks to show (default 12)
}

export function HeatmapCalendar({ checkinHistory, weeks = 12 }: HeatmapCalendarProps) {
  const today = dayjs();
  const historySet = new Set(checkinHistory);

  // Build grid: rows = days of week (0-6), columns = weeks
  const totalDays = weeks * 7;
  const startDate = today.subtract(totalDays - 1, 'day');

  // Generate days grouped by week
  const weeksData: string[][] = [];
  let currentWeek: string[] = [];

  for (let i = 0; i < totalDays; i++) {
    const date = startDate.add(i, 'day');
    currentWeek.push(date.format('YYYY-MM-DD'));

    if (currentWeek.length === 7) {
      weeksData.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    weeksData.push(currentWeek);
  }

  const dayLabels = ['M', '', 'W', '', 'F', '', ''];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity</Text>
      <View style={styles.grid}>
        {/* Day labels column */}
        <View style={styles.dayLabels}>
          {dayLabels.map((label, i) => (
            <View key={i} style={styles.dayLabelCell}>
              <Text style={styles.dayLabelText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Weeks columns */}
        {weeksData.map((week, wi) => (
          <View key={wi} style={styles.weekColumn}>
            {week.map((dateStr, di) => {
              const isActive = historySet.has(dateStr);
              const isToday = dateStr === today.format('YYYY-MM-DD');
              const isFuture = dayjs(dateStr).isAfter(today);

              return (
                <View
                  key={di}
                  style={[
                    styles.cell,
                    isActive && styles.cellActive,
                    isToday && styles.cellToday,
                    isFuture && styles.cellFuture,
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const CELL_SIZE = 14;
const CELL_GAP = 3;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: typography.sm,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    gap: CELL_GAP,
  },
  dayLabels: {
    gap: CELL_GAP,
    marginRight: spacing.xs,
  },
  dayLabelCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
  },
  dayLabelText: {
    fontSize: 9,
    color: colors.textMuted,
  },
  weekColumn: {
    gap: CELL_GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 3,
    backgroundColor: colors.heatmap0,
  },
  cellActive: {
    backgroundColor: colors.primary,
  },
  cellToday: {
    borderWidth: 1,
    borderColor: colors.cream,
  },
  cellFuture: {
    backgroundColor: 'transparent',
  },
});

// ─── FlowNote Streak — Streak Card Component ────────────────────
//
// Redesigned to match the reference design:
// - Glass panel card with streak count + day circles
// - "Best Streak" accent card below
// - Weekly check-in circles (Mon-Sun) with green filled/today/future states

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import dayjs from 'dayjs';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, fonts, typography, spacing, radius } from '../lib/theme';

// Custom SVG Icons to match reference designs
function FlameIcon({ size = 32, color = colors.primary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
        fill={color}
        fillRule="evenodd"
      />
    </Svg>
  );
}

function AwardIcon({ size = 32, color = colors.bg, bgCircleColor = colors.cream }: { size?: number; color?: string; bgCircleColor?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Ribbon tails */}
      <Path
        d="M15.5 12.5 L17 21 L12 18.5 L7 21 L8.5 12.5 Z"
        fill={color}
      />
      {/* Badge circle */}
      <Circle
        cx="12"
        cy="8.5"
        r="5.5"
        fill={color}
      />
      {/* Star cutout inside circle */}
      <Path
        d="M12 5.35 L12.93 7.23 L15 7.54 L13.5 9 L13.85 11.05 L12 10.08 L10.15 11.05 L10.5 9 L9 7.54 L11.07 7.23 Z"
        fill={bgCircleColor}
      />
    </Svg>
  );
}

interface StreakRingProps {
  longestStreak: number;
  isCheckedIn: boolean;
  checkinHistory?: string[];
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Get the dates for the current week (Mon–Sun) and determine
 * which ones have been checked in.
 */
function getWeekStatus(checkinHistory: string[]) {
  const today = dayjs();
  const currentDayOfWeek = today.day(); // 0=Sun
  const mondayOffset = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
  const monday = today.subtract(mondayOffset, 'day');

  const historySet = new Set(checkinHistory);

  return DAY_LABELS.map((label, i) => {
    const date = monday.add(i, 'day');
    const dateStr = date.format('YYYY-MM-DD');
    const isToday = dateStr === today.format('YYYY-MM-DD');
    const isFuture = date.isAfter(today, 'day');
    const isCheckedIn = historySet.has(dateStr);

    return { label, dateStr, isToday, isFuture, isCheckedIn };
  });
}

export function StreakRing({
  longestStreak,
  isCheckedIn,
  checkinHistory = [],
}: StreakRingProps) {
  const weekStatus = getWeekStatus(checkinHistory);

  return (
    <View style={styles.container}>
      {/* Streak Card */}
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.streakLabel}>WEEKLY STREAK</Text>
          <FlameIcon size={30} color={colors.primary} />
        </View>

        {/* Weekly day circles */}
        <View style={styles.weekRow}>
          {weekStatus.map((day) => (
            <View key={day.dateStr} style={styles.dayColumn}>
              <View style={styles.dayCircleSlot}>
                {day.isCheckedIn && <View style={styles.dayCircleGlow} />}
                <View
                  style={[
                    styles.dayCircle,
                    day.isCheckedIn && styles.dayCircleChecked,
                    day.isToday && !day.isCheckedIn && styles.dayCircleToday,
                    day.isFuture && !day.isCheckedIn && styles.dayCircleFuture,
                  ]}
                >
                  {day.isCheckedIn && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                  {day.isToday && !day.isCheckedIn && (
                    <View style={styles.todayDot} />
                  )}
                </View>
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  day.isToday && styles.dayLabelToday,
                ]}
              >
                {day.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Best Streak Badge */}
      <View style={styles.bestCard}>
        <View>
          <Text style={styles.bestLabel}>BEST STREAK</Text>
          <Text style={styles.bestValue}>{longestStreak} Days</Text>
        </View>
        <View style={styles.bestBadge}>
          <AwardIcon size={32} color={colors.bg} bgCircleColor={colors.cream} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },

  // Streak Card
  card: {
    width: '100%',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSelf,
    gap: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fireIcon: {
    fontSize: 28,
  },
  streakLabel: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '700',
    fontFamily: fonts.bold,
    letterSpacing: 1.5,
    marginBottom: 4,
  },

  // Weekly circles
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  dayCircleSlot: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleGlow: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(85, 234, 77, 0.14)',
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerHighest,
    opacity: 0.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleChecked: {
    backgroundColor: colors.primary,
    opacity: 1,
  },
  dayCircleToday: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
    opacity: 1,
  },
  dayCircleFuture: {
    backgroundColor: colors.surfaceContainerHighest,
    opacity: 0.4,
  },
  todayDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.2,
    borderColor: 'rgba(85, 234, 77, 0.65)',
  },
  checkmark: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.bg,
  },
  dayLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  dayLabelToday: {
    color: colors.primary,
    fontWeight: '700',
    fontFamily: fonts.bold,
  },

  // Best Streak card
  bestCard: {
    width: '100%',
    backgroundColor: 'rgba(85, 234, 77, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(85, 234, 77, 0.2)',
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bestLabel: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
    fontFamily: fonts.bold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  bestValue: {
    fontSize: typography.headlineMd,
    color: '#1b5e20', // Darker forest green matching the reference design
    fontWeight: '500',
    letterSpacing: -0.5,
  },
  bestBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-12deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bestBadgeIcon: {
    fontSize: 28,
    color: colors.bg,
  },
});

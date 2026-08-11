import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import dayjs, { Dayjs } from 'dayjs';
import { getStreak } from '../src/lib/storage';
import { colors, fonts, radius, spacing } from '../src/lib/theme';

const DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface CalendarCell {
  day: number | null;
  date: Dayjs | null;
}

function getMonthCells(month: Dayjs): CalendarCell[][] {
  const cells: CalendarCell[] = [];

  for (let index = 0; index < month.startOf('month').day(); index += 1) {
    cells.push({ day: null, date: null });
  }

  for (let day = 1; day <= month.daysInMonth(); day += 1) {
    cells.push({ day, date: month.date(day) });
  }

  while (cells.length < 42) {
    cells.push({ day: null, date: null });
  }

  return Array.from({ length: 6 }, (_, index) => cells.slice(index * 7, index * 7 + 7));
}

export default function YearScreen() {
  const router = useRouter();
  const [checkinHistory, setCheckinHistory] = useState<string[]>([]);
  const today = dayjs();
  const year = today.year();

  useFocusEffect(useCallback(() => {
    let isActive = true;
    getStreak().then((storedStreak) => {
      if (isActive) setCheckinHistory(storedStreak.checkinHistory);
    });
    return () => { isActive = false; };
  }, []));

  const historySet = new Set(checkinHistory);
  const checkinsThisYear = [...historySet].filter((date) => dayjs(date).year() === year).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Back to home"
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 18l-6-6 6-6"
              stroke={colors.primary}
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>YEARLY CONSISTENCY</Text>
          <Text style={styles.subtitle}>{year} · {checkinsThisYear} CHECK-INS</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.months}>
          {Array.from({ length: 12 }, (_, monthIndex) => {
            const month = dayjs().year(year).month(monthIndex).startOf('month');
            const weeks = getMonthCells(month);

            return (
              <View key={monthIndex} style={styles.monthCard}>
                <Text style={styles.monthTitle}>{month.format('MMM').toUpperCase()}</Text>
                <View style={styles.weekRow}>
                  {DAY_HEADERS.map((label, index) => (
                    <Text key={index} style={styles.dayHeader}>{label}</Text>
                  ))}
                </View>

                {weeks.map((week, weekIndex) => (
                  <View key={weekIndex} style={styles.weekRow}>
                    {week.map((cell, dayIndex) => {
                      if (!cell.date || cell.day === null) {
                        return <View key={dayIndex} style={styles.dayCell} />;
                      }

                      const dateString = cell.date.format('YYYY-MM-DD');
                      const isChecked = historySet.has(dateString);
                      const isToday = cell.date.isSame(today, 'day');
                      const isFuture = cell.date.isAfter(today, 'day');

                      return (
                        <View
                          key={dayIndex}
                          style={[
                            styles.dayCell,
                            isChecked && styles.checkedDay,
                            !isChecked && !isFuture && !isToday && styles.missedDay,
                            isToday && !isChecked && styles.today,
                            isFuture && styles.futureDay,
                          ]}
                        >
                          <Text
                            style={[
                              styles.dayText,
                              isChecked && styles.checkedDayText,
                              !isChecked && !isFuture && !isToday && styles.missedDayText,
                              isToday && !isChecked && styles.todayText,
                            ]}
                          >
                            {cell.day}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSelf,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
    letterSpacing: 1.5,
  },
  subtitle: {
    marginTop: 3,
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  months: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
  },
  monthCard: {
    width: '49%',
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSelf,
  },
  monthTitle: {
    marginBottom: spacing.sm,
    color: colors.textSecondary,
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 1,
  },
  weekRow: { flexDirection: 'row', gap: 3, marginBottom: 3 },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 6,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedDay: { backgroundColor: colors.primary },
  missedDay: { backgroundColor: colors.danger },
  today: { borderWidth: 1, borderColor: colors.primary },
  futureDay: { backgroundColor: 'rgba(255, 255, 255, 0.04)' },
  dayText: { color: '#2E2E3E', fontFamily: fonts.medium, fontSize: 6 },
  checkedDayText: { color: colors.bg, fontFamily: fonts.bold },
  missedDayText: { color: '#ffffff', fontFamily: fonts.bold },
  todayText: { color: colors.primary, fontFamily: fonts.bold },
});

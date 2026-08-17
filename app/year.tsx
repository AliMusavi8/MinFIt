import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import dayjs, { Dayjs } from 'dayjs';
import { getStreak, saveCheckinHistories } from '../src/lib/storage';
import { colors, fonts, radius, spacing } from '../src/lib/theme';
import { LiquidFill } from '../src/components/LiquidFill';

const DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface CalendarCell {
  day: number | null;
  date: Dayjs | null;
}

interface MonthData {
  key: string;
  title: string;
  weeks: CalendarCell[][];
}

interface MonthRow {
  key: string;
  months: MonthData[];
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

function getMonthRows(year: number): MonthRow[] {
  const months = Array.from({ length: 12 }, (_, monthIndex) => {
    const month = dayjs().year(year).month(monthIndex).startOf('month');
    return {
      key: month.format('YYYY-MM'),
      title: month.format('MMM').toUpperCase(),
      weeks: getMonthCells(month),
    };
  });

  return Array.from({ length: 6 }, (_, rowIndex) => ({
    key: String(rowIndex),
    months: months.slice(rowIndex * 2, rowIndex * 2 + 2),
  }));
}

export default function YearScreen() {
  const router = useRouter();
  const [checkinHistory, setCheckinHistory] = useState<string[]>([]);
  const [secondaryCheckinHistory, setSecondaryCheckinHistory] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const originalHistories = useRef({ primary: [] as string[], secondary: [] as string[] });
  const today = dayjs();
  const year = today.year();
  const monthRows = useMemo(() => getMonthRows(year), [year]);

  useFocusEffect(useCallback(() => {
    let isActive = true;
    setIsEditing(false);
    getStreak().then((storedStreak) => {
      if (isActive) {
        setCheckinHistory(storedStreak.checkinHistory);
        setSecondaryCheckinHistory(storedStreak.secondaryCheckinHistory);
      }
    });
    return () => { isActive = false; };
  }, []));

  const historySet = useMemo(() => new Set(checkinHistory), [checkinHistory]);
  const secondaryHistorySet = useMemo(
    () => new Set(secondaryCheckinHistory),
    [secondaryCheckinHistory],
  );
  const fullDaysThisYear = [...historySet].filter((date) => (
    dayjs(date).year() === year && secondaryHistorySet.has(date)
  )).length;

  const handleEditPress = () => {
    Alert.alert(
      'Edit consistency?',
      'Are you sure you want to make changes to your habit history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            originalHistories.current = {
              primary: [...checkinHistory],
              secondary: [...secondaryCheckinHistory],
            };
            setIsEditing(true);
          },
        },
      ],
    );
  };

  const setDateInHistory = (history: string[], date: string, shouldInclude: boolean) => (
    shouldInclude
      ? [...new Set([...history, date])]
      : history.filter((item) => item !== date)
  );

  const handleDayPress = (
    date: Dayjs,
    primaryIsCheckedIn: boolean,
    secondaryIsCheckedIn: boolean,
  ) => {
    if (!isEditing || date.isAfter(today, 'day')) return;
    const dateString = date.format('YYYY-MM-DD');

    if (!primaryIsCheckedIn && !secondaryIsCheckedIn) {
      setSecondaryCheckinHistory((history) => setDateInHistory(history, dateString, true));
    } else if (!primaryIsCheckedIn && secondaryIsCheckedIn) {
      setCheckinHistory((history) => setDateInHistory(history, dateString, true));
      setSecondaryCheckinHistory((history) => setDateInHistory(history, dateString, false));
    } else if (primaryIsCheckedIn && !secondaryIsCheckedIn) {
      setSecondaryCheckinHistory((history) => setDateInHistory(history, dateString, true));
    } else {
      setCheckinHistory((history) => setDateInHistory(history, dateString, false));
      setSecondaryCheckinHistory((history) => setDateInHistory(history, dateString, false));
    }
  };

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      const updated = await saveCheckinHistories(checkinHistory, secondaryCheckinHistory);
      setCheckinHistory(updated.checkinHistory);
      setSecondaryCheckinHistory(updated.secondaryCheckinHistory);
      setIsEditing(false);
    } catch {
      Alert.alert('Could not save changes', 'Your consistency changes could not be saved. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setCheckinHistory(originalHistories.current.primary);
    setSecondaryCheckinHistory(originalHistories.current.secondary);
    setIsEditing(false);
  };

  const handleBackPress = () => {
    if (isEditing) handleDiscard();
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Back to home"
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={handleBackPress}
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
        <View style={styles.headerTitle}>
          <Text style={styles.title}>YEARLY CONSISTENCY</Text>
          <Text style={styles.subtitle}>{year} · {fullDaysThisYear} FULL DAYS</Text>
        </View>
        {!isEditing && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Edit consistency"
            activeOpacity={0.7}
            style={styles.editButton}
            onPress={handleEditPress}
          >
            <Text style={styles.editButtonText}>EDIT</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={monthRows}
        extraData={[isEditing, checkinHistory, secondaryCheckinHistory]}
        keyExtractor={(row) => row.key}
        ListHeaderComponent={isEditing ? (
          <View style={styles.editNotice}>
            <Text style={styles.editNoticeText}>TAP A DAY: RED &gt; TOP &gt; BOTTOM &gt; FULL</Text>
          </View>
        ) : null}
        stickyHeaderIndices={isEditing ? [0] : undefined}
        contentContainerStyle={[styles.content, isEditing && styles.contentEditing]}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews={false}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: row }) => (
          <View style={styles.monthRow}>
            {row.months.map((month) => (
              <View key={month.key} style={styles.monthCard}>
                <Text style={styles.monthTitle}>{month.title}</Text>
                <View style={styles.weekRow}>
                  {DAY_HEADERS.map((label, index) => (
                    <Text key={index} style={styles.dayHeader}>{label}</Text>
                  ))}
                </View>

                {month.weeks.map((week, weekIndex) => (
                  <View key={weekIndex} style={styles.weekRow}>
                    {week.map((cell, dayIndex) => {
                      if (!cell.date || cell.day === null) {
                        return <View key={dayIndex} style={styles.dayCell} />;
                      }

                      const dateString = cell.date.format('YYYY-MM-DD');
                      const primaryIsCheckedIn = historySet.has(dateString);
                      const secondaryIsCheckedIn = secondaryHistorySet.has(dateString);
                      const completionCount = Number(primaryIsCheckedIn)
                        + Number(secondaryIsCheckedIn);
                      const completionState = completionCount === 2
                        ? 3
                        : secondaryIsCheckedIn ? 1 : primaryIsCheckedIn ? 2 : 0;
                      const hasCheckin = completionCount > 0;
                      const isComplete = completionCount === 2;
                      const isToday = cell.date.isSame(today, 'day');
                      const isFuture = cell.date.isAfter(today, 'day');
                      const dayStyle = [
                        styles.dayCell,
                        !hasCheckin && !isFuture && (!isToday || isEditing) && styles.missedDay,
                        isFuture && styles.futureDay,
                        isEditing && !isFuture && styles.editableDay,
                      ];
                      const dayContent = (
                        <>
                          {isToday && !hasCheckin && !isEditing && (
                            <View collapsable={false} pointerEvents="none" style={styles.today} />
                          )}
                          {hasCheckin && (
                            <LiquidFill
                              borderRadius={4}
                              position={isComplete ? 'full' : primaryIsCheckedIn ? 'bottom' : 'top'}
                            />
                          )}
                          <View collapsable={false} pointerEvents="none" style={styles.dayForeground}>
                            <Text
                              style={[
                                styles.dayText,
                                isComplete && styles.checkedDayText,
                                hasCheckin && !isComplete && styles.halfDayText,
                                !hasCheckin && !isFuture && (!isToday || isEditing) && styles.missedDayText,
                                isToday && !hasCheckin && !isEditing && styles.todayText,
                              ]}
                            >
                              {cell.day}
                            </Text>
                          </View>
                        </>
                      );

                      if (!isEditing || isFuture) {
                        return (
                          <View key={dayIndex} style={dayStyle}>
                            {dayContent}
                          </View>
                        );
                      }

                      return (
                        <TouchableOpacity
                          key={dayIndex}
                          accessibilityRole="button"
                          accessibilityLabel={
                            dateString + ', '
                            + ['missed', 'top half', 'bottom half', 'fully complete'][completionState]
                          }
                          activeOpacity={0.65}
                          onPress={() => {
                            handleDayPress(cell.date!, primaryIsCheckedIn, secondaryIsCheckedIn);
                          }}
                          style={dayStyle}
                        >
                          {dayContent}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      />

      {isEditing && (
        <View style={styles.editActions}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Discard consistency changes"
            activeOpacity={0.75}
            disabled={isSaving}
            style={[styles.editAction, styles.discardButton, isSaving && styles.editActionDisabled]}
            onPress={handleDiscard}
          >
            <Text style={[styles.editActionText, styles.discardButtonText]}>DISCARD</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Confirm consistency changes"
            activeOpacity={0.75}
            disabled={isSaving}
            style={[styles.editAction, styles.confirmButton, isSaving && styles.editActionDisabled]}
            onPress={() => { void handleConfirm(); }}
          >
            <Text style={[styles.editActionText, styles.confirmButtonText]}>
              {isSaving ? 'SAVING…' : 'CONFIRM'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  headerTitle: {
    flex: 1,
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
  editButton: {
    minWidth: 54,
    height: 36,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(85, 234, 77, 0.28)',
    backgroundColor: 'rgba(85, 234, 77, 0.05)',
  },
  editButtonText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 1,
  },
  editNotice: {
    alignSelf: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(85, 234, 77, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(85, 234, 77, 0.18)',
  },
  editNoticeText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 0.8,
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
  contentEditing: {
    paddingBottom: 120,
  },
  editActions: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
  },
  editAction: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  discardButton: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  editActionDisabled: {
    opacity: 0.55,
  },
  editActionText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  discardButtonText: {
    color: '#ffffff',
  },
  confirmButtonText: {
    color: colors.bg,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
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
  editableDay: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  missedDay: { backgroundColor: colors.danger },
  today: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  futureDay: { backgroundColor: 'rgba(255, 255, 255, 0.04)' },
  dayForeground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    elevation: 1,
  },
  dayText: { color: '#2E2E3E', fontFamily: fonts.medium, fontSize: 6 },
  checkedDayText: { color: colors.bg, fontFamily: fonts.bold },
  halfDayText: { color: colors.bg, fontFamily: fonts.bold, zIndex: 1 },
  missedDayText: { color: '#ffffff', fontFamily: fonts.bold },
  todayText: { color: colors.primary, fontFamily: fonts.bold },
});

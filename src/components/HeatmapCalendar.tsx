// ─── MinFit — Monthly Consistency Calendar ─────────────────────────────
//
// Redesigned to match reference: monthly calendar grid view
// with glowing green cells for active days, labeled S M T W T F S
// Shows current month with "MONTHLY CONSISTENCY" header

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation } from 'react-native';
import dayjs from 'dayjs';
import { colors, fonts, typography, spacing, radius } from '../lib/theme';
import { LiquidFill } from './LiquidFill';

interface HeatmapCalendarProps {
  checkinHistory: string[];
  secondaryCheckinHistory?: string[];
  weeks?: number;
  onExpand?: () => void;
  onCollapse?: () => void;
  onViewYear?: () => void;
  onLayoutChange?: (height: number, isExpanded: boolean) => void;
}

const DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function HeatmapCalendar({
  checkinHistory,
  secondaryCheckinHistory = [],
  onExpand,
  onCollapse,
  onViewYear,
  onLayoutChange,
}: HeatmapCalendarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const today = dayjs();
  const historySet = new Set(checkinHistory);
  const secondaryHistorySet = new Set(secondaryCheckinHistory);
  const monthName = today.format('MMMM');
  const year = today.format('YYYY');

  const toggleExpanded = () => {
    LayoutAnimation.configureNext({
      duration: 320,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    if (isExpanded) {
      onCollapse?.();
    } else {
      onExpand?.();
    }
    setIsExpanded(!isExpanded);
  };

  const renderMonthGrid = (monthOffset: number) => {
    const targetMonth = dayjs().add(monthOffset, 'month');
    const mName = targetMonth.format('MMMM');
    const mYear = targetMonth.format('YYYY');

    const daysInMonth = targetMonth.daysInMonth();
    const firstDayOfMonth = targetMonth.startOf('month').day();

    const cells: Array<{
      day: number | null;
      dateStr: string | null;
      isActive: boolean;
      isComplete: boolean;
      isToday: boolean;
      isFuture: boolean;
    }> = [];

    // Empty cells before first day
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push({ day: null, dateStr: null, isActive: false, isComplete: false, isToday: false, isFuture: false });
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const date = targetMonth.startOf('month').add(d - 1, 'day');
      const dateStr = date.format('YYYY-MM-DD');
      const completionCount = Number(historySet.has(dateStr)) + Number(secondaryHistorySet.has(dateStr));
      cells.push({
        day: d,
        dateStr,
        isActive: completionCount > 0,
        isComplete: completionCount === 2,
        isToday: dateStr === dayjs().format('YYYY-MM-DD'),
        isFuture: date.isAfter(dayjs(), 'day'),
      });
    }

    // Pad to complete last row
    while (cells.length % 7 !== 0) {
      cells.push({ day: null, dateStr: null, isActive: false, isComplete: false, isToday: false, isFuture: false });
    }

    // Split into weeks
    const weeksList: typeof cells[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeksList.push(cells.slice(i, i + 7));
    }

    return (
      <View key={monthOffset} style={styles.monthSection}>
        {/* Month Subheader (only shown in expanded mode or for previous months) */}
        {monthOffset !== 0 && (
          <View style={styles.monthSubheader}>
            <Text style={styles.monthSubheaderText}>{mName} {mYear}</Text>
          </View>
        )}

        {/* Day headers */}
        <View style={styles.dayHeaderRow}>
          {DAY_HEADERS.map((label, i) => (
            <View key={i} style={styles.dayHeaderCell}>
              <Text style={styles.dayHeaderText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        {weeksList.map((week, wi) => (
          <View key={wi} style={styles.weekRow}>
            {week.map((cell, ci) => {
              const showYearButton = Boolean(
                onViewYear
                && wi === weeksList.length - 1
                && ci === week.length - 1
                && cell.day === null
                && week[ci - 1]?.day === null
              );

              return (
                <View key={ci} style={styles.cellWrapper}>
                  {cell.day !== null ? (
                    <>
                      {cell.isActive && <View style={styles.cellGlow} />}
                      <View
                        style={[
                          styles.cell,
                          cell.isFuture && !cell.isActive && styles.cellFuture,
                          !cell.isActive && !cell.isToday && !cell.isFuture && styles.cellMissed,
                        ]}
                      >
                        {cell.isToday && !cell.isActive && (
                          <View collapsable={false} pointerEvents="none" style={styles.cellToday} />
                        )}
                        {cell.isActive && (
                          <LiquidFill
                            borderRadius={8}
                            position={cell.isComplete
                              ? 'full'
                              : historySet.has(cell.dateStr!) ? 'bottom' : 'top'}
                          />
                        )}
                        <View collapsable={false} pointerEvents="none" style={styles.cellForeground}>
                          <Text
                            style={[
                              styles.cellText,
                              cell.isComplete && styles.cellTextActive,
                              cell.isActive && !cell.isComplete && styles.cellTextHalf,
                              cell.isToday && !cell.isActive && styles.cellTextToday,
                              cell.isFuture && !cell.isActive && styles.cellTextFuture,
                              !cell.isActive && !cell.isToday && !cell.isFuture && styles.cellTextMissed,
                            ]}
                          >
                            {cell.day}
                          </Text>
                        </View>
                      </View>
                    </>
                  ) : showYearButton ? (
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel="View yearly consistency"
                      activeOpacity={0.7}
                      style={styles.yearButton}
                      onPress={onViewYear}
                    >
                      <Text style={styles.yearButtonText}>12 MONTHS</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.cellEmpty} />
                  )}
                </View>
              );
            })}
          </View>
        ))}

        {onViewYear && weeksList[weeksList.length - 1][5].day !== null && (
          <View style={styles.weekRow}>
            {DAY_HEADERS.map((_, index) => (
              <View key={index} style={styles.cellWrapper}>
                {index === 6 ? (
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="View yearly consistency"
                    activeOpacity={0.7}
                    style={styles.yearButton}
                    onPress={onViewYear}
                  >
                    <Text style={styles.yearButtonText}>12 MONTHS</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.cellEmpty} />
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View
      style={styles.container}
      onLayout={(event) => onLayoutChange?.(event.nativeEvent.layout.height, isExpanded)}
    >
      {/* Header */}
      <View style={[styles.headerRow, { marginBottom: isExpanded ? spacing.lg : 0 }]}>
        <View style={styles.titleContainer}>
          <View style={styles.titleColumn}>
            <Text style={styles.titleText}>MONTHLY</Text>
            <Text style={styles.titleText}>CONSISTENCY</Text>
          </View>
          <View style={styles.monthColumn}>
            <Text style={styles.monthText}>{monthName}</Text>
            <Text style={styles.yearText}>{year}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.expandButton,
            isExpanded && styles.collapseButton,
          ]}
          onPress={toggleExpanded}
        >
          <Text style={[
            styles.expandButtonText,
            isExpanded && styles.collapseButtonText,
          ]}>
            {isExpanded ? 'COLLAPSE' : 'EXPAND'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Render Current Month Grid if Expanded */}
      {isExpanded && renderMonthGrid(0)}
    </View>
  );
}

const CELL_SIZE = 36;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSelf,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  titleColumn: {
    flexDirection: 'column',
  },
  titleText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.text,
    letterSpacing: 1.5,
    lineHeight: 15,
  },
  monthColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  monthText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
    fontFamily: fonts.medium,
    lineHeight: 14,
  },
  yearText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
    fontFamily: fonts.medium,
    lineHeight: 14,
  },
  expandButton: {
    backgroundColor: 'rgba(85, 234, 77, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(85, 234, 77, 0.25)',
    borderRadius: radius.md,
    width: 100,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapseButton: {
    backgroundColor: 'rgba(220, 20, 60, 0.06)',
    borderColor: 'rgba(220, 20, 60, 0.3)',
  },
  expandButtonText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '700',
    fontFamily: fonts.bold,
    letterSpacing: 1,
    textAlign: 'center',
  },
  collapseButtonText: {
    color: colors.danger,
  },
  monthSection: {
    marginBottom: spacing.md,
  },
  monthSubheader: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  monthSubheaderText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '500',
    fontFamily: fonts.medium,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs + 2,
  },
  cellWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellGlow: {
    position: 'absolute',
    width: CELL_SIZE + 6,
    height: CELL_SIZE + 6,
    borderRadius: 10,
    backgroundColor: 'rgba(85, 234, 77, 0.14)',
  },
  cellToday: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  cellFuture: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  cellMissed: {
    backgroundColor: colors.danger,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 4,
  },
  cellEmpty: {
    width: CELL_SIZE,
    height: CELL_SIZE,
  },
  yearButton: {
    width: CELL_SIZE * 2 + spacing.sm,
    height: CELL_SIZE,
    transform: [{ translateX: -(CELL_SIZE + spacing.sm) / 2 }],
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(85, 234, 77, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(85, 234, 77, 0.35)',
  },
  yearButtonText: {
    color: colors.primary,
    fontSize: 11,
    fontFamily: fonts.bold,
    letterSpacing: 0.4,
  },
  cellForeground: {
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
  cellText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    color: '#3E3E4E', // Muted dark grey for future days
  },
  cellTextActive: {
    color: '#00000E', // Dark text on active green
    fontWeight: '700',
  },
  cellTextHalf: {
    color: '#00000E',
    fontWeight: '700',
    zIndex: 1,
  },
  cellTextToday: {
    color: colors.primary,
    fontWeight: '700',
  },
  cellTextFuture: {
    color: '#2E2E3E',
  },
  cellTextMissed: {
    color: '#ffffff', // High contrast white text on crimson red
    fontWeight: '700',
  },
});

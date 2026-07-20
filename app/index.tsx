// ─── MinFit — Home Screen ──────────────────────────────
//
// central glowing orb, streak card with weekly circles,
// best streak badge, monthly consistency calendar.

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, typography, spacing } from '../src/lib/theme';
import { useStreak } from '../src/hooks/useStreak';
import { StreakRing } from '../src/components/StreakRing';
import { CheckinButton } from '../src/components/CheckinButton';
import { HeatmapCalendar } from '../src/components/HeatmapCalendar';
import { ProfileAvatar } from '../src/components/ProfileAvatar';

export default function HomeScreen() {
  const { streak, liveStreak, isCheckedInToday, checkin } = useStreak();
  const [calendarScrollReserve, setCalendarScrollReserve] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const calendarY = useRef(0);
  const calendarHeights = useRef({ collapsed: 0, expanded: 0 });

  const handleCheckin = async () => {
    await checkin();
  };

  const handleCalendarExpand = () => {
    setCalendarScrollReserve(0);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(calendarY.current - spacing.md, 0),
        animated: true,
      });
    });
  };

  const handleCalendarCollapse = () => {
    const { collapsed, expanded } = calendarHeights.current;
    setCalendarScrollReserve(Math.max(expanded - collapsed, 0));
  };

  const handleCalendarLayoutChange = (height: number, isExpanded: boolean) => {
    calendarHeights.current[isExpanded ? 'expanded' : 'collapsed'] = height;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: spacing.xxl + spacing.xl + calendarScrollReserve },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.brandRow}>
              <Text style={styles.brandMin}>Min</Text>
              <Text style={styles.brandFit}>Fit</Text>
            </View>
            <Text style={styles.tagline}>Minimal Fitness Tracking</Text>
          </View>
          <ProfileAvatar />
        </View>

        {/* Check-in completed banner */}
        {isCheckedInToday && (
          <View style={styles.bannerContainer}>
            <View style={styles.banner}>
              <Text style={styles.bannerText}>Check-in completed!</Text>
            </View>
          </View>
        )}

        {/* Central Orb */}
        <CheckinButton
          isCheckedIn={isCheckedInToday}
          onPress={handleCheckin}
          streakCount={liveStreak}
        />

        {/* Streak Card + Best Streak */}
        <View style={styles.section}>
          <StreakRing
            longestStreak={streak.longestStreak}
            isCheckedIn={isCheckedInToday}
            checkinHistory={streak.checkinHistory}
          />
        </View>

        {/* Monthly Consistency Calendar */}
        <View
          style={styles.section}
          onLayout={(event) => { calendarY.current = event.nativeEvent.layout.y; }}
        >
          <HeatmapCalendar
            checkinHistory={streak.checkinHistory}
            onExpand={handleCalendarExpand}
            onCollapse={handleCalendarCollapse}
            onLayoutChange={handleCalendarLayoutChange}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl + spacing.xl,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    height: 72,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  headerLeft: {
    gap: 2,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandMin: {
    fontSize: typography.headlineMd,
    fontFamily: fonts.semibold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  brandFit: {
    fontSize: typography.headlineMd,
    fontFamily: fonts.semibold,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: typography.xs,
    color: colors.textMuted,
    fontFamily: fonts.regular,
  },

  // Check-in banner
  bannerContainer: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  banner: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: 9999,
    backgroundColor: 'rgba(85, 234, 77, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(85, 234, 77, 0.15)',
  },
  bannerText: {
    fontSize: typography.labelMd,
    color: colors.primary,
    fontWeight: '500',
    fontFamily: fonts.medium,
    letterSpacing: 0.5,
  },

  section: {
    marginTop: spacing.lg,
  },
});

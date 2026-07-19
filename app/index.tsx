// ─── FlowNote Streak — Home Screen ────────────────────
//
// central glowing orb, streak card with weekly circles,
// best streak badge, monthly consistency calendar.

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../src/lib/theme';
import { useStreak } from '../src/hooks/useStreak';
import { StreakRing } from '../src/components/StreakRing';
import { CheckinButton } from '../src/components/CheckinButton';
import { HeatmapCalendar } from '../src/components/HeatmapCalendar';

export default function HomeScreen() {
  const { streak, liveStreak, isCheckedInToday, checkin } = useStreak();
  const scrollRef = useRef<ScrollView>(null);
  const calendarY = useRef(0);

  const handleCheckin = async () => {
    await checkin();
  };

  const handleCalendarCollapse = () => {
    // Scroll to keep the calendar card visible after collapsing
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: calendarY.current - 20, animated: true });
    }, 50);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header — branded "Fitness Tracking" */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerAccent}>Fitness</Text>
            <Text style={styles.headerTitle}> Tracking</Text>
          </View>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>●</Text>
          </View>
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
            currentStreak={liveStreak}
            longestStreak={streak.longestStreak}
            isCheckedIn={isCheckedInToday}
            checkinHistory={streak.checkinHistory}
          />
        </View>

        {/* Monthly Consistency Calendar */}
        <View
          style={styles.section}
          onLayout={(e) => { calendarY.current = e.nativeEvent.layout.y; }}
        >
          <HeatmapCalendar
            checkinHistory={streak.checkinHistory}
            onCollapse={handleCalendarCollapse}
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
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAccent: {
    fontSize: typography.headlineMd,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  headerTitle: {
    fontSize: typography.headlineMd,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.5,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerHighest,
  },
  avatarText: {
    fontSize: 16,
    color: colors.textMuted,
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
    letterSpacing: 0.5,
  },

  section: {
    marginTop: spacing.lg,
  },
});

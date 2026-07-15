// ─── FlowNote Streak — Home Screen ────────────────────

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, radius } from '../src/lib/theme';
import { useStreak } from '../src/hooks/useStreak';
import { useJournal } from '../src/hooks/useJournal';
import { StreakRing } from '../src/components/StreakRing';
import { CheckinButton } from '../src/components/CheckinButton';
import { HeatmapCalendar } from '../src/components/HeatmapCalendar';
import dayjs from 'dayjs';

export default function HomeScreen() {
  const { streak, liveStreak, isCheckedInToday, checkin } = useStreak();
  const { entries } = useJournal();
  const router = useRouter();

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleCheckin = async () => {
    await checkin();
  };

  // Get today's and recent entries
  const todayEntry = entries.find(
    (e) => e.date === dayjs().format('YYYY-MM-DD')
  );
  const recentEntries = entries.slice(0, 3);

  // Greeting based on time of day
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.appTitle}>FlowNote Streak</Text>
          </View>

          {/* Streak Ring */}
          <StreakRing
            currentStreak={liveStreak}
            longestStreak={streak.longestStreak}
            isCheckedIn={isCheckedInToday}
          />

          {/* Check-in Button */}
          <CheckinButton isCheckedIn={isCheckedInToday} onPress={handleCheckin} />

          {/* Motivational message */}
          {isCheckedInToday && (
            <Animated.View style={styles.motivationContainer}>
              <Text style={styles.motivationText}>
                {liveStreak >= 7
                  ? `🔥 ${liveStreak} days strong! You're unstoppable!`
                  : liveStreak >= 3
                  ? `💪 ${liveStreak} days in a row! Keep it up!`
                  : `✨ Great start! Come back tomorrow!`}
              </Text>
            </Animated.View>
          )}

          {/* Heatmap */}
          <View style={styles.section}>
            <HeatmapCalendar checkinHistory={streak.checkinHistory} />
          </View>

          {/* Quick Add Note */}
          <View style={styles.section}>
            <View style={styles.quickNoteCard}>
              <Text style={styles.sectionTitle}>Today's Note</Text>
              {todayEntry ? (
                <Text style={styles.notePreview} numberOfLines={3}>
                  {todayEntry.content}
                </Text>
              ) : (
                <Text
                  style={styles.notePrompt}
                  onPress={() => router.push('/journal')}
                >
                  Tap to write something…
                </Text>
              )}
            </View>
          </View>

          {/* Recent Entries */}
          {recentEntries.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>RECENT</Text>
              {recentEntries.map((entry) => (
                <View key={entry.id} style={styles.recentEntry}>
                  <Text style={styles.recentDate}>
                    {dayjs(entry.date).format('MMM D')}
                  </Text>
                  <Text style={styles.recentText} numberOfLines={1}>
                    {entry.content || 'Empty entry'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
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
    paddingBottom: spacing.xxl,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  greeting: {
    fontSize: typography.base,
    color: colors.textMuted,
  },
  appTitle: {
    fontSize: typography.xxl,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -1,
    marginTop: spacing.xs,
  },
  motivationContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  motivationText: {
    fontSize: typography.sm,
    color: colors.cream,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  section: {
    marginTop: spacing.lg,
  },
  quickNoteCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: typography.sm,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  notePreview: {
    fontSize: typography.base,
    color: colors.text,
    lineHeight: 22,
  },
  notePrompt: {
    fontSize: typography.base,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  sectionLabel: {
    fontSize: typography.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  recentEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  recentDate: {
    fontSize: typography.xs,
    color: colors.primary,
    fontWeight: '600',
    width: 50,
  },
  recentText: {
    flex: 1,
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
});

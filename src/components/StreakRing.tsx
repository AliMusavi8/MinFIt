// ─── FlowNote Streak — Streak Ring Component ────────────────────

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors, typography, spacing } from '../lib/theme';

interface StreakRingProps {
  currentStreak: number;
  longestStreak: number;
  isCheckedIn: boolean;
}

export function StreakRing({ currentStreak, longestStreak, isCheckedIn }: StreakRingProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isCheckedIn) {
      // Gentle pulse when checked in
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }).start();
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [isCheckedIn, pulseAnim, glowAnim]);

  const ringColor = isCheckedIn ? colors.primary : colors.border;
  const bgColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.bgCard, colors.primaryMuted],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.outerRing,
          {
            borderColor: ringColor,
            backgroundColor: bgColor,
          },
        ]}
      >
        <View style={styles.innerContent}>
          <Text style={[styles.streakNumber, isCheckedIn && styles.streakNumberActive]}>
            {currentStreak}
          </Text>
          <Text style={styles.streakLabel}>
            {currentStreak === 1 ? 'day' : 'days'}
          </Text>
          {isCheckedIn && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </View>
      </Animated.View>
      <View style={styles.meta}>
        <Text style={styles.metaText}>
          🏆 Best: <Text style={styles.metaHighlight}>{longestStreak} days</Text>
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  outerRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContent: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: typography.hero,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: -2,
  },
  streakNumberActive: {
    color: colors.primary,
  },
  streakLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginTop: -4,
  },
  checkmark: {
    fontSize: 16,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  meta: {
    marginTop: spacing.md,
  },
  metaText: {
    fontSize: typography.sm,
    color: colors.textMuted,
  },
  metaHighlight: {
    color: colors.cream,
    fontWeight: '600',
  },
});

// ─── MinFit — Flippable Two-Habit Check-in Orb ──────────

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Animated,
  Easing,
  PanResponder,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { HabitId } from '../types';
import { colors, fonts, typography, spacing } from '../lib/theme';

interface CheckinButtonProps {
  primaryIsCheckedIn: boolean;
  secondaryIsCheckedIn: boolean;
  onCheckin: (habit: HabitId) => void;
  primaryStreakCount: number;
  secondaryStreakCount: number;
  secondaryHabitName: string;
}

const ORB_SIZE = 224;
const CORE_SIZE = 186;
const RING_RADIUS = 99;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const HOLD_DURATION = 3000;
const SWIPE_THRESHOLD = 42;

export function CheckinButton({
  primaryIsCheckedIn,
  secondaryIsCheckedIn,
  onCheckin,
  primaryStreakCount,
  secondaryStreakCount,
  secondaryHabitName,
}: CheckinButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const holdProgress = useRef(new Animated.Value(0)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;
  const holdCompleted = useRef(false);
  const flipping = useRef(false);
  const [progress, setProgress] = useState(0);
  const [activeHabit, setActiveHabit] = useState<HabitId>('primary');

  const isCheckedIn = activeHabit === 'primary' ? primaryIsCheckedIn : secondaryIsCheckedIn;
  const streakCount = activeHabit === 'primary' ? primaryStreakCount : secondaryStreakCount;
  const habitLabel = activeHabit === 'primary' ? 'Day Streak' : secondaryHabitName;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  useEffect(() => () => holdProgress.stopAnimation(), [holdProgress]);

  useEffect(() => {
    const listenerId = holdProgress.addListener(({ value }) => setProgress(value));
    return () => holdProgress.removeListener(listenerId);
  }, [holdProgress]);

  const cancelHold = useCallback(() => {
    if (holdCompleted.current) return;
    holdProgress.stopAnimation();
    Animated.timing(holdProgress, {
      toValue: 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [holdProgress]);

  const flipOrb = useCallback(() => {
    if (flipping.current) return;
    flipping.current = true;
    cancelHold();
    Animated.timing(flipAnim, {
      toValue: 1,
      duration: 150,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        flipping.current = false;
        return;
      }
      setActiveHabit((current) => current === 'primary' ? 'secondary' : 'primary');
      flipAnim.setValue(-1);
      Animated.timing(flipAnim, {
        toValue: 0,
        duration: 170,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => { flipping.current = false; });
    });
  }, [cancelHold, flipAnim]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gesture) => (
      Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy)
    ),
    onPanResponderGrant: cancelHold,
    onPanResponderRelease: (_, gesture) => {
      if (Math.abs(gesture.dx) >= SWIPE_THRESHOLD) flipOrb();
    },
    onPanResponderTerminate: cancelHold,
  }), [cancelHold, flipOrb]);

  const startHold = () => {
    if (isCheckedIn || flipping.current) return;
    holdCompleted.current = false;
    holdProgress.stopAnimation();
    holdProgress.setValue(0);
    Animated.timing(holdProgress, {
      toValue: 1,
      duration: HOLD_DURATION,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !holdCompleted.current) {
        holdCompleted.current = true;
        onCheckin(activeHabit);
      }
    });
  };

  const rotateY = flipAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-90deg', '0deg', '90deg'],
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View
        {...panResponder.panHandlers}
        style={{ transform: [{ perspective: 900 }, { rotateY }, { scale: pulseAnim }] }}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={habitLabel + ': ' + streakCount + ' day streak. Hold three seconds to check in. Swipe to switch habit.'}
          onPressIn={startHold}
          onPressOut={cancelHold}
          pressRetentionOffset={32}
          activeOpacity={0.95}
        >
          <View style={[styles.orb, styles.orbActive]}>
            <Svg width={ORB_SIZE} height={ORB_SIZE} style={styles.progressRing}>
              <Circle
                cx={ORB_SIZE / 2}
                cy={ORB_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                stroke="rgba(85, 234, 77, 0.12)"
                strokeWidth={8}
              />
              <Circle
                cx={ORB_SIZE / 2}
                cy={ORB_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                stroke={colors.primary}
                strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
                transform={'rotate(-90 ' + ORB_SIZE / 2 + ' ' + ORB_SIZE / 2 + ')'}
              />
            </Svg>
            <View style={styles.orbCore}>
              <Text style={styles.orbNumber}>{streakCount}</Text>
              <Text numberOfLines={1} adjustsFontSizeToFit style={styles.orbUnit}>{habitLabel}</Text>
              {isCheckedIn && <Text style={styles.completed}>COMPLETED</Text>}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.pageDots}>
        <View style={[styles.pageDot, activeHabit === 'primary' && styles.pageDotActive]} />
        <View style={[styles.pageDot, activeHabit === 'secondary' && styles.pageDotActive]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
    minHeight: 278,
    justifyContent: 'center',
  },
  orb: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(85, 234, 77, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(117, 255, 104, 0.38)',
  },
  progressRing: { position: 'absolute' },
  orbCore: {
    width: CORE_SIZE,
    height: CORE_SIZE,
    borderRadius: CORE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b160f',
    borderWidth: 1,
    borderColor: 'rgba(85, 234, 77, 0.12)',
    paddingHorizontal: spacing.md,
  },
  orbActive: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 0,
  },
  orbNumber: {
    fontSize: 54,
    fontWeight: '700',
    fontFamily: fonts.bold,
    color: colors.text,
    letterSpacing: -1,
  },
  orbUnit: {
    maxWidth: 132,
    fontSize: typography.base,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    color: colors.textSecondary,
    marginTop: -4,
    textAlign: 'center',
  },
  completed: {
    marginTop: spacing.sm,
    color: colors.primary,
    fontSize: 8,
    fontFamily: fonts.bold,
    letterSpacing: 1.2,
  },
  pageDots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  pageDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerHighest,
  },
  pageDotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },
});

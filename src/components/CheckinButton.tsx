// ─── MinFit — Flippable Two-Habit Check-in Orb ──────────

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  TouchableOpacity,
  Pressable,
  Text,
  StyleSheet,
  View,
  Animated,
  Easing,
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
  const leverAnim = useRef(new Animated.Value(0)).current;
  const leverFillAnim = useRef(new Animated.Value(0)).current;
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

  useEffect(() => {
    const toValue = activeHabit === 'primary' ? 0 : 1;
    Animated.parallel([
      Animated.timing(leverAnim, {
        toValue,
        duration: 240,
        easing: Easing.bezier(0.65, 1.35, 0.5, 1),
        useNativeDriver: true,
      }),
      Animated.timing(leverFillAnim, {
        toValue,
        duration: 240,
        easing: Easing.bezier(0.65, 1.35, 0.5, 1),
        useNativeDriver: false,
      }),
    ]).start();
  }, [activeHabit, leverAnim, leverFillAnim]);

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

  const leverRotation = leverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-25deg', '25deg'],
  });

  const leverOffset = leverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 20],
  });

  const leverFillColor = leverFillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.bg, colors.primary],
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={{ transform: [{ perspective: 900 }, { rotateY }, { scale: pulseAnim }] }}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={habitLabel + ': ' + streakCount + ' day streak. Hold three seconds to check in.'}
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

      <Pressable
        accessibilityRole="switch"
        accessibilityLabel="Switch habit"
        accessibilityState={{ checked: activeHabit === 'secondary' }}
        hitSlop={12}
        onPress={flipOrb}
        style={styles.toggleContainer}
      >
        <View pointerEvents="none" style={styles.toggleHandleWrapper}>
          <Animated.View
            style={[
              styles.toggleHandle,
              { transform: [{ translateX: leverOffset }, { rotate: leverRotation }] },
            ]}
          >
            <View style={styles.toggleHandleKnob}>
              <View style={styles.toggleHandleKnobHighlight} />
            </View>
            <View style={styles.toggleHandleBar} />
          </Animated.View>
        </View>
        <View pointerEvents="none" style={styles.toggleBase}>
          <Animated.View
            style={[styles.toggleBaseInside, { backgroundColor: leverFillColor }]}
          />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
    minHeight: 302,
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
  toggleContainer: {
    position: 'relative',
    width: 72,
    height: 62,
    marginTop: spacing.sm,
  },
  toggleHandleWrapper: {
    position: 'absolute',
    zIndex: 3,
    top: 0,
    left: -20,
    width: 112,
    height: 57,
    overflow: 'hidden',
  },
  toggleHandle: {
    position: 'absolute',
    top: 7,
    left: 40,
    width: 32,
    height: 52,
    alignItems: 'center',
    transformOrigin: 'center bottom',
  },
  toggleHandleKnob: {
    zIndex: 1,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.primaryDark,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 7,
    elevation: 4,
  },
  toggleHandleKnobHighlight: {
    position: 'absolute',
    top: 4,
    left: 6,
    width: 8,
    height: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.48)',
  },
  toggleHandleBar: {
    position: 'absolute',
    top: 22,
    width: 9,
    height: 34,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    backgroundColor: colors.surfaceContainerLow,
  },
  toggleBase: {
    position: 'absolute',
    zIndex: 2,
    bottom: 0,
    width: 72,
    height: 22,
    borderRadius: 12,
    padding: 2,
    overflow: 'hidden',
    backgroundColor: colors.surfaceBright,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  toggleBaseInside: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
});

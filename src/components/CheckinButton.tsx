// ─── MinFit — Check-in Orb ─────────────────────────────
//
// Redesigned to match the reference: large 192px glowing green orb
// with a hold-to-check-in mechanic (press-and-hold for confirmation).
// Completion is confirmed by the message above the orb; the orb itself stays
// visually consistent so the streak count remains visible.

import React, { useEffect, useRef, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Animated,
  Easing,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts, typography, spacing } from '../lib/theme';

interface CheckinButtonProps {
  isCheckedIn: boolean;
  onPress: () => void;
  streakCount: number;
}

const ORB_SIZE = 208;
const CORE_SIZE = 172;
const RING_RADIUS = 91;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const HOLD_DURATION = 5000;

export function CheckinButton({ isCheckedIn, onPress, streakCount }: CheckinButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const holdProgress = useRef(new Animated.Value(0)).current;
  const holdCompleted = useRef(false);
  const [progress, setProgress] = useState(0);

  // Smooth continuous breathing pulse
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
          toValue: 1.0,
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

  const startHold = () => {
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
        if (!isCheckedIn) onPress();
      }
    });
  };

  const cancelHold = () => {
    if (holdCompleted.current) return;

    holdProgress.stopAnimation();
    Animated.timing(holdProgress, {
      toValue: 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.wrapper}>

      {/* Main orb */}
      <TouchableOpacity
        onPressIn={startHold}
        onPressOut={cancelHold}
        activeOpacity={0.95}
      >
        <Animated.View
          style={[
            styles.orb,
            styles.orbActive,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
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
              transform={`rotate(-90 ${ORB_SIZE / 2} ${ORB_SIZE / 2})`}
            />
          </Svg>
          <View style={styles.orbCore}>
            <Text style={styles.orbNumber}>{streakCount}</Text>
            <Text style={styles.orbUnit}>Day Streak</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>

      {/* Tooltip */}
      <Text style={styles.tooltip}>
        Hold 5s to check in
      </Text>


    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
    minHeight: 270,
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
  progressRing: {
    position: 'absolute',
  },
  orbCore: {
    width: CORE_SIZE,
    height: CORE_SIZE,
    borderRadius: CORE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b160f',
    borderWidth: 1,
    borderColor: 'rgba(85, 234, 77, 0.12)',
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
    fontSize: typography.base,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    color: colors.textSecondary,
    marginTop: -4,
  },
  tooltip: {
    marginTop: spacing.md,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: fonts.medium,
    opacity: 0.6,
  },

});

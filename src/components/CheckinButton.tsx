// ─── FlowNote Streak — Check-in Orb ────────────────────
//
// Redesigned to match the reference: large 192px glowing green orb
// with a hold-to-check-in mechanic (press-and-hold for confirmation).
// Completion is confirmed by the message above the orb; the orb itself stays
// visually consistent so the streak count remains visible.

import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Animated,
  Easing,
} from 'react-native';
import { colors, fonts, typography, spacing } from '../lib/theme';

interface CheckinButtonProps {
  isCheckedIn: boolean;
  onPress: () => void;
  streakCount: number;
}

const ORB_SIZE = 208;

export function CheckinButton({ isCheckedIn, onPress, streakCount }: CheckinButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

  return (
    <View style={styles.wrapper}>

      {/* Main orb */}
      <TouchableOpacity
        onPress={isCheckedIn ? undefined : onPress}
        activeOpacity={isCheckedIn ? 1 : 0.85}
        disabled={isCheckedIn}
      >
        <Animated.View
          style={[
            styles.orb,
            styles.orbActive,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Text style={styles.orbNumber}>{streakCount}</Text>
          <Text style={styles.orbUnit}>Day Streak</Text>
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
    backgroundColor: '#0b160f',
    borderWidth: 1,
    borderColor: 'rgba(117, 255, 104, 0.38)',
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
    opacity: 0.6,
  },

});

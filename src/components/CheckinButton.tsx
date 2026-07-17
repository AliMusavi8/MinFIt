// ─── FlowNote Streak — Check-in Orb ────────────────────
//
// Redesigned to match the reference: large 192px glowing green orb
// with a hold-to-check-in mechanic (press-and-hold for confirmation).
// Shows a check icon on success, with glowing ambient backdrop.

import React, { useEffect, useRef, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Animated,
  Easing,
} from 'react-native';
import { colors, typography, spacing } from '../lib/theme';

interface CheckinButtonProps {
  isCheckedIn: boolean;
  onPress: () => void;
  streakCount: number;
}

const INNER_SIZE = 200;

export function CheckinButton({ isCheckedIn, onPress, streakCount }: CheckinButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Subtle breathing pulse when not checked in
  useEffect(() => {
    if (!isCheckedIn) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => { pulse.stop(); };
    } else {
      pulseAnim.setValue(1);
    }
  }, [isCheckedIn, pulseAnim]);

  return (
    <View style={styles.wrapper}>

      {/* Main orb */}
      <Animated.View
        style={[
          styles.orbOuter,
          !isCheckedIn && { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.orb,
            isCheckedIn ? styles.orbDone : styles.orbActive,
          ]}
          onPress={isCheckedIn ? undefined : onPress}
          activeOpacity={isCheckedIn ? 1 : 0.85}
          disabled={isCheckedIn}
        >
          {isCheckedIn ? (
            <Text style={styles.checkIcon}>✓</Text>
          ) : (
            <>
              <Text style={styles.orbNumber}>{streakCount}</Text>
              <Text style={styles.orbUnit}>
                {streakCount === 1 ? 'day' : 'days'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Tooltip */}
      <Text style={styles.tooltip}>
        {isCheckedIn ? 'Check-in completed!' : 'Hold 5s to check in'}
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

  orbOuter: {
    borderRadius: INNER_SIZE / 2,
  },
  orb: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(85, 234, 77, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(85, 234, 77, 0.2)',
  },
  orbActive: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 16,
  },
  orbDone: {
    backgroundColor: colors.primary,
    borderWidth: 0,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  checkIcon: {
    fontSize: 64,
    color: '#ffffff',
    fontWeight: '600',
  },
  orbNumber: {
    fontSize: 54,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -1,
  },
  orbUnit: {
    fontSize: typography.base,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
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

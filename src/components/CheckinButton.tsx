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

const ORB_SIZE = 192;
const INNER_SIZE = 160;

export function CheckinButton({ isCheckedIn, onPress, streakCount }: CheckinButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

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
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.6,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      glow.start();
      return () => { pulse.stop(); glow.stop(); };
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0.5);
    }
  }, [isCheckedIn, pulseAnim, glowAnim]);

  return (
    <View style={styles.wrapper}>
      {/* Ambient glow behind orb */}
      <Animated.View
        style={[
          styles.ambientGlow,
          { opacity: glowAnim },
        ]}
      />

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
          <View style={[styles.orbInner, isCheckedIn && styles.orbInnerDone]}>
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
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Tooltip */}
      <Text style={styles.tooltip}>
        {isCheckedIn ? 'Check-in completed!' : 'Hold 5s to check in'}
      </Text>

      {/* Momentum label */}
      <Text style={styles.momentumTitle}>Current Momentum</Text>
      <Text style={styles.momentumSubtitle}>
        {isCheckedIn
          ? `${streakCount} Days Consistent`
          : `${streakCount} Day${streakCount === 1 ? '' : 's'} Streak`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    minHeight: 340,
    justifyContent: 'center',
  },
  ambientGlow: {
    position: 'absolute',
    width: ORB_SIZE * 1.8,
    height: ORB_SIZE * 1.8,
    borderRadius: ORB_SIZE,
    backgroundColor: colors.primary,
    opacity: 0.08,
  },
  orbOuter: {
    borderRadius: ORB_SIZE / 2,
  },
  orb: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(85, 234, 77, 0.4)',
  },
  orbActive: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 16,
  },
  orbDone: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  orbInner: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE / 2,
    backgroundColor: 'rgba(85, 234, 77, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(85, 234, 77, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbInnerDone: {
    backgroundColor: 'rgba(85, 234, 77, 0.2)',
  },
  checkIcon: {
    fontSize: 48,
    color: '#fff',
    fontWeight: '300',
  },
  orbNumber: {
    fontSize: 42,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -1,
  },
  orbUnit: {
    fontSize: typography.sm,
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
  momentumTitle: {
    marginTop: spacing.sm,
    fontSize: typography.headlineLgMobile,
    fontWeight: '300',
    color: colors.text,
    letterSpacing: -0.5,
  },
  momentumSubtitle: {
    marginTop: spacing.xs,
    fontSize: typography.base,
    color: colors.primary,
    fontWeight: '400',
  },
});

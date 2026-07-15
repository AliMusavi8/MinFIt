// ─── FlowNote Streak — Check-in Button ────────────────────

import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors, typography, spacing, radius } from '../lib/theme';

interface CheckinButtonProps {
  isCheckedIn: boolean;
  onPress: () => void;
}

export function CheckinButton({ isCheckedIn, onPress }: CheckinButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (isCheckedIn) return;

    // Satisfying bounce animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.button,
          isCheckedIn ? styles.buttonDone : styles.buttonActive,
        ]}
        onPress={handlePress}
        activeOpacity={isCheckedIn ? 1 : 0.8}
        disabled={isCheckedIn}
      >
        <Text style={[styles.text, isCheckedIn && styles.textDone]}>
          {isCheckedIn ? '✓  Done for today' : '🔥  Mark Done for Today'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
  },
  buttonActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDone: {
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  text: {
    fontSize: typography.md,
    fontWeight: '700',
    color: colors.textOnPrimary,
    letterSpacing: 0.5,
  },
  textDone: {
    color: colors.primary,
  },
});

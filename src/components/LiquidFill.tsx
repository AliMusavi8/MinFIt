import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../lib/theme';

interface LiquidFillProps {
  borderRadius: number;
  position?: 'top' | 'bottom' | 'full';
}

export function LiquidFill({ borderRadius, position = 'bottom' }: LiquidFillProps) {
  return (
    <View
      collapsable={false}
      pointerEvents="none"
      style={[styles.clip, { borderRadius }]}
    >
      <View
        style={[
          styles.fill,
          position === 'full' && styles.full,
          position === 'top' && styles.top,
          position === 'bottom' && styles.bottom,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerHighest,
  },
  fill: {
    position: 'absolute',
    right: 0,
    left: 0,
    backgroundColor: colors.primary,
  },
  full: {
    top: 0,
    bottom: 0,
  },
  top: {
    top: 0,
    height: '50%',
  },
  bottom: {
    bottom: 0,
    height: '50%',
  },
});

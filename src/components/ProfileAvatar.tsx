import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../lib/theme';

interface ProfileAvatarProps {
  size?: number;
}

export function ProfileAvatar({ size = 40 }: ProfileAvatarProps) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="8" r="4" fill={colors.textSecondary} />
        <Path d="M4.5 21c.8-4 3.3-6 7.5-6s6.7 2 7.5 6" fill={colors.textSecondary} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerHighest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
});

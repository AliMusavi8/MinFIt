// ─── MinFit — Empty State Component ──────────────────────────────

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, typography, spacing } from '../lib/theme';

interface EmptyStateProps {
  title: string;
  subtitle: string;
}

export function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.divider} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 1.5,
    paddingHorizontal: spacing.xl,
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: '300',
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sm,
    color: colors.textMuted,
    textAlign: 'center',
    fontFamily: fonts.regular,
    lineHeight: 20,
  },
});

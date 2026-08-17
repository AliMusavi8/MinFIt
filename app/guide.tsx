import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts, radius, spacing, typography } from '../src/lib/theme';

const GUIDE_ITEMS = [
  'Press and hold the orb for 3 seconds to complete the selected habit.',
  'If you want to change you streak history, you can do so on the home screen by \n\nMonthly Consistency > 12 Months > Edit.',
];

export default function GuideScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Back to settings"
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={() => router.replace('/settings')}
        >
          <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 18l-6-6 6-6"
              stroke={colors.primary}
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.title}>IMPORTANT THINGS TO KNOW</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {GUIDE_ITEMS.map((item, index) => (
            <View key={item}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.guideItem}>
                <View style={styles.numberBadge}>
                  <Text style={styles.number}>{index + 1}</Text>
                </View>
                <Text style={styles.itemBody}>{item}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSelf,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
    letterSpacing: 1.2,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSelf,
    overflow: 'hidden',
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md + 4,
    gap: spacing.md,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryMuted,
  },
  number: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: typography.xs,
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: typography.sm,
    lineHeight: 20,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing.md + 48,
    backgroundColor: 'rgba(61, 74, 57, 0.25)',
  },
});

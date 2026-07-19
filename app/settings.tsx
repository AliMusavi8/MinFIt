// ─── FlowNote Streak — Settings Screen ────────────────────
//
// Redesigned to match reference: branded header, bento-grid stat cards,
// Application settings with toggle switches, Privacy & Export section,
// Danger Zone, and version badge.

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Alert, ScrollView, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../src/lib/theme';
import { useStreak } from '../src/hooks/useStreak';
import { useJournal } from '../src/hooks/useJournal';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const { streak, reset } = useStreak();
  const { entries } = useJournal();
  const [clearing, setClearing] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const handleResetStreak = () => {
    Alert.alert(
      'Reset Streak',
      'This will reset your current streak to 0. Your history will be cleared. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: async () => { await reset(); } },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Delete Account & Data',
      'This action is permanent and cannot be undone. All journal entries and streak data will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            setClearing(true);
            await AsyncStorage.clear();
            setClearing(false);
            Alert.alert('Done', 'All data has been cleared. Restart the app to start fresh.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.menuIcon}>☰</Text>
            <Text style={styles.title}>Settings</Text>
          </View>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarText}>●</Text>
          </View>
        </View>

        {/* Application Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APPLICATION</Text>
          <View style={styles.card}>
            <SettingRow
              title="Daily Check-in Reminder"
              subtitle="Receive a nudge to log your progress"
              value={reminderEnabled}
              onToggle={setReminderEnabled}
            />
            <View style={styles.divider} />
            <SettingRow
              title="Cloud Data Sync"
              subtitle="Sync logs across all your devices"
              value={syncEnabled}
              onToggle={setSyncEnabled}
            />
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingTitle}>Theme</Text>
                <Text style={styles.settingSubtitle}>Currently: Dark Void</Text>
              </View>
              <Pressable>
                <Text style={styles.changeLink}>Change</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Privacy & Export */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRIVACY & EXPORT</Text>
          <View style={styles.card}>
            <Pressable style={styles.settingRow}>
              <View>
                <Text style={styles.settingTitle}>Export Journal</Text>
                <Text style={styles.settingSubtitle}>Download all data as CSV or PDF</Text>
              </View>
              <Text style={styles.actionIcon}>↓</Text>
            </Pressable>
            <View style={styles.divider} />
            <SettingRow
              title="Biometric Lock"
              subtitle="Require FaceID or Fingerprint"
              value={biometricEnabled}
              onToggle={setBiometricEnabled}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.dangerSectionTitle}>DANGER ZONE</Text>
          <Pressable
            style={styles.dangerCard}
            onPress={handleClearAll}
            disabled={clearing}
          >
            <View>
              <Text style={styles.dangerTitle}>
                {clearing ? 'Deleting...' : 'Delete Account & Data'}
              </Text>
              <Text style={styles.dangerSubtitle}>
                This action is permanent and cannot be undone
              </Text>
            </View>
            <Text style={styles.dangerIcon}>✕</Text>
          </Pressable>
        </View>

        {/* Version badge */}
        <View style={styles.versionContainer}>
          <View style={styles.versionBadge}>
            <View style={styles.versionDot} />
            <Text style={styles.versionText}>FlowNote Streak v1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Toggle setting row component
function SettingRow({
  title,
  subtitle,
  value,
  onToggle,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onToggle: (val: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{
          false: colors.surfaceContainerHighest,
          true: 'rgba(50, 205, 50, 0.2)',
        }}
        thumbColor={value ? colors.primary : colors.textMuted}
        ios_backgroundColor={colors.surfaceContainerHighest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxl + spacing.xl,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    height: 64,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuIcon: {
    fontSize: 20,
    color: colors.primary,
  },
  title: {
    fontSize: typography.headlineMd,
    fontWeight: '500',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(61, 74, 57, 0.2)',
  },
  avatarText: {
    fontSize: 14,
    color: colors.textMuted,
  },

  // Sections
  section: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.labelSm,
    color: colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: spacing.md,
    marginLeft: 2,
  },
  dangerSectionTitle: {
    fontSize: typography.labelSm,
    color: 'rgba(220, 20, 60, 0.6)',
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: spacing.md,
    marginLeft: 2,
  },

  // Cards
  card: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSelf,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(61, 74, 57, 0.1)',
  },

  // Setting rows
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md + 4,
  },
  settingTitle: {
    fontSize: typography.base,
    color: colors.text,
    fontWeight: '400',
  },
  settingSubtitle: {
    fontSize: typography.xs,
    color: 'rgba(188, 203, 180, 0.7)',
    marginTop: 2,
  },
  changeLink: {
    fontSize: typography.labelMd,
    color: colors.primary,
    fontWeight: '500',
  },
  actionIcon: {
    fontSize: 20,
    color: colors.textSecondary,
  },

  // Danger zone
  dangerCard: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(220, 20, 60, 0.15)',
    padding: spacing.md + 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dangerTitle: {
    fontSize: typography.base,
    color: colors.danger,
    fontWeight: '500',
  },
  dangerSubtitle: {
    fontSize: typography.xs,
    color: 'rgba(188, 203, 180, 0.5)',
    marginTop: 2,
  },
  dangerIcon: {
    fontSize: 20,
    color: 'rgba(220, 20, 60, 0.7)',
  },

  // Version badge
  versionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginTop: spacing.lg,
  },
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(61, 74, 57, 0.3)',
    opacity: 0.4,
  },
  versionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  versionText: {
    fontSize: typography.labelSm,
    color: colors.textSecondary,
  },
});

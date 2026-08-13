// ─── MinFit — Settings Screen ─────────────────────────────
//
// Redesigned to match reference: branded header, bento-grid stat cards,
// Application settings with toggle switches, Privacy & Export section,
// and version badge.

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Alert, ScrollView, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts, typography, spacing, radius } from '../src/lib/theme';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import {
  createMinFitBackup,
  getStreak,
  restoreMinFitBackup,
  saveSecondaryHabitName,
} from '../src/lib/storage';

export default function SettingsScreen() {
  const [checkingForUpdates, setCheckingForUpdates] = useState(false);
  const [exporting, setExporting] = useState(false);
  const router = useRouter();
  const [importing, setImporting] = useState(false);
  const [secondaryHabitName, setSecondaryHabitName] = useState('SECOND HABIT');
  useEffect(() => {
    getStreak().then((streak) => setSecondaryHabitName(streak.secondaryHabitName));
  }, []);

  const handleHabitNameBlur = async () => {
    const savedName = await saveSecondaryHabitName(secondaryHabitName);
    setSecondaryHabitName(savedName);
  };

  const appVersion = Constants.appOwnership === 'expo'
    ? Constants.expoConfig?.version
    : Application.nativeApplicationVersion;

  const handleCheckForUpdates = async () => {
    if (!Updates.isEnabled) {
      Alert.alert(
        'Updates unavailable',
        'Update checks are available in a published MinFit build, not Expo Go or a development build.'
      );
      return;
    }

    setCheckingForUpdates(true);
    try {
      const update = await Updates.checkForUpdateAsync();
      if (!update.isAvailable) {
        Alert.alert('You are up to date', 'You already have the latest version of MinFit.');
        return;
      }

      await Updates.fetchUpdateAsync();
      Alert.alert(
        'Update downloaded',
        'Restart MinFit now to use the latest version?',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Restart now', onPress: () => { void Updates.reloadAsync(); } },
        ]
      );
    } catch {
      Alert.alert('Could not check for updates', 'Check your connection and try again.');
    } finally {
      setCheckingForUpdates(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      if (!FileSystem.documentDirectory) throw new Error('Backup storage is unavailable.');
      const backup = await createMinFitBackup();
      const date = new Date().toISOString().slice(0, 10);
      const fileUri = `${FileSystem.documentDirectory}minfit-backup-${date}.json`;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backup, null, 2));

      if (!await Sharing.isAvailableAsync()) {
        Alert.alert('Backup created', 'Your backup was created, but sharing is unavailable on this device.');
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Save MinFit backup',
      });
    } catch {
      Alert.alert('Export failed', 'Your data could not be exported. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const restoreBackup = async (backup: unknown) => {
    setImporting(true);
    try {
      await restoreMinFitBackup(backup);
      Alert.alert('Backup imported', 'Restart MinFit to load your restored streaks and journal entries.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Your data could not be imported.';
      Alert.alert('Import failed', message);
    } finally {
      setImporting(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/json', 'text/plain'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const contents = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const backup: unknown = JSON.parse(contents);
      Alert.alert(
        'Replace local data?',
        'Importing replaces the current streaks and journal entries on this device.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Import', style: 'destructive', onPress: () => { void restoreBackup(backup); } },
        ],
      );
    } catch {
      Alert.alert('Import failed', 'Choose a valid MinFit backup file and try again.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Text style={styles.brandMin}>Min</Text>
            <Text style={styles.brandFit}>Fit</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Important things to know"
          style={[styles.card, styles.guideCard]}
          onPress={() => router.push('/guide')}
        >
          <Text style={[styles.settingTitle, styles.guideTitle]}>Important things to know</Text>
          <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
            <Path
              d="M9 6l6 6-6 6"
              stroke={colors.primary}
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>

        {/* Habit Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HABITS</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.rowContent}>
                <Text style={styles.settingTitle}>Second habit name</Text>
                <Text style={styles.settingSubtitle}>Shown on the back side of the check-in orb</Text>
              </View>
              <TextInput
                accessibilityLabel="Second habit name"
                value={secondaryHabitName}
                onChangeText={setSecondaryHabitName}
                onBlur={() => { void handleHabitNameBlur(); }}
                maxLength={18}
                selectTextOnFocus
                autoCapitalize="words"
                returnKeyType="done"
                style={styles.habitInput}
              />
            </View>
          </View>
        </View>

        {/* Application Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APPLICATION</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.rowContent}>
                <Text style={styles.settingTitle}>Local data storage</Text>
                <Text style={styles.settingSubtitle}>Your streaks and notes are saved on this device</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <Pressable
              style={styles.settingRow}
              onPress={handleCheckForUpdates}
              disabled={checkingForUpdates}
            >
              <View style={styles.rowContent}>
                <Text style={styles.settingTitle}>Check for updates</Text>
                <Text style={styles.settingSubtitle}>
                  {checkingForUpdates ? 'Checking for a new version…' : 'Download the latest available version'}
                </Text>
              </View>
              <Text style={styles.actionIcon}>↻</Text>
            </Pressable>
          </View>
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>YOUR DATA</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.rowContent}>
                <Text style={styles.settingTitle}>Private by default</Text>
                <Text style={styles.settingSubtitle}>MinFit does not currently sync data to a server</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <Pressable
              style={styles.settingRow}
              onPress={handleExport}
              disabled={exporting || importing}
            >
              <View style={styles.rowContent}>
                <Text style={styles.settingTitle}>{exporting ? 'Exporting...' : 'Export data'}</Text>
                <Text style={styles.settingSubtitle}>Save your streaks and notes as a backup file</Text>
              </View>
            </Pressable>
            <View style={styles.divider} />
            <Pressable
              style={styles.settingRow}
              onPress={handleImport}
              disabled={exporting || importing}
            >
              <View style={styles.rowContent}>
                <Text style={styles.settingTitle}>{importing ? 'Importing...' : 'Import data'}</Text>
                <Text style={styles.settingSubtitle}>Restore streaks and notes from a backup file</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Version badge */}
        <View style={styles.versionContainer}>
          <View style={styles.versionBadge}>
            <View style={styles.versionDot} />
            <Text style={styles.versionText}>MinFit v{appVersion ?? '0.0.1'}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    height: 72,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandMin: {
    fontSize: typography.headlineMd,
    fontFamily: fonts.semibold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  brandFit: {
    fontSize: typography.headlineMd,
    fontFamily: fonts.semibold,
    color: colors.primary,
    letterSpacing: -0.5,
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
    fontFamily: fonts.semibold,
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
  guideCard: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    padding: spacing.md + 4,
    flexDirection: 'row',
    alignItems: 'center',
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(61, 74, 57, 0.1)',
  },
  guideTitle: {
    flex: 1,
    paddingRight: spacing.md,
  },

  // Setting rows
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md + 4,
  },
  rowContent: {
    flex: 1,
    paddingRight: spacing.md,
  },
  settingTitle: {
    fontSize: typography.base,
    color: colors.text,
    fontWeight: '400',
    fontFamily: fonts.regular,
  },
  settingSubtitle: {
    fontSize: typography.xs,
    color: 'rgba(188, 203, 180, 0.7)',
    marginTop: 2,
    fontFamily: fonts.regular,
  },
  habitInput: {
    width: 118,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(85, 234, 77, 0.25)',
    backgroundColor: colors.bgInput,
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: typography.xs,
    textAlign: 'center',
  },
  actionIcon: {
    fontSize: 20,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
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
    fontFamily: fonts.regular,
  },
});

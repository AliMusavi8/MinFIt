// ─── FlowNote Streak — Settings Screen ────────────────────
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../src/lib/theme';
import { useStreak } from '../src/hooks/useStreak';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const { streak, reset } = useStreak();
  const [clearing, setClearing] = useState(false);

  const handleResetStreak = () => {
    Alert.alert('Reset Streak', 'This will reset your current streak to 0. Your history will be cleared. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: async () => { await reset(); } },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert('Clear All Data', 'This will permanently delete all journal entries and streak data. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete Everything', style: 'destructive', onPress: async () => {
        setClearing(true);
        await AsyncStorage.clear();
        setClearing(false);
        Alert.alert('Done', 'All data has been cleared. Restart the app to start fresh.');
      }},
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STATS</Text>
          <View style={styles.card}>
            <StatRow label="Current Streak" value={`${streak.currentStreak} days`} />
            <StatRow label="Longest Streak" value={`${streak.longestStreak} days`} />
            <StatRow label="Total Check-ins" value={`${streak.checkinHistory.length}`} />
            <StatRow label="Last Check-in" value={streak.lastCheckinDate || 'Never'} last />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <View style={styles.card}>
            <StatRow label="App" value="FlowNote Streak" />
            <StatRow label="Version" value="1.0.0" />
            <StatRow label="Storage" value="Local (offline)" last />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DANGER ZONE</Text>
          <TouchableOpacity style={styles.dangerButton} onPress={handleResetStreak} activeOpacity={0.7}>
            <Text style={styles.dangerButtonText}>Reset Streak</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dangerButton, styles.dangerButtonFull]} onPress={handleClearAll} activeOpacity={0.7} disabled={clearing}>
            <Text style={[styles.dangerButtonText, styles.dangerButtonFullText]}>
              {clearing ? 'Clearing…' : 'Clear All Data'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Made with 💚 for consistency</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[statStyles.row, !last && statStyles.rowBorder]}>
      <Text style={statStyles.label}>{label}</Text>
      <Text style={statStyles.value}>{value}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm + 2 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { fontSize: typography.base, color: colors.textSecondary },
  value: { fontSize: typography.base, color: colors.text, fontWeight: '600' },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1 },
  content: { paddingBottom: spacing.xxl },
  title: { fontSize: typography.xxl, fontWeight: '800', color: colors.text, letterSpacing: -1, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  section: { marginTop: spacing.lg, paddingHorizontal: spacing.lg },
  sectionTitle: { fontSize: typography.xs, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: spacing.sm },
  card: { backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  dangerButton: { backgroundColor: colors.dangerMuted, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.danger },
  dangerButtonText: { fontSize: typography.base, fontWeight: '600', color: colors.danger },
  dangerButtonFull: { backgroundColor: colors.danger },
  dangerButtonFullText: { color: '#fff' },
  footer: { textAlign: 'center', fontSize: typography.sm, color: colors.textMuted, marginTop: spacing.xxl, paddingBottom: spacing.lg },
});

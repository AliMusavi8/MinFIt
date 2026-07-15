// ─── FlowNote Streak — Journal Entry Card ────────────────────

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { JournalEntry } from '../types';
import { colors, typography, spacing, radius } from '../lib/theme';

dayjs.extend(relativeTime);

interface EntryCardProps {
  entry: JournalEntry;
  onPress: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

export function EntryCard({ entry, onPress, onDelete }: EntryCardProps) {
  const dateDisplay = dayjs(entry.date).format('ddd, MMM D');
  const timeAgo = dayjs(entry.updatedAt).fromNow();
  const preview =
    entry.content.length > 120
      ? entry.content.slice(0, 120) + '…'
      : entry.content;

  const handleLongPress = () => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDelete(entry.id),
      },
    ]);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(entry)}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.date}>{dateDisplay}</Text>
        <Text style={styles.timeAgo}>{timeAgo}</Text>
      </View>
      <Text style={styles.preview} numberOfLines={3}>
        {preview || 'Empty entry…'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  date: {
    fontSize: typography.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  timeAgo: {
    fontSize: typography.xs,
    color: colors.textMuted,
  },
  preview: {
    fontSize: typography.base,
    color: colors.text,
    lineHeight: 22,
  },
});

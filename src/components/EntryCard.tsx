// ─── MinFit — Journal Entry Card ─────────────────────────────────
//
// Redesigned to match reference Notes screen: dark card with
// headline-style title, body text, and subtle hover border.
// Uses the #0E0E1E card background with outline-variant border.

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { JournalEntry } from '../types';
import { colors, fonts, typography, spacing, radius } from '../lib/theme';

dayjs.extend(relativeTime);

interface EntryCardProps {
  entry: JournalEntry;
  onPress: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

export function EntryCard({ entry, onPress, onDelete }: EntryCardProps) {
  const isToday = entry.date === dayjs().format('YYYY-MM-DD');
  const isYesterday = entry.date === dayjs().subtract(1, 'day').format('YYYY-MM-DD');

  let dateDisplay: string;
  if (isToday) {
    dateDisplay = `Today, ${dayjs(entry.date).format('MMM D')}`;
  } else if (isYesterday) {
    dateDisplay = `Yesterday, ${dayjs(entry.date).format('MMM D')}`;
  } else {
    dateDisplay = dayjs(entry.date).format('MMM D');
  }

  const preview = entry.body.length > 160 ? entry.body.slice(0, 160) + '...' : entry.body;

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
    <View style={styles.timelineItem}>
      {/* Timeline dot */}
      <View style={styles.dotColumn}>
        <View
          style={[
            styles.dot,
            isToday && styles.dotToday,
          ]}
        />
      </View>

      <View style={styles.contentColumn}>
        {/* Date label */}
        <Text style={[styles.dateLabel, isToday && styles.dateLabelToday]}>
          {dateDisplay.toUpperCase()}
        </Text>

        {/* Card */}
        <Pressable
          style={styles.card}
          onPress={() => onPress(entry)}
          onLongPress={handleLongPress}
        >
          <Text style={styles.title} numberOfLines={1}>{entry.title}</Text>
          {preview ? (
            <Text style={styles.body} numberOfLines={4}>{preview}</Text>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  timelineItem: {
    flexDirection: 'row',
    marginBottom: spacing.lg + spacing.sm,
  },
  dotColumn: {
    width: 20,
    alignItems: 'center',
    paddingTop: 6,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.bg,
  },
  dotToday: {
    borderColor: colors.primaryContainer,
  },
  contentColumn: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  dateLabel: {
    fontSize: typography.labelSm,
    color: colors.textMuted,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    letterSpacing: 2,
    marginBottom: spacing.sm,
    opacity: 0.6,
  },
  dateLabelToday: {
    color: colors.primary,
    opacity: 1,
  },
  card: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(61, 74, 57, 0.05)',
  },
  title: {
    fontSize: typography.headlineMd,
    fontWeight: '500',
    fontFamily: fonts.medium,
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: typography.base,
    color: colors.textSecondary,
    lineHeight: 24,
    fontFamily: fonts.regular,
  },
});

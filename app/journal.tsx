// ─── MinFit — Notes Screen ─────────────────────────────
//
// Redesigned to match reference: "Notes" branded header with
// search icon + avatar, motivational quote, timeline-style
// entry cards, reflection streak badge, and FAB for new entry.

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  Modal, Keyboard, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import { colors, fonts, typography, spacing, radius } from '../src/lib/theme';
import { useJournal } from '../src/hooks/useJournal';
import { useStreak } from '../src/hooks/useStreak';
import { JournalEntry } from '../src/types';
import { EntryCard } from '../src/components/EntryCard';
import { EmptyState } from '../src/components/EmptyState';
import { ProfileAvatar } from '../src/components/ProfileAvatar';
import { RichTextEditor } from '../src/components/RichTextEditor';

export default function JournalScreen() {
  const { entries, loading, addEntry, updateEntry, deleteEntry, searchEntries } = useJournal();
  const { liveStreak } = useStreak();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [editorContent, setEditorContent] = useState('');

  const displayEntries = searchQuery ? searchEntries(searchQuery) : entries;

  const handleNewEntry = () => {
    setEditingEntry(null);
    setEditorContent('');
    setIsEditing(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setEditorContent(entry.content);
    setIsEditing(true);
  };

  const handleSave = async () => {
    const content = editorContent.trim();
    const plainContent = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    if (!plainContent) { setIsEditing(false); return; }
    if (editingEntry) { await updateEntry(editingEntry.id, content); }
    else { await addEntry(content); }
    setIsEditing(false);
    setEditorContent('');
    setEditingEntry(null);
  };

  const handleDiscard = () => {
    Keyboard.dismiss();
    setIsEditing(false);
    setEditorContent('');
    setEditingEntry(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Text style={styles.brandMin}>Min</Text>
            <Text style={styles.brandFit}>Fit</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable onPress={() => setShowSearch(!showSearch)}>
              <Text style={styles.searchIcon}>⌕</Text>
            </Pressable>
            <ProfileAvatar />
          </View>
        </View>

        {/* Search bar (toggleable) */}
        {showSearch && (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search notes..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.clearText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Motivational quote */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>
            "Focus on the process, not just the result."
          </Text>
        </View>

        {/* Timeline */}
        <View style={styles.timelineLine} />

        {/* Entries list */}
        <FlatList
          data={displayEntries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EntryCard entry={item} onPress={handleEditEntry} onDelete={deleteEntry} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            loading ? null : (
              <EmptyState
                title="No notes yet"
                subtitle="Tap + to write your first reflection."
              />
            )
          }
          ListFooterComponent={
            displayEntries.length > 0 ? (
              <View style={styles.streakBadge}>
                <Text style={styles.streakBadgeIcon}>★</Text>
                <Text style={styles.streakBadgeText}>
                  {liveStreak} DAY REFLECTION STREAK
                </Text>
              </View>
            ) : null
          }
        />

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={handleNewEntry}
          activeOpacity={0.85}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>

        {/* Editor Modal */}
        <Modal
          visible={isEditing}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={handleDiscard}
        >
          <KeyboardAvoidingView
            style={styles.editorContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <SafeAreaView style={styles.editorSafe}>
              <View style={styles.editorHeader}>
                <Pressable onPress={handleDiscard} hitSlop={8}>
                  <Text style={styles.editorCancel}>Cancel</Text>
                </Pressable>
                <Text style={styles.editorDate}>
                  {editingEntry
                    ? dayjs(editingEntry.date).format('MMM D, YYYY')
                    : dayjs().format('MMM D, YYYY')}
                </Text>
                <Pressable onPress={handleSave} hitSlop={8}>
                  <Text style={styles.editorSave}>Save</Text>
                </Pressable>
              </View>
              {isEditing && (
                <RichTextEditor
                  key={editingEntry?.id ?? 'new'}
                  initialContent={editorContent}
                  onChange={setEditorContent}
                />
              )}
            </SafeAreaView>
          </KeyboardAvoidingView>
        </Modal>
      </View>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  searchIcon: {
    fontSize: 22,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
  },

  // Search
  searchContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.base,
    color: colors.text,
    fontFamily: fonts.regular,
    borderWidth: 1,
    borderColor: colors.borderSelf,
  },
  clearButton: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  clearText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
  },

  // Quote
  quoteContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  quoteText: {
    fontSize: typography.base,
    color: colors.textMuted,
    fontStyle: 'italic',
    fontFamily: fonts.regular,
    opacity: 0.6,
  },

  // Timeline line
  timelineLine: {
    position: 'absolute',
    left: spacing.lg + 7,
    top: 180,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(61, 74, 57, 0.1)',
  },

  // List
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl + spacing.xl,
  },

  // Streak badge
  streakBadge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#f0f0f5',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: 9999,
    marginTop: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  streakBadgeIcon: {
    fontSize: 16,
    color: colors.bg,
    fontFamily: fonts.regular,
  },
  streakBadgeText: {
    fontSize: typography.labelMd,
    fontWeight: '500',
    fontFamily: fonts.medium,
    color: colors.bg,
    letterSpacing: 0.5,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgb(50, 205, 50)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  fabIcon: {
    fontSize: 28,
    color: colors.bg,
    fontWeight: '300',
    fontFamily: fonts.regular,
    marginTop: -2,
  },

  // Editor Modal
  editorContainer: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  editorSafe: {
    flex: 1,
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  editorCancel: {
    fontSize: typography.base,
    color: colors.textMuted,
    fontFamily: fonts.regular,
  },
  editorDate: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: '500',
    fontFamily: fonts.medium,
  },
  editorSave: {
    fontSize: typography.base,
    color: colors.primary,
    fontWeight: '600',
    fontFamily: fonts.semibold,
  },
});

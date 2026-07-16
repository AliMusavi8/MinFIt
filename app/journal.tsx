// ─── FlowNote Streak — Notes Screen ────────────────────
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
import { colors, typography, spacing, radius } from '../src/lib/theme';
import { useJournal } from '../src/hooks/useJournal';
import { useStreak } from '../src/hooks/useStreak';
import { JournalEntry } from '../src/types';
import { EntryCard } from '../src/components/EntryCard';
import { EmptyState } from '../src/components/EmptyState';

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
    if (!content) { setIsEditing(false); return; }
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
          <View style={styles.headerLeft}>
            <Text style={styles.menuIcon}>☰</Text>
            <Text style={styles.title}>Notes</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable onPress={() => setShowSearch(!showSearch)}>
              <Text style={styles.searchIcon}>⌕</Text>
            </Pressable>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarText}>●</Text>
            </View>
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
              <TextInput
                style={styles.editor}
                multiline
                autoFocus
                placeholder="Write freely..."
                placeholderTextColor={colors.textMuted}
                value={editorContent}
                onChangeText={setEditorContent}
                textAlignVertical="top"
                scrollEnabled
              />
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
    color: colors.textSecondary,
  },
  title: {
    fontSize: typography.headlineMd,
    fontWeight: '700',
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
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerHighest,
    borderWidth: 1,
    borderColor: 'rgba(61, 74, 57, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    color: colors.textMuted,
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
  },
  streakBadgeText: {
    fontSize: typography.labelMd,
    fontWeight: '500',
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
  },
  editorDate: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  editorSave: {
    fontSize: typography.base,
    color: colors.primary,
    fontWeight: '600',
  },
  editor: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    fontSize: typography.md,
    color: colors.text,
    lineHeight: 28,
  },
});

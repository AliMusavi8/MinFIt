// ─── MinFit — Notes Screen ─────────────────────────────
//
// Redesigned to match reference: "Notes" branded header with
// motivational quote, timeline-style
// entry cards, reflection streak badge, and FAB for new entry.

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  Modal, Keyboard, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import dayjs from 'dayjs';
import { colors, fonts, typography, spacing, radius } from '../src/lib/theme';
import { useJournal } from '../src/hooks/useJournal';
import { JournalEntry } from '../src/types';
import { EntryCard } from '../src/components/EntryCard';
import { EmptyState } from '../src/components/EmptyState';

export default function JournalScreen() {
  const { entries, loading, addEntry, updateEntry, deleteEntry } = useJournal();
  const [isEditing, setIsEditing] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');

  const handleNewEntry = () => {
    setEditingEntry(null);
    setNoteTitle('');
    setNoteBody('');
    setIsEditing(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setNoteTitle(entry.title);
    setNoteBody(entry.body);
    setIsEditing(true);
  };

  const handleSave = async () => {
    const title = noteTitle.trim();
    const body = noteBody.trim();
    if (!title && !body) { setIsEditing(false); return; }
    if (editingEntry) { await updateEntry(editingEntry.id, title || 'Untitled', body); }
    else { await addEntry(title || 'Untitled', body); }
    setIsEditing(false);
    setNoteTitle('');
    setNoteBody('');
    setEditingEntry(null);
  };

  const handleDiscard = () => {
    Keyboard.dismiss();
    setIsEditing(false);
    setNoteTitle('');
    setNoteBody('');
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
        </View>

        {/* Motivational quote */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteText}>
            بغیر پانی کے پودا بڑا نہیں ہوتا
          </Text>
        </View>

        {/* Timeline */}
        <View style={styles.timelineLine} />

        {/* Entries list */}
        <FlatList
          data={entries}
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
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Back to notes"
                  activeOpacity={0.7}
                  style={styles.editorBackButton}
                  onPress={handleDiscard}
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
                <Text style={styles.editorDate}>
                  {editingEntry
                    ? dayjs(editingEntry.date).format('MMM D, YYYY')
                    : dayjs().format('MMM D, YYYY')}
                </Text>
                <Pressable onPress={handleSave} hitSlop={8}>
                  <Text style={styles.editorSave}>Save</Text>
                </Pressable>
              </View>
              <View style={styles.noteFields}>
                <TextInput
                  style={styles.titleInput}
                  value={noteTitle}
                  onChangeText={setNoteTitle}
                  placeholder="Title"
                  placeholderTextColor={colors.textMuted}
                />
                <TextInput
                  style={styles.bodyInput}
                  value={noteBody}
                  onChangeText={setNoteBody}
                  placeholder="Write your note..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  textAlignVertical="top"
                />
              </View>
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
  noteFields: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  titleInput: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: typography.headlineMd,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  bodyInput: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: typography.base,
    lineHeight: 24,
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
  editorBackButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSelf,
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

// ─── FlowNote Streak — Journal Screen ────────────────────
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  Animated, Modal, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import { colors, typography, spacing, radius } from '../src/lib/theme';
import { useJournal } from '../src/hooks/useJournal';
import { JournalEntry } from '../src/types';
import { EntryCard } from '../src/components/EntryCard';
import { EmptyState } from '../src/components/EmptyState';

export default function JournalScreen() {
  const { entries, loading, addEntry, updateEntry, deleteEntry, searchEntries } = useJournal();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const displayEntries = searchQuery ? searchEntries(searchQuery) : entries;

  const handleNewEntry = () => { setEditingEntry(null); setEditorContent(''); setIsEditing(true); };
  const handleEditEntry = (entry: JournalEntry) => { setEditingEntry(entry); setEditorContent(entry.content); setIsEditing(true); };

  const handleSave = async () => {
    const content = editorContent.trim();
    if (!content) { setIsEditing(false); return; }
    if (editingEntry) { await updateEntry(editingEntry.id, content); }
    else { await addEntry(content); }
    setIsEditing(false); setEditorContent(''); setEditingEntry(null);
  };

  const handleDiscard = () => { Keyboard.dismiss(); setIsEditing(false); setEditorContent(''); setEditingEntry(null); };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Journal</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleNewEntry} activeOpacity={0.7}>
            <Text style={styles.addButtonText}>+ New</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <TextInput style={styles.searchInput} placeholder="Search entries…" placeholderTextColor={colors.textMuted}
            value={searchQuery} onChangeText={setSearchQuery} returnKeyType="search" />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery('')}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.count}>{displayEntries.length} {displayEntries.length === 1 ? 'entry' : 'entries'}</Text>
        <FlatList data={displayEntries} keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EntryCard entry={item} onPress={handleEditEntry} onDelete={deleteEntry} />}
          contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}
          ListEmptyComponent={loading ? null : (
            <EmptyState emoji="📝" title="No entries yet" subtitle="Tap + New to write your first note." />
          )}
        />
        <Modal visible={isEditing} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleDiscard}>
          <KeyboardAvoidingView style={styles.editorContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <SafeAreaView style={styles.editorSafe}>
              <View style={styles.editorHeader}>
                <TouchableOpacity onPress={handleDiscard}><Text style={styles.editorCancel}>Cancel</Text></TouchableOpacity>
                <Text style={styles.editorDate}>{editingEntry ? dayjs(editingEntry.date).format('MMM D, YYYY') : dayjs().format('MMM D, YYYY')}</Text>
                <TouchableOpacity onPress={handleSave}><Text style={styles.editorSave}>Save</Text></TouchableOpacity>
              </View>
              <TextInput style={styles.editor} multiline autoFocus placeholder="Write freely…"
                placeholderTextColor={colors.textMuted} value={editorContent} onChangeText={setEditorContent} textAlignVertical="top" scrollEnabled />
            </SafeAreaView>
          </KeyboardAvoidingView>
        </Modal>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { fontSize: typography.xxl, fontWeight: '800', color: colors.text, letterSpacing: -1 },
  addButton: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full },
  addButtonText: { fontSize: typography.sm, fontWeight: '700', color: colors.textOnPrimary },
  searchContainer: { marginHorizontal: spacing.lg, marginTop: spacing.sm, position: 'relative' },
  searchInput: { backgroundColor: colors.bgInput, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, fontSize: typography.base, color: colors.text, borderWidth: 1, borderColor: colors.border },
  clearButton: { position: 'absolute', right: spacing.md, top: 0, bottom: 0, justifyContent: 'center' },
  clearText: { fontSize: typography.base, color: colors.textMuted },
  count: { fontSize: typography.xs, color: colors.textMuted, paddingHorizontal: spacing.lg, marginTop: spacing.sm, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 1 },
  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xxl },
  editorContainer: { flex: 1, backgroundColor: colors.bg },
  editorSafe: { flex: 1 },
  editorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  editorCancel: { fontSize: typography.base, color: colors.textMuted },
  editorDate: { fontSize: typography.sm, color: colors.textSecondary, fontWeight: '600' },
  editorSave: { fontSize: typography.base, color: colors.primary, fontWeight: '700' },
  editor: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md, fontSize: typography.md, color: colors.text, lineHeight: 28 },
});

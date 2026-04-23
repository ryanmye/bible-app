import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, TextInput, View } from 'react-native';
import { Button, Screen, Text, useTheme } from '../../ui';
import { useData } from '../../app/DataContext';
import { useReaderStore } from '../../app/stores/readerStore';
import type { Note } from '../../domain/notes/types';
import { osisNameFor } from '../../lib/osis';

export function NotesScreen() {
  const theme = useTheme();
  const { notes } = useData();
  const { book, chapter, primaryVersionId } = useReaderStore();
  const [list, setList] = useState<Note[]>([]);
  const [editing, setEditing] = useState<Note | null>(null);
  const [body, setBody] = useState('');
  const [verseStart, setVerseStart] = useState('1');

  const refresh = useCallback(() => {
    notes.list().then(setList);
  }, [notes]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = async () => {
    const v = Math.max(1, parseInt(verseStart, 10) || 1);
    if (editing) {
      await notes.update(editing.id, { body, verseStart: v, verseEnd: v });
    } else {
      await notes.create({
        anchorVersion: primaryVersionId,
        book,
        chapter,
        verseStart: v,
        verseEnd: v,
        body,
      });
    }
    setEditing(null);
    setBody('');
    setVerseStart('1');
    refresh();
  };

  const startEdit = (n: Note) => {
    setEditing(n);
    setBody(n.body);
    setVerseStart(String(n.verseStart));
  };

  return (
    <Screen>
      <Text variant="headingLg" style={{ marginBottom: theme.spacing.md }}>
        Notes
      </Text>

      <View
        style={{
          backgroundColor: theme.colors.bgElevated,
          padding: theme.spacing.md,
          borderRadius: theme.radius.md,
          marginBottom: theme.spacing.md,
          gap: theme.spacing.sm,
        }}
      >
        <Text variant="subtle">
          Attach to {osisNameFor(book)} {chapter}:{verseStart || '?'}
        </Text>
        <TextInput
          value={verseStart}
          onChangeText={setVerseStart}
          keyboardType="number-pad"
          placeholder="Verse"
          placeholderTextColor={theme.colors.textMuted}
          style={{
            borderWidth: 1,
            borderColor: theme.colors.border,
            color: theme.colors.text,
            padding: theme.spacing.sm,
            borderRadius: theme.radius.sm,
          }}
        />
        <TextInput
          value={body}
          onChangeText={setBody}
          multiline
          placeholder="Write a note…"
          placeholderTextColor={theme.colors.textMuted}
          style={{
            borderWidth: 1,
            borderColor: theme.colors.border,
            color: theme.colors.text,
            padding: theme.spacing.sm,
            borderRadius: theme.radius.sm,
            minHeight: 80,
          }}
        />
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <Button label={editing ? 'Update' : 'Add note'} onPress={save} />
          {editing && (
            <Button
              label="Cancel"
              variant="secondary"
              onPress={() => {
                setEditing(null);
                setBody('');
              }}
            />
          )}
        </View>
      </View>

      <FlatList
        data={list}
        keyExtractor={(n) => n.id}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: theme.colors.border }} />
        )}
        ListEmptyComponent={() => <Text variant="muted">No notes yet.</Text>}
        renderItem={({ item }) => (
          <Pressable onPress={() => startEdit(item)} style={{ paddingVertical: theme.spacing.sm }}>
            <Text variant="heading">
              {osisNameFor(item.book)} {item.chapter}:{item.verseStart}
              {item.verseEnd !== item.verseStart ? `-${item.verseEnd}` : ''}
            </Text>
            <Text>{item.body}</Text>
            <Pressable
              onPress={async () => {
                await notes.delete(item.id);
                refresh();
              }}
            >
              <Text style={{ color: theme.colors.danger, marginTop: theme.spacing.xs }}>Delete</Text>
            </Pressable>
          </Pressable>
        )}
      />
    </Screen>
  );
}

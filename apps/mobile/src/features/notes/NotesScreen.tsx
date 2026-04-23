import React, { useEffect, useState } from 'react';
import { FlatList, TextInput, View } from 'react-native';

import { Button, Row, Screen, Text, useTheme } from '../../ui';
import { getDb } from '../../data/db';
import { NotesRepository } from '../../data/repositories/NotesRepository';
import type { Note } from '../../domain/notes/types';
import { useReaderStore } from '../../app/stores/readerStore';
import { format } from 'date-fns';

export function NotesScreen() {
  const theme = useTheme();
  const { location } = useReaderStore();
  const [notes, setNotes] = useState<Note[]>([]);
  const [body, setBody] = useState('');
  const [verse, setVerse] = useState('1');

  const load = React.useCallback(async () => {
    const db = await getDb();
    const repo = new NotesRepository(db);
    setNotes(await repo.list());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!body.trim()) return;
    const verseNum = parseInt(verse, 10) || 1;
    const db = await getDb();
    const repo = new NotesRepository(db);
    await repo.create({
      anchorVersion: null,
      book: location.book,
      chapter: location.chapter,
      verseStart: verseNum,
      verseEnd: verseNum,
      body: body.trim(),
    });
    setBody('');
    load();
  };

  const remove = async (id: string) => {
    const db = await getDb();
    const repo = new NotesRepository(db);
    await repo.delete(id);
    load();
  };

  return (
    <Screen>
      <Text variant="title" style={{ marginBottom: theme.space(2) }}>
        Notes
      </Text>
      <Text variant="caption" style={{ marginBottom: theme.space(2) }}>
        Adding to {location.book} {location.chapter}
      </Text>

      <Row gap={8} align="flex-start" style={{ marginBottom: theme.space(2) }}>
        <TextInput
          value={verse}
          onChangeText={setVerse}
          keyboardType="number-pad"
          placeholder="v"
          placeholderTextColor={theme.color.textMuted}
          style={{
            width: 48,
            padding: theme.space(2),
            color: theme.color.textPrimary,
            borderWidth: 1,
            borderColor: theme.color.border,
            borderRadius: theme.radius.md,
            backgroundColor: theme.color.surface,
          }}
        />
        <TextInput
          value={body}
          onChangeText={setBody}
          multiline
          placeholder="New note..."
          placeholderTextColor={theme.color.textMuted}
          style={{
            flex: 1,
            minHeight: 60,
            padding: theme.space(2),
            color: theme.color.textPrimary,
            borderWidth: 1,
            borderColor: theme.color.border,
            borderRadius: theme.radius.md,
            backgroundColor: theme.color.surface,
          }}
        />
        <Button label="Save" onPress={save} />
      </Row>

      <FlatList
        data={notes}
        keyExtractor={(n) => n.id}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: theme.color.border }} />
        )}
        ListEmptyComponent={<Text muted>No notes yet.</Text>}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: theme.space(2) }}>
            <Row justify="space-between">
              <Text style={{ fontWeight: '600' }}>
                {item.book} {item.chapter}:{item.verseStart}
                {item.verseEnd !== item.verseStart ? `-${item.verseEnd}` : ''}
              </Text>
              <Row gap={8}>
                <Text variant="caption">
                  {format(new Date(item.updatedAt), 'yyyy-MM-dd HH:mm')}
                </Text>
                <Button
                  label="Delete"
                  variant="ghost"
                  onPress={() => remove(item.id)}
                />
              </Row>
            </Row>
            <Text>{item.body}</Text>
          </View>
        )}
      />
    </Screen>
  );
}

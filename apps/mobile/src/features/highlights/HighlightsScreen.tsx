import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, TextInput, View } from 'react-native';

import { Button, Row, Screen, Text, useTheme } from '../../ui';
import { getDb } from '../../data/db';
import { HighlightsRepository } from '../../data/repositories/HighlightsRepository';
import {
  HIGHLIGHT_COLORS,
  type Highlight,
  type HighlightColor,
} from '../../domain/highlights/types';
import { useReaderStore } from '../../app/stores/readerStore';

export function HighlightsScreen() {
  const theme = useTheme();
  const { location } = useReaderStore();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [color, setColor] = useState<HighlightColor>('yellow');
  const [verseStart, setVerseStart] = useState('1');
  const [verseEnd, setVerseEnd] = useState('1');

  const load = React.useCallback(async () => {
    const db = await getDb();
    const repo = new HighlightsRepository(db);
    setHighlights(await repo.list());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    const vs = parseInt(verseStart, 10) || 1;
    const ve = Math.max(vs, parseInt(verseEnd, 10) || vs);
    const db = await getDb();
    const repo = new HighlightsRepository(db);
    await repo.upsert({
      book: location.book,
      chapter: location.chapter,
      verseStart: vs,
      verseEnd: ve,
      color,
    });
    load();
  };

  const remove = async (id: string) => {
    const db = await getDb();
    const repo = new HighlightsRepository(db);
    await repo.delete(id);
    load();
  };

  return (
    <Screen>
      <Text variant="title" style={{ marginBottom: theme.space(2) }}>
        Highlights
      </Text>
      <Text variant="caption" style={{ marginBottom: theme.space(2) }}>
        Adding to {location.book} {location.chapter}
      </Text>

      <Row gap={6} wrap style={{ marginBottom: theme.space(2) }}>
        {HIGHLIGHT_COLORS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setColor(c)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: theme.highlight[c],
              borderWidth: c === color ? 3 : 1,
              borderColor:
                c === color ? theme.color.accent : theme.color.border,
            }}
          />
        ))}
      </Row>

      <Row gap={8} style={{ marginBottom: theme.space(3) }}>
        <TextInput
          value={verseStart}
          onChangeText={setVerseStart}
          keyboardType="number-pad"
          placeholder="from"
          placeholderTextColor={theme.color.textMuted}
          style={inputStyle(theme)}
        />
        <TextInput
          value={verseEnd}
          onChangeText={setVerseEnd}
          keyboardType="number-pad"
          placeholder="to"
          placeholderTextColor={theme.color.textMuted}
          style={inputStyle(theme)}
        />
        <Button label="Highlight" onPress={save} />
      </Row>

      <FlatList
        data={highlights}
        keyExtractor={(h) => h.id}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: theme.color.border }} />
        )}
        ListEmptyComponent={<Text muted>No highlights yet.</Text>}
        renderItem={({ item }) => (
          <Row
            justify="space-between"
            style={{ paddingVertical: theme.space(2) }}
          >
            <Row gap={8}>
              <View
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: theme.highlight[item.color],
                }}
              />
              <Text>
                {item.book} {item.chapter}:{item.verseStart}
                {item.verseEnd !== item.verseStart ? `-${item.verseEnd}` : ''}
              </Text>
            </Row>
            <Button
              label="Delete"
              variant="ghost"
              onPress={() => remove(item.id)}
            />
          </Row>
        )}
      />
    </Screen>
  );
}

function inputStyle(theme: ReturnType<typeof useTheme>) {
  return {
    width: 72,
    padding: theme.space(2),
    color: theme.color.textPrimary,
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.color.surface,
  };
}

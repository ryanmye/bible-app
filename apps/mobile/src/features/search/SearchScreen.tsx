import React, { useState } from 'react';
import { FlatList, TextInput, View } from 'react-native';

import { Button, Row, Screen, Text, useTheme } from '../../ui';
import { getDb } from '../../data/db';
import {
  BibleRepository,
  type SearchHit,
} from '../../data/repositories/BibleRepository';
import { useLibraryStore } from '../../app/stores/libraryStore';
import { useReaderStore } from '../../app/stores/readerStore';
import { canonicalBookName } from '../../domain/bible/canon';

export function SearchScreen() {
  const theme = useTheme();
  const versions = useLibraryStore((s) => s.versions);
  const primary = useReaderStore((s) => s.primaryVersion);
  const setLocation = useReaderStore((s) => s.setLocation);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const db = await getDb();
      const repo = new BibleRepository(db);
      const hits = await repo.search(query.trim(), {
        versionId: primary,
        limit: 100,
      });
      setResults(hits);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text variant="title" style={{ marginBottom: theme.space(2) }}>
        Search
      </Text>
      <Text variant="caption" style={{ marginBottom: theme.space(2) }}>
        Searching in {primary.toUpperCase()}
        {versions.length > 1 ? ' (change via Reader primary)' : ''}
      </Text>
      <Row gap={8} style={{ marginBottom: theme.space(3) }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={run}
          placeholder='e.g. "faith love" or love*'
          placeholderTextColor={theme.color.textMuted}
          style={{
            flex: 1,
            padding: theme.space(2),
            color: theme.color.textPrimary,
            borderWidth: 1,
            borderColor: theme.color.border,
            borderRadius: theme.radius.md,
            backgroundColor: theme.color.surface,
          }}
        />
        <Button label="Go" onPress={run} />
      </Row>

      {loading ? (
        <Text muted>Searching...</Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(r, i) => `${r.book}-${r.chapter}-${r.verse}-${i}`}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: theme.color.border }} />
          )}
          ListEmptyComponent={
            query ? <Text muted>No results.</Text> : <Text muted>Type a query and tap Go.</Text>
          }
          renderItem={({ item }) => (
            <View style={{ paddingVertical: theme.space(2) }}>
              <Row justify="space-between">
                <Text style={{ fontWeight: '600' }}>
                  {canonicalBookName(item.book)} {item.chapter}:{item.verse}
                </Text>
                <Button
                  label="Open"
                  variant="ghost"
                  onPress={() =>
                    setLocation({ book: item.book, chapter: item.chapter })
                  }
                />
              </Row>
              <Text>{item.text}</Text>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

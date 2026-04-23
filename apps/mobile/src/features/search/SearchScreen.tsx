import React, { useCallback, useState } from 'react';
import { FlatList, TextInput, View } from 'react-native';
import { Button, Screen, Text, useTheme } from '../../ui';
import { useData } from '../../app/DataContext';
import { useReaderStore } from '../../app/stores/readerStore';
import type { VerseRow } from '../../domain/bible/types';
import { osisNameFor } from '../../lib/osis';

export function SearchScreen() {
  const theme = useTheme();
  const { bible } = useData();
  const { primaryVersionId } = useReaderStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VerseRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setError(null);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    try {
      const rows = await bible.searchFts(query, { versionId: primaryVersionId, limit: 100 });
      setResults(rows);
    } catch (e) {
      setError((e as Error).message);
      setResults([]);
    }
  }, [bible, primaryVersionId, query]);

  return (
    <Screen>
      <Text variant="headingLg" style={{ marginBottom: theme.spacing.md }}>
        Search
      </Text>
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="FTS5 query…"
          placeholderTextColor={theme.colors.textMuted}
          onSubmitEditing={run}
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: theme.colors.border,
            color: theme.colors.text,
            padding: theme.spacing.sm,
            borderRadius: theme.radius.sm,
          }}
        />
        <Button label="Search" onPress={run} />
      </View>
      {error && (
        <Text style={{ color: theme.colors.danger, marginBottom: theme.spacing.sm }}>{error}</Text>
      )}
      <FlatList
        data={results}
        keyExtractor={(r) => `${r.versionId}-${r.book}-${r.chapter}-${r.verse}`}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: theme.colors.border }} />
        )}
        ListEmptyComponent={() => <Text variant="muted">No results.</Text>}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: theme.spacing.sm }}>
            <Text variant="heading">
              {osisNameFor(item.book)} {item.chapter}:{item.verse}
            </Text>
            <Text>{item.text}</Text>
          </View>
        )}
      />
    </Screen>
  );
}

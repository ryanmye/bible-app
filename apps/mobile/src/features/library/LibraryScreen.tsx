import React, { useEffect } from 'react';
import { Alert, FlatList, View } from 'react-native';

import { Button, Row, Screen, Text, useTheme } from '../../ui';
import { useLibraryStore } from '../../app/stores/libraryStore';
import { IMPORTERS } from '../../data/importers';

export function LibraryScreen() {
  const theme = useTheme();
  const { versions, loading, reload } = useLibraryStore();

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <Screen>
      <Row justify="space-between" style={{ marginBottom: theme.space(3) }}>
        <Text variant="title">Library</Text>
        <Row gap={8}>
          <Button
            label="Reload"
            variant="secondary"
            onPress={() => reload()}
          />
          <Button
            label="Import..."
            onPress={() =>
              Alert.alert(
                'Import',
                `Supported: ${IMPORTERS.map((i) => i.displayName).join(', ')}\n\n` +
                  'Hook this up to a file picker next. The USFM parser is ready; EPUB is stubbed.',
              )
            }
          />
        </Row>
      </Row>

      {loading ? (
        <Text muted>Loading...</Text>
      ) : versions.length === 0 ? (
        <View>
          <Text muted>
            No Bible versions installed yet. Build the seed with{' '}
            <Text variant="mono">npm run seed:build</Text> and add{' '}
            <Text variant="mono">seed.sqlite</Text> to Xcode's "Copy Bundle
            Resources" for the macOS target.
          </Text>
        </View>
      ) : (
        <FlatList
          data={versions}
          keyExtractor={(v) => v.id}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: theme.color.border }} />
          )}
          renderItem={({ item }) => (
            <View style={{ paddingVertical: theme.space(2) }}>
              <Row justify="space-between">
                <Text style={{ fontWeight: '600' }}>{item.name}</Text>
                <Text variant="caption">{item.abbreviation}</Text>
              </Row>
              <Text variant="caption">
                {item.language.toUpperCase()} · {item.source}
                {item.copyright ? ` · ${item.copyright}` : ''}
              </Text>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

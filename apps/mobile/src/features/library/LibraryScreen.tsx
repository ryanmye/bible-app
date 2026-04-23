import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, View } from 'react-native';
import { Button, Screen, Text, useTheme } from '../../ui';
import { useData } from '../../app/DataContext';
import type { Version } from '../../domain/bible/types';

export function LibraryScreen() {
  const theme = useTheme();
  const { bible } = useData();
  const [versions, setVersions] = useState<Version[]>([]);

  const refresh = useCallback(() => {
    bible.listVersions().then(setVersions);
  }, [bible]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const importUsfm = () => {
    Alert.alert(
      'Import USFM',
      'USFM file picking is not wired up yet in this skeleton. The parser in src/data/importers/usfm is ready; hook it into a file picker to finish.',
    );
  };

  const importEpub = () => {
    Alert.alert(
      'Import EPUB',
      'EPUB import is stubbed out — see src/data/importers/epub/parseEpub.ts for the plan.',
    );
  };

  return (
    <Screen>
      <Text variant="headingLg" style={{ marginBottom: theme.spacing.md }}>
        Library
      </Text>
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
        <Button label="Import USFM…" variant="secondary" onPress={importUsfm} />
        <Button label="Import EPUB…" variant="secondary" onPress={importEpub} />
      </View>
      <FlatList
        data={versions}
        keyExtractor={(v) => v.id}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: theme.colors.border }} />
        )}
        ListEmptyComponent={() => (
          <Text variant="muted">No versions installed. Run `npm run seed:build` to bundle KJV/ASV/WEB.</Text>
        )}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: theme.spacing.sm }}>
            <Text variant="heading">{item.name}</Text>
            <Text variant="muted">
              {item.abbreviation} · {item.language} · {item.source}
              {item.copyright ? ` · ${item.copyright}` : ''}
            </Text>
          </View>
        )}
      />
    </Screen>
  );
}

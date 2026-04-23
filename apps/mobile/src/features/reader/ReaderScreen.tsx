import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';
import { Screen, Text, useTheme } from '../../ui';
import { useData } from '../../app/DataContext';
import { useReaderStore } from '../../app/stores/readerStore';
import type { VerseRow, Version } from '../../domain/bible/types';
import { osisNameFor } from '../../lib/osis';
import { VersionPicker } from './VersionPicker';
import { VerseLine } from './VerseLine';

export function ReaderScreen() {
  const theme = useTheme();
  const { bible } = useData();
  const { book, chapter, primaryVersionId, parallelVersionIds, parallelMode } = useReaderStore();
  const setPrimaryVersion = useReaderStore((s) => s.setPrimaryVersion);
  const setParallelMode = useReaderStore((s) => s.setParallelMode);
  const goTo = useReaderStore((s) => s.goTo);

  const [versions, setVersions] = useState<Version[]>([]);
  const [primaryVerses, setPrimaryVerses] = useState<VerseRow[]>([]);
  const [parallelVerses, setParallelVerses] = useState<Record<string, VerseRow[]>>({});

  useEffect(() => {
    bible.listVersions().then(setVersions);
  }, [bible]);

  const load = useCallback(async () => {
    const p = await bible.getChapter(primaryVersionId, book, chapter);
    setPrimaryVerses(p);
    if (parallelMode && parallelVersionIds.length) {
      const entries = await Promise.all(
        parallelVersionIds.map(async (vid) => [vid, await bible.getChapter(vid, book, chapter)] as const),
      );
      setParallelVerses(Object.fromEntries(entries));
    } else {
      setParallelVerses({});
    }
  }, [bible, primaryVersionId, parallelVersionIds, parallelMode, book, chapter]);

  useEffect(() => {
    load();
  }, [load]);

  const header = (
    <View style={{ gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
      <Text variant="headingLg">
        {osisNameFor(book)} {chapter}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
        <VersionPicker
          versions={versions}
          selected={primaryVersionId}
          onSelect={setPrimaryVersion}
        />
        <Pressable
          onPress={() => setParallelMode(!parallelMode)}
          style={{
            paddingVertical: theme.spacing.xs,
            paddingHorizontal: theme.spacing.sm,
            borderRadius: theme.radius.sm,
            backgroundColor: parallelMode ? theme.colors.accent : theme.colors.bgElevated,
          }}
        >
          <Text
            style={{
              color: parallelMode ? theme.colors.accentContrast : theme.colors.text,
              fontWeight: '600',
            }}
          >
            Parallel
          </Text>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
          <Pressable onPress={() => goTo(book, Math.max(1, chapter - 1))}>
            <Text>Prev</Text>
          </Pressable>
          <Pressable onPress={() => goTo(book, chapter + 1)}>
            <Text>Next</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  if (parallelMode) {
    const columns = [primaryVersionId, ...parallelVersionIds];
    return (
      <Screen>
        {header}
        <ScrollView horizontal>
          <View style={{ flexDirection: 'row', gap: theme.spacing.lg }}>
            {columns.map((vid) => {
              const rows = vid === primaryVersionId ? primaryVerses : parallelVerses[vid] ?? [];
              const label = versions.find((v) => v.id === vid)?.abbreviation ?? vid;
              return (
                <View key={vid} style={{ width: 320 }}>
                  <Text variant="heading" style={{ marginBottom: theme.spacing.sm }}>
                    {label}
                  </Text>
                  <FlatList
                    data={rows}
                    keyExtractor={(r) => `${vid}-${r.chapter}-${r.verse}`}
                    renderItem={({ item }) => <VerseLine verse={item} />}
                  />
                </View>
              );
            })}
          </View>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      {header}
      <FlatList
        data={primaryVerses}
        keyExtractor={(r) => `${r.chapter}-${r.verse}`}
        renderItem={({ item }) => <VerseLine verse={item} />}
      />
    </Screen>
  );
}

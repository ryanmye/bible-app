import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Row, Screen, Text, useTheme } from '../../ui';
import { useReaderStore } from '../../app/stores/readerStore';
import { useLibraryStore } from '../../app/stores/libraryStore';
import { BibleRepository } from '../../data/repositories/BibleRepository';
import { HighlightsRepository } from '../../data/repositories/HighlightsRepository';
import { getDb } from '../../data/db';
import type { VerseRow, VersionId } from '../../domain/bible/types';
import type { Highlight } from '../../domain/highlights/types';
import {
  CANONICAL_BOOKS,
  canonicalBookName,
} from '../../domain/bible/canon';

export function ReaderScreen() {
  const theme = useTheme();
  const {
    location,
    primaryVersion,
    parallelVersions,
    parallelEnabled,
    setPrimaryVersion,
    setParallelEnabled,
    addParallel,
    removeParallel,
    setLocation,
  } = useReaderStore();
  const versions = useLibraryStore((s) => s.versions);

  const [chapters, setChapters] = useState<Record<VersionId, VerseRow[]>>({});
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(false);

  const activeVersions = useMemo(() => {
    return parallelEnabled
      ? [primaryVersion, ...parallelVersions]
      : [primaryVersion];
  }, [primaryVersion, parallelVersions, parallelEnabled]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const db = await getDb();
      const bibleRepo = new BibleRepository(db);
      const highlightRepo = new HighlightsRepository(db);
      const loaded: Record<VersionId, VerseRow[]> = {};
      for (const v of activeVersions) {
        loaded[v] = await bibleRepo.getChapter(v, location.book, location.chapter);
      }
      const chapterHighlights = await highlightRepo.listForChapter(
        location.book,
        location.chapter,
      );
      if (!cancelled) {
        setChapters(loaded);
        setHighlights(chapterHighlights);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeVersions, location.book, location.chapter]);

  if (versions.length === 0) {
    return (
      <Screen>
        <Text variant="title">No versions installed</Text>
        <Text muted>
          Run{' '}
          <Text variant="mono">npm run seed:build</Text> and add{' '}
          <Text variant="mono">seed.sqlite</Text> to the Xcode project (Copy
          Bundle Resources), then relaunch.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Row justify="space-between" wrap style={{ marginBottom: theme.space(2) }}>
        <Text variant="title">
          {canonicalBookName(location.book)} {location.chapter}
        </Text>
        <Row gap={8}>
          <Button
            label={parallelEnabled ? 'Parallel: On' : 'Parallel: Off'}
            variant="secondary"
            onPress={() => setParallelEnabled(!parallelEnabled)}
          />
        </Row>
      </Row>

      <Row gap={6} wrap style={{ marginBottom: theme.space(3) }}>
        <Text variant="caption">Primary:</Text>
        {versions.map((v) => (
          <Button
            key={v.id}
            label={v.abbreviation}
            variant={v.id === primaryVersion ? 'primary' : 'secondary'}
            onPress={() => setPrimaryVersion(v.id)}
          />
        ))}
      </Row>

      {parallelEnabled && (
        <Row gap={6} wrap style={{ marginBottom: theme.space(3) }}>
          <Text variant="caption">Compare:</Text>
          {versions
            .filter((v) => v.id !== primaryVersion)
            .map((v) => {
              const active = parallelVersions.includes(v.id);
              return (
                <Button
                  key={v.id}
                  label={`${active ? '✓ ' : ''}${v.abbreviation}`}
                  variant={active ? 'primary' : 'secondary'}
                  onPress={() =>
                    active ? removeParallel(v.id) : addParallel(v.id)
                  }
                />
              );
            })}
        </Row>
      )}

      <BookChapterPicker />

      {loading ? (
        <ActivityIndicator style={{ marginTop: theme.space(4) }} />
      ) : (
        <ScrollView
          horizontal={activeVersions.length > 1}
          contentContainerStyle={{ paddingVertical: theme.space(2) }}
        >
          <Row align="flex-start" gap={16}>
            {activeVersions.map((versionId) => (
              <VerseColumn
                key={versionId}
                versionId={versionId}
                verses={chapters[versionId] ?? []}
                highlights={highlights}
                isOnly={activeVersions.length === 1}
              />
            ))}
          </Row>
        </ScrollView>
      )}

      <Row gap={8} style={{ marginTop: theme.space(3) }}>
        <Button
          label="Prev chapter"
          variant="secondary"
          onPress={() =>
            setLocation({
              book: location.book,
              chapter: Math.max(1, location.chapter - 1),
            })
          }
        />
        <Button
          label="Next chapter"
          variant="secondary"
          onPress={() =>
            setLocation({ book: location.book, chapter: location.chapter + 1 })
          }
        />
      </Row>
    </Screen>
  );
}

function VerseColumn({
  versionId,
  verses,
  highlights,
  isOnly,
}: {
  versionId: VersionId;
  verses: VerseRow[];
  highlights: Highlight[];
  isOnly: boolean;
}) {
  const theme = useTheme();
  const highlightByVerse = useMemo(() => {
    const map = new Map<number, Highlight>();
    for (const h of highlights) {
      for (let v = h.verseStart; v <= h.verseEnd; v += 1) map.set(v, h);
    }
    return map;
  }, [highlights]);

  return (
    <View style={{ width: isOnly ? '100%' : 320 }}>
      <Text variant="caption" style={{ marginBottom: theme.space(1) }}>
        {versionId.toUpperCase()}
      </Text>
      {verses.length === 0 ? (
        <Text muted>No verses loaded.</Text>
      ) : (
        <View>
          {verses.map((verse) => {
            const hl = highlightByVerse.get(verse.verse);
            return (
              <Text
                key={`${verse.verse}`}
                variant="reader"
                style={[
                  styles.verse,
                  hl
                    ? { backgroundColor: theme.highlight[hl.color] }
                    : undefined,
                ]}
              >
                <Text variant="verseNumber">{verse.verse} </Text>
                {verse.text}{' '}
              </Text>
            );
          })}
        </View>
      )}
    </View>
  );
}

function BookChapterPicker() {
  const theme = useTheme();
  const { location, setLocation } = useReaderStore();
  return (
    <ScrollView
      horizontal
      contentContainerStyle={{ gap: 6, paddingBottom: theme.space(2) }}
      showsHorizontalScrollIndicator={false}
    >
      {CANONICAL_BOOKS.map((book) => (
        <Button
          key={book.osisId}
          label={book.name}
          variant={book.osisId === location.book ? 'primary' : 'secondary'}
          onPress={() => setLocation({ book: book.osisId, chapter: 1 })}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  verse: {
    marginBottom: 4,
  },
});

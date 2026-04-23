import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Screen, Text, useTheme } from '../../ui';
import { useData } from '../../app/DataContext';
import type { Highlight } from '../../domain/highlights/types';
import { DEFAULT_HIGHLIGHT_PALETTE } from '../../domain/highlights/types';
import { osisNameFor } from '../../lib/osis';

export function HighlightsScreen() {
  const theme = useTheme();
  const { highlights } = useData();
  const [list, setList] = useState<Highlight[]>([]);

  const refresh = useCallback(() => {
    highlights.list().then(setList);
  }, [highlights]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const colorFor = (c: string): string =>
    (
      {
        yellow: theme.colors.highlightYellow,
        green: theme.colors.highlightGreen,
        blue: theme.colors.highlightBlue,
        pink: theme.colors.highlightPink,
        orange: theme.colors.highlightOrange,
        purple: theme.colors.highlightPurple,
      } as Record<string, string>
    )[c] ?? theme.colors.highlightYellow;

  return (
    <Screen>
      <Text variant="headingLg" style={{ marginBottom: theme.spacing.sm }}>
        Highlights
      </Text>
      <Text variant="muted" style={{ marginBottom: theme.spacing.md }}>
        Long-press a verse in the Reader to highlight. Palette:
        {' '}
        {DEFAULT_HIGHLIGHT_PALETTE.join(', ')}
      </Text>
      <FlatList
        data={list}
        keyExtractor={(h) => h.id}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: theme.colors.border }} />
        )}
        ListEmptyComponent={() => <Text variant="muted">No highlights yet.</Text>}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: theme.spacing.sm,
              gap: theme.spacing.md,
            }}
          >
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: colorFor(item.color),
                borderColor: theme.colors.border,
                borderWidth: 1,
              }}
            />
            <Text>
              {osisNameFor(item.book)} {item.chapter}:{item.verseStart}
              {item.verseEnd !== item.verseStart ? `-${item.verseEnd}` : ''}
            </Text>
          </View>
        )}
      />
    </Screen>
  );
}

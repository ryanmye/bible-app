import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text, useTheme } from '../../ui';
import type { VerseRow } from '../../domain/bible/types';
import { useData } from '../../app/DataContext';
import type { Highlight } from '../../domain/highlights/types';
import { DEFAULT_HIGHLIGHT_PALETTE } from '../../domain/highlights/types';

type Props = {
  verse: VerseRow;
};

export function VerseLine({ verse }: Props) {
  const theme = useTheme();
  const { highlights } = useData();
  const [chapterHighlights, setChapterHighlights] = useState<Highlight[]>([]);
  const [showPalette, setShowPalette] = useState(false);

  useEffect(() => {
    highlights.listForChapter(verse.book, verse.chapter).then(setChapterHighlights);
  }, [highlights, verse.book, verse.chapter]);

  const highlight = chapterHighlights.find(
    (h) => verse.verse >= h.verseStart && verse.verse <= h.verseEnd,
  );

  const bg = highlight
    ? ({
        yellow: theme.colors.highlightYellow,
        green: theme.colors.highlightGreen,
        blue: theme.colors.highlightBlue,
        pink: theme.colors.highlightPink,
        orange: theme.colors.highlightOrange,
        purple: theme.colors.highlightPurple,
      } as Record<string, string>)[highlight.color] ?? theme.colors.highlightYellow
    : 'transparent';

  const applyHighlight = useCallback(
    async (color: string) => {
      if (highlight) {
        await highlights.delete(highlight.id);
      }
      await highlights.create({
        book: verse.book,
        chapter: verse.chapter,
        verseStart: verse.verse,
        verseEnd: verse.verse,
        color,
      });
      setShowPalette(false);
      const next = await highlights.listForChapter(verse.book, verse.chapter);
      setChapterHighlights(next);
    },
    [highlight, highlights, verse.book, verse.chapter, verse.verse],
  );

  return (
    <View style={{ marginBottom: theme.spacing.xs }}>
      <Pressable onLongPress={() => setShowPalette((s) => !s)}>
        <Text style={{ backgroundColor: bg, lineHeight: 24 }}>
          <Text variant="verseNumber">{verse.verse} </Text>
          {verse.text}
        </Text>
      </Pressable>
      {showPalette && (
        <View
          style={{
            flexDirection: 'row',
            gap: theme.spacing.xs,
            marginTop: theme.spacing.xs,
          }}
        >
          {DEFAULT_HIGHLIGHT_PALETTE.map((c) => (
            <Pressable
              key={c}
              onPress={() => applyHighlight(c)}
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: (
                  {
                    yellow: theme.colors.highlightYellow,
                    green: theme.colors.highlightGreen,
                    blue: theme.colors.highlightBlue,
                    pink: theme.colors.highlightPink,
                    orange: theme.colors.highlightOrange,
                    purple: theme.colors.highlightPurple,
                  } as Record<string, string>
                )[c],
              }}
            />
          ))}
          {highlight && (
            <Pressable
              onPress={async () => {
                await highlights.delete(highlight.id);
                const next = await highlights.listForChapter(verse.book, verse.chapter);
                setChapterHighlights(next);
                setShowPalette(false);
              }}
            >
              <Text style={{ color: theme.colors.danger }}>Remove</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

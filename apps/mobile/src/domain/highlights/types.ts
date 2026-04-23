import type { BookOsisId } from '../bible/types';

export type HighlightColor =
  | 'yellow'
  | 'green'
  | 'blue'
  | 'pink'
  | 'orange'
  | 'purple';

export const HIGHLIGHT_COLORS: readonly HighlightColor[] = Object.freeze([
  'yellow',
  'green',
  'blue',
  'pink',
  'orange',
  'purple',
]);

export interface Highlight {
  id: string;
  book: BookOsisId;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  color: HighlightColor;
  createdAt: number;
  updatedAt: number;
  remoteId: string | null;
  dirty: boolean;
}

export type HighlightInput = Omit<
  Highlight,
  'id' | 'createdAt' | 'updatedAt' | 'remoteId' | 'dirty'
>;

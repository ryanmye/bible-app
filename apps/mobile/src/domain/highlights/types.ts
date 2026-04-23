import type { OsisBookId } from '../bible/types';

export type HighlightColor =
  | 'yellow'
  | 'green'
  | 'blue'
  | 'pink'
  | 'orange'
  | 'purple'
  | string;

export type Highlight = {
  id: string;
  book: OsisBookId;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  color: HighlightColor;
  createdAt: number;
  updatedAt: number;
  remoteId: string | null;
  dirty: boolean;
};

export type NewHighlight = Omit<Highlight, 'id' | 'createdAt' | 'updatedAt' | 'remoteId' | 'dirty'> & {
  id?: string;
};

export const DEFAULT_HIGHLIGHT_PALETTE: HighlightColor[] = [
  'yellow',
  'green',
  'blue',
  'pink',
  'orange',
  'purple',
];

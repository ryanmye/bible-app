import type { BookOsisId, VersionId } from '../bible/types';

export interface Note {
  id: string;
  anchorVersion: VersionId | null;
  book: BookOsisId;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  body: string;
  createdAt: number;
  updatedAt: number;
  remoteId: string | null;
  dirty: boolean;
}

export type NoteInput = Omit<
  Note,
  'id' | 'createdAt' | 'updatedAt' | 'remoteId' | 'dirty'
>;

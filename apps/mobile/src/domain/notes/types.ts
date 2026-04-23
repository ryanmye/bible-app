import type { OsisBookId } from '../bible/types';

export type Note = {
  id: string;
  anchorVersion: string | null;
  book: OsisBookId;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  body: string;
  createdAt: number;
  updatedAt: number;
  remoteId: string | null;
  dirty: boolean;
};

export type NewNote = Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'remoteId' | 'dirty'> & {
  id?: string;
};

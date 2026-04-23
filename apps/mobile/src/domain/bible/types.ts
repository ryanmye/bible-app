export type OsisBookId = string;

export type Reference = {
  book: OsisBookId;
  chapter: number;
  verse?: number;
};

export type VerseRange = {
  book: OsisBookId;
  chapter: number;
  verseStart: number;
  verseEnd: number;
};

export type VerseRow = {
  versionId: string;
  book: OsisBookId;
  chapter: number;
  verse: number;
  text: string;
};

export type Book = {
  versionId: string;
  osisId: OsisBookId;
  name: string;
  ordinal: number;
};

export type VersionSource = 'bundled' | 'usfm' | 'epub';

export type Version = {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
  source: VersionSource;
  copyright: string | null;
  installedAt: number;
};

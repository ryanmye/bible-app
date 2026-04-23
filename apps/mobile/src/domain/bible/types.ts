/**
 * Pure domain models for the Bible reading feature.
 *
 * This file MUST NOT import any React Native or Node/RN-only APIs so that it
 * can be reused from a future web app, mobile app, or headless script.
 */

export type VersionId = string;

export type VersionSource = 'bundled' | 'usfm' | 'epub' | 'remote';

export interface Version {
  id: VersionId;
  name: string;
  abbreviation: string;
  language: string;
  source: VersionSource;
  copyright?: string;
  installedAt: number;
}

export type BookOsisId = string;

export interface Book {
  versionId: VersionId;
  osisId: BookOsisId;
  name: string;
  ordinal: number;
}

export interface VerseRow {
  versionId: VersionId;
  book: BookOsisId;
  chapter: number;
  verse: number;
  text: string;
}

export interface Reference {
  book: BookOsisId;
  chapter: number;
  verse?: number;
  verseEnd?: number;
}

export interface ChapterKey {
  versionId: VersionId;
  book: BookOsisId;
  chapter: number;
}

export function referenceLabel(ref: Reference, bookName?: string): string {
  const name = bookName ?? ref.book;
  if (ref.verse == null) return `${name} ${ref.chapter}`;
  if (ref.verseEnd && ref.verseEnd !== ref.verse) {
    return `${name} ${ref.chapter}:${ref.verse}-${ref.verseEnd}`;
  }
  return `${name} ${ref.chapter}:${ref.verse}`;
}

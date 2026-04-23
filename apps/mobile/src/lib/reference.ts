import type { Reference } from '../domain/bible/types';
import {
  CANONICAL_BOOKS,
  canonicalBookName,
} from '../domain/bible/canon';

const BOOK_LOOKUP = new Map<string, string>();
for (const book of CANONICAL_BOOKS) {
  BOOK_LOOKUP.set(book.name.toLowerCase(), book.osisId);
  BOOK_LOOKUP.set(book.osisId.toLowerCase(), book.osisId);
}

/**
 * Parses strings like "John 3:16", "Gen 1", "1 John 4:7-9".
 * Returns null if the string can't be resolved to a canonical book.
 */
export function parseReference(input: string): Reference | null {
  const match = input
    .trim()
    .match(/^(\d?\s?\w+(?:\s\w+)?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
  if (!match) return null;
  const [, bookRaw, chapter, verse, verseEnd] = match;
  const osis = BOOK_LOOKUP.get(bookRaw.trim().toLowerCase());
  if (!osis) return null;
  return {
    book: osis,
    chapter: Number(chapter),
    verse: verse ? Number(verse) : undefined,
    verseEnd: verseEnd ? Number(verseEnd) : undefined,
  };
}

export function formatReference(ref: Reference): string {
  const name = canonicalBookName(ref.book);
  if (ref.verse == null) return `${name} ${ref.chapter}`;
  if (ref.verseEnd && ref.verseEnd !== ref.verse) {
    return `${name} ${ref.chapter}:${ref.verse}-${ref.verseEnd}`;
  }
  return `${name} ${ref.chapter}:${ref.verse}`;
}

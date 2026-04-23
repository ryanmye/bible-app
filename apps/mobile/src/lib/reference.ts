import type { Reference } from '../domain/bible/types';
import { OSIS_BOOKS } from './osis';

/**
 * Parses loose references like "Gen 1", "Gen 1:5", "John 3:16".
 * This is intentionally minimal; we can grow it later.
 */
export function parseReference(raw: string): Reference | null {
  const m = raw
    .trim()
    .match(/^([1-3]?\s?[A-Za-z]+)\s+(\d+)(?:[:\.](\d+))?$/);
  if (!m) return null;
  const rawBook = m[1].replace(/\s+/g, '');
  const book = OSIS_BOOKS.find(
    (b) =>
      b.osis.toLowerCase() === rawBook.toLowerCase() ||
      b.name.replace(/\s+/g, '').toLowerCase() === rawBook.toLowerCase(),
  );
  if (!book) return null;
  return {
    book: book.osis,
    chapter: parseInt(m[2], 10),
    verse: m[3] ? parseInt(m[3], 10) : undefined,
  };
}

export function formatReference(ref: Reference, bookName?: string): string {
  const name = bookName ?? ref.book;
  return ref.verse ? `${name} ${ref.chapter}:${ref.verse}` : `${name} ${ref.chapter}`;
}

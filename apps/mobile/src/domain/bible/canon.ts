import type { BookOsisId } from './types';

/**
 * Canonical 66-book Protestant ordering with OSIS ids. Used as the default
 * book ordering when importing versions that don't supply their own order.
 */
export interface CanonicalBook {
  osisId: BookOsisId;
  name: string;
  ordinal: number;
  testament: 'OT' | 'NT';
}

export const CANONICAL_BOOKS: readonly CanonicalBook[] = Object.freeze([
  { osisId: 'Gen', name: 'Genesis', ordinal: 1, testament: 'OT' },
  { osisId: 'Exod', name: 'Exodus', ordinal: 2, testament: 'OT' },
  { osisId: 'Lev', name: 'Leviticus', ordinal: 3, testament: 'OT' },
  { osisId: 'Num', name: 'Numbers', ordinal: 4, testament: 'OT' },
  { osisId: 'Deut', name: 'Deuteronomy', ordinal: 5, testament: 'OT' },
  { osisId: 'Josh', name: 'Joshua', ordinal: 6, testament: 'OT' },
  { osisId: 'Judg', name: 'Judges', ordinal: 7, testament: 'OT' },
  { osisId: 'Ruth', name: 'Ruth', ordinal: 8, testament: 'OT' },
  { osisId: '1Sam', name: '1 Samuel', ordinal: 9, testament: 'OT' },
  { osisId: '2Sam', name: '2 Samuel', ordinal: 10, testament: 'OT' },
  { osisId: '1Kgs', name: '1 Kings', ordinal: 11, testament: 'OT' },
  { osisId: '2Kgs', name: '2 Kings', ordinal: 12, testament: 'OT' },
  { osisId: '1Chr', name: '1 Chronicles', ordinal: 13, testament: 'OT' },
  { osisId: '2Chr', name: '2 Chronicles', ordinal: 14, testament: 'OT' },
  { osisId: 'Ezra', name: 'Ezra', ordinal: 15, testament: 'OT' },
  { osisId: 'Neh', name: 'Nehemiah', ordinal: 16, testament: 'OT' },
  { osisId: 'Esth', name: 'Esther', ordinal: 17, testament: 'OT' },
  { osisId: 'Job', name: 'Job', ordinal: 18, testament: 'OT' },
  { osisId: 'Ps', name: 'Psalms', ordinal: 19, testament: 'OT' },
  { osisId: 'Prov', name: 'Proverbs', ordinal: 20, testament: 'OT' },
  { osisId: 'Eccl', name: 'Ecclesiastes', ordinal: 21, testament: 'OT' },
  { osisId: 'Song', name: 'Song of Solomon', ordinal: 22, testament: 'OT' },
  { osisId: 'Isa', name: 'Isaiah', ordinal: 23, testament: 'OT' },
  { osisId: 'Jer', name: 'Jeremiah', ordinal: 24, testament: 'OT' },
  { osisId: 'Lam', name: 'Lamentations', ordinal: 25, testament: 'OT' },
  { osisId: 'Ezek', name: 'Ezekiel', ordinal: 26, testament: 'OT' },
  { osisId: 'Dan', name: 'Daniel', ordinal: 27, testament: 'OT' },
  { osisId: 'Hos', name: 'Hosea', ordinal: 28, testament: 'OT' },
  { osisId: 'Joel', name: 'Joel', ordinal: 29, testament: 'OT' },
  { osisId: 'Amos', name: 'Amos', ordinal: 30, testament: 'OT' },
  { osisId: 'Obad', name: 'Obadiah', ordinal: 31, testament: 'OT' },
  { osisId: 'Jonah', name: 'Jonah', ordinal: 32, testament: 'OT' },
  { osisId: 'Mic', name: 'Micah', ordinal: 33, testament: 'OT' },
  { osisId: 'Nah', name: 'Nahum', ordinal: 34, testament: 'OT' },
  { osisId: 'Hab', name: 'Habakkuk', ordinal: 35, testament: 'OT' },
  { osisId: 'Zeph', name: 'Zephaniah', ordinal: 36, testament: 'OT' },
  { osisId: 'Hag', name: 'Haggai', ordinal: 37, testament: 'OT' },
  { osisId: 'Zech', name: 'Zechariah', ordinal: 38, testament: 'OT' },
  { osisId: 'Mal', name: 'Malachi', ordinal: 39, testament: 'OT' },
  { osisId: 'Matt', name: 'Matthew', ordinal: 40, testament: 'NT' },
  { osisId: 'Mark', name: 'Mark', ordinal: 41, testament: 'NT' },
  { osisId: 'Luke', name: 'Luke', ordinal: 42, testament: 'NT' },
  { osisId: 'John', name: 'John', ordinal: 43, testament: 'NT' },
  { osisId: 'Acts', name: 'Acts', ordinal: 44, testament: 'NT' },
  { osisId: 'Rom', name: 'Romans', ordinal: 45, testament: 'NT' },
  { osisId: '1Cor', name: '1 Corinthians', ordinal: 46, testament: 'NT' },
  { osisId: '2Cor', name: '2 Corinthians', ordinal: 47, testament: 'NT' },
  { osisId: 'Gal', name: 'Galatians', ordinal: 48, testament: 'NT' },
  { osisId: 'Eph', name: 'Ephesians', ordinal: 49, testament: 'NT' },
  { osisId: 'Phil', name: 'Philippians', ordinal: 50, testament: 'NT' },
  { osisId: 'Col', name: 'Colossians', ordinal: 51, testament: 'NT' },
  { osisId: '1Thess', name: '1 Thessalonians', ordinal: 52, testament: 'NT' },
  { osisId: '2Thess', name: '2 Thessalonians', ordinal: 53, testament: 'NT' },
  { osisId: '1Tim', name: '1 Timothy', ordinal: 54, testament: 'NT' },
  { osisId: '2Tim', name: '2 Timothy', ordinal: 55, testament: 'NT' },
  { osisId: 'Titus', name: 'Titus', ordinal: 56, testament: 'NT' },
  { osisId: 'Phlm', name: 'Philemon', ordinal: 57, testament: 'NT' },
  { osisId: 'Heb', name: 'Hebrews', ordinal: 58, testament: 'NT' },
  { osisId: 'Jas', name: 'James', ordinal: 59, testament: 'NT' },
  { osisId: '1Pet', name: '1 Peter', ordinal: 60, testament: 'NT' },
  { osisId: '2Pet', name: '2 Peter', ordinal: 61, testament: 'NT' },
  { osisId: '1John', name: '1 John', ordinal: 62, testament: 'NT' },
  { osisId: '2John', name: '2 John', ordinal: 63, testament: 'NT' },
  { osisId: '3John', name: '3 John', ordinal: 64, testament: 'NT' },
  { osisId: 'Jude', name: 'Jude', ordinal: 65, testament: 'NT' },
  { osisId: 'Rev', name: 'Revelation', ordinal: 66, testament: 'NT' },
]);

export const CANONICAL_BY_OSIS: Readonly<Record<BookOsisId, CanonicalBook>> =
  Object.freeze(
    Object.fromEntries(CANONICAL_BOOKS.map((b) => [b.osisId, b])),
  );

export function canonicalBookName(osisId: BookOsisId): string {
  return CANONICAL_BY_OSIS[osisId]?.name ?? osisId;
}

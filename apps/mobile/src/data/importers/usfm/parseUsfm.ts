import type { Book, VerseRow, Version } from '../../../domain/bible/types';
import type { ImportResult, Importer } from '../types';

/**
 * Minimal USFM parser: handles the happy path for a single-book file.
 * Recognized markers:
 *   \id <BOOK> ...        - book code (OSIS-ish), e.g. "GEN Genesis"
 *   \h <name>             - canonical book name
 *   \toc2 <name>          - short title (used when \h absent)
 *   \c <n>                - chapter number
 *   \v <n> <text>         - verse
 *
 * Anything else is ignored. Non-goal: preserving formatting marks
 * (\wj, \p, \q, etc.) - we strip them from verse text.
 */

const STRIP_INLINE_MARKERS = /\\[a-z0-9]+\*?/gi;

function stripMarkers(s: string): string {
  return s.replace(STRIP_INLINE_MARKERS, '').replace(/\s+/g, ' ').trim();
}

export type ParseUsfmInput = {
  text: string;
  versionId: string;
  /** fallback language tag if none detected */
  language?: string;
  versionName?: string;
  versionAbbreviation?: string;
};

export function parseUsfm(input: ParseUsfmInput): ImportResult {
  const lines = input.text.split(/\r?\n/);
  const warnings: string[] = [];

  let bookOsis: string | null = null;
  let bookName: string | null = null;
  let chapter = 0;
  const verses: VerseRow[] = [];
  let pending: VerseRow | null = null;

  const flush = () => {
    if (pending) {
      pending.text = stripMarkers(pending.text);
      verses.push(pending);
      pending = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const id = line.match(/^\\id\s+(\S+)(?:\s+(.*))?$/);
    if (id) {
      flush();
      bookOsis = id[1].toUpperCase();
      if (id[2] && !bookName) bookName = id[2];
      continue;
    }
    const h = line.match(/^\\h\s+(.*)$/);
    if (h) {
      bookName = h[1];
      continue;
    }
    const toc = line.match(/^\\toc2\s+(.*)$/);
    if (toc && !bookName) {
      bookName = toc[1];
      continue;
    }
    const c = line.match(/^\\c\s+(\d+)/);
    if (c) {
      flush();
      chapter = parseInt(c[1], 10);
      continue;
    }
    const v = line.match(/^\\v\s+(\d+)\s*(.*)$/);
    if (v) {
      flush();
      if (!bookOsis) {
        warnings.push('Verse encountered before \\id — skipping');
        continue;
      }
      if (chapter === 0) {
        warnings.push('Verse encountered before \\c — skipping');
        continue;
      }
      pending = {
        versionId: input.versionId,
        book: bookOsis,
        chapter,
        verse: parseInt(v[1], 10),
        text: v[2] ?? '',
      };
      continue;
    }
    if (pending) {
      pending.text += ` ${line}`;
    }
  }
  flush();

  if (!bookOsis) throw new Error('USFM: no \\id line found');

  const book: Book = {
    versionId: input.versionId,
    osisId: bookOsis,
    name: bookName ?? bookOsis,
    ordinal: 0,
  };
  const version: Version = {
    id: input.versionId,
    name: input.versionName ?? input.versionId,
    abbreviation: input.versionAbbreviation ?? input.versionId.toUpperCase(),
    language: input.language ?? 'en',
    source: 'usfm',
    copyright: null,
    installedAt: Date.now(),
  };

  return { version, books: [book], verses, warnings };
}

export const usfmImporter: Importer = {
  id: 'usfm',
  accepts: ['.usfm', '.sfm'],
  async parse({ text, versionId, filename }) {
    const id = versionId ?? (filename ? `u_${filename.replace(/\.[^.]+$/, '')}` : 'u_imported');
    return parseUsfm({ text, versionId: id });
  },
};

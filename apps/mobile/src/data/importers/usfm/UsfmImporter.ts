import RNFS from 'react-native-fs';

import type {
  BibleImporter,
  ImportOptions,
  ImportResult,
} from '../types';
import type { Book, Version, VerseRow } from '../../../domain/bible/types';
import { CANONICAL_BY_OSIS } from '../../../domain/bible/canon';
import { parseUsfm } from './parseUsfm';

/**
 * Imports a single USFM file as a new Version.
 *
 * Multi-file collections (one USFM per book) can be handled by iterating this
 * importer per file and merging the ImportResults; the merging helper lives
 * in `mergeResults.ts` next to this file when needed.
 */
export class UsfmImporter implements BibleImporter {
  readonly id = 'usfm';
  readonly displayName = 'USFM';
  readonly supportedExtensions = ['.usfm', '.sfm', '.txt'] as const;

  async importFromFile(
    filePath: string,
    opts: ImportOptions,
  ): Promise<ImportResult> {
    const contents = await RNFS.readFile(filePath, 'utf8');
    return this.importFromString(contents, opts);
  }

  async importFromBuffer(
    buffer: Uint8Array,
    opts: ImportOptions,
  ): Promise<ImportResult> {
    const g = globalThis as {
      TextDecoder?: new (label?: string) => { decode(buf: Uint8Array): string };
    };
    if (!g.TextDecoder) {
      throw new Error('TextDecoder is unavailable in this runtime');
    }
    const text = new g.TextDecoder('utf-8').decode(buffer);
    return this.importFromString(text, opts);
  }

  async importFromString(
    source: string,
    opts: ImportOptions,
  ): Promise<ImportResult> {
    const parsed = parseUsfm(source);
    const versionId =
      opts.versionId ?? `u_${Math.random().toString(36).slice(2, 10)}`;
    const now = Date.now();

    const version: Version = {
      id: versionId,
      name: opts.displayName ?? parsed.titleHint ?? 'Imported (USFM)',
      abbreviation: opts.abbreviation ?? 'USFM',
      language: opts.language ?? 'en',
      source: 'usfm',
      installedAt: now,
    };

    const osisIds = new Set(parsed.verses.map((v) => v.book));
    const books: Book[] = [];
    for (const osis of osisIds) {
      const canonical = CANONICAL_BY_OSIS[osis];
      books.push({
        versionId,
        osisId: osis,
        name: canonical?.name ?? osis,
        ordinal: canonical?.ordinal ?? 999,
      });
    }
    books.sort((a, b) => a.ordinal - b.ordinal);

    const verses: VerseRow[] = parsed.verses.map((v) => ({
      versionId,
      book: v.book,
      chapter: v.chapter,
      verse: v.verse,
      text: v.text,
    }));

    return {
      version,
      books,
      verses,
      warnings: parsed.warnings,
    };
  }
}

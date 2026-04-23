import type { VerseRow, Book, Version } from '../../domain/bible/types';

/**
 * Common output shape every importer returns. Pure data; the caller writes
 * it to the repositories inside a transaction.
 */
export interface ImportResult {
  version: Version;
  books: Book[];
  verses: VerseRow[];
  warnings: string[];
}

/**
 * An importer takes raw bytes (or a file path for RN's FS-backed cases)
 * and returns normalized domain objects.
 */
export interface BibleImporter {
  readonly id: string;
  readonly displayName: string;
  readonly supportedExtensions: readonly string[];
  importFromFile(filePath: string, opts: ImportOptions): Promise<ImportResult>;
  importFromBuffer?(
    buffer: Uint8Array,
    opts: ImportOptions,
  ): Promise<ImportResult>;
}

export interface ImportOptions {
  /** Desired version id; if omitted, importers should derive one. */
  versionId?: string;
  abbreviation?: string;
  displayName?: string;
  language?: string;
}

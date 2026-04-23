import type { Book, VerseRow, Version } from '../../domain/bible/types';

export type ImportResult = {
  version: Version;
  books: Book[];
  verses: VerseRow[];
  warnings: string[];
};

export interface Importer {
  readonly id: string;
  readonly accepts: readonly string[];
  parse(input: { text: string; versionId?: string; filename?: string }): Promise<ImportResult>;
}

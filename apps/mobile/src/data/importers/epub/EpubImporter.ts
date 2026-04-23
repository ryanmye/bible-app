import type {
  BibleImporter,
  ImportOptions,
  ImportResult,
} from '../types';

/**
 * EPUB importer stub.
 *
 * EPUB parsing is substantial work: unzip, walk OPF/NCX for the spine, parse
 * each XHTML chapter, and map headings/markup back to canonical book +
 * chapter + verse tuples. That is scoped for a later milestone.
 *
 * For the foundation we expose the same BibleImporter contract and throw a
 * clear error so the UI can surface "Import EPUB (coming soon)" without
 * having to special-case anything.
 */
export class EpubImporter implements BibleImporter {
  readonly id = 'epub';
  readonly displayName = 'EPUB';
  readonly supportedExtensions = ['.epub'] as const;

  async importFromFile(
    _filePath: string,
    _opts: ImportOptions,
  ): Promise<ImportResult> {
    throw new EpubImportNotYetImplementedError();
  }

  async importFromBuffer(
    _buffer: Uint8Array,
    _opts: ImportOptions,
  ): Promise<ImportResult> {
    throw new EpubImportNotYetImplementedError();
  }
}

export class EpubImportNotYetImplementedError extends Error {
  constructor() {
    super(
      'EPUB import is not implemented yet. Use USFM for now, or wait for the ' +
        'next milestone which adds EPUB -> verse mapping.',
    );
    this.name = 'EpubImportNotYetImplementedError';
  }
}

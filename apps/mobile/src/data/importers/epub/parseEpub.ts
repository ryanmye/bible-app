import type { ImportResult, Importer } from '../types';

/**
 * EPUB importer — stub.
 *
 * Implementing a robust EPUB -> verses parser is non-trivial: we need to
 *   1. Unzip the container
 *   2. Read the OPF to find the spine order
 *   3. Walk each chapter XHTML, recognize structural markup for books /
 *      chapters / verses (which is publisher-specific)
 *   4. Normalize to OSIS book ids
 *
 * We ship this as a typed stub so the UI can already wire up the "Import EPUB"
 * button and show a graceful "coming soon" message. Flesh out the steps above
 * when we have representative EPUB samples to target.
 */
export const epubImporter: Importer = {
  id: 'epub',
  accepts: ['.epub'],
  async parse(): Promise<ImportResult> {
    throw new Error(
      'EPUB import is not yet implemented. Use USFM for now, or convert your source to USFM first.',
    );
  },
};

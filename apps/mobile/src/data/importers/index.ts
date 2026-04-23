import { UsfmImporter } from './usfm/UsfmImporter';
import { EpubImporter } from './epub/EpubImporter';
import type { BibleImporter } from './types';

export * from './types';
export * from './usfm';
export * from './epub';

export const IMPORTERS: readonly BibleImporter[] = Object.freeze([
  new UsfmImporter(),
  new EpubImporter(),
]);

export function importerForExtension(
  ext: string,
): BibleImporter | undefined {
  const normalized = ext.toLowerCase().startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`;
  return IMPORTERS.find((imp) =>
    (imp.supportedExtensions as readonly string[]).includes(normalized),
  );
}

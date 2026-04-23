import type { VerseRow } from '../../../domain/bible/types';

export interface ParsedUsfmBook {
  osisHint: string | null;
  rawBookId: string | null;
  titleHint: string | null;
  verses: Omit<VerseRow, 'versionId'>[];
  warnings: string[];
}

/**
 * Minimal USFM parser covering the markers needed for reading text.
 *
 * Handles:
 *   \id <BOOK>           - book id (we use this as the rawBookId)
 *   \h <title>           - running header (used as title hint)
 *   \c <n>               - chapter number
 *   \v <n> <text>        - verse number + text (text runs until next \v or \c)
 *
 * Markers that affect formatting (\p, \q, \m, \s, etc.) are stripped so the
 * resulting text is plain. Markup preservation can be added later by
 * extending this parser rather than replacing it.
 */
export function parseUsfm(source: string): ParsedUsfmBook {
  const warnings: string[] = [];
  const lines = source.split(/\r?\n/);

  let osisHint: string | null = null;
  let rawBookId: string | null = null;
  let titleHint: string | null = null;

  let currentChapter: number | null = null;
  let currentVerse: number | null = null;
  let currentText: string[] = [];

  const verses: ParsedUsfmBook['verses'] = [];

  const flushVerse = () => {
    if (currentChapter != null && currentVerse != null) {
      const text = currentText.join(' ').replace(/\s+/g, ' ').trim();
      if (text.length > 0) {
        verses.push({
          book: osisHint ?? rawBookId ?? 'UNK',
          chapter: currentChapter,
          verse: currentVerse,
          text,
        });
      }
    }
    currentText = [];
    currentVerse = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const idMatch = line.match(/^\\id\s+(\S+)(?:\s+(.*))?$/);
    if (idMatch) {
      rawBookId = idMatch[1];
      osisHint = USFM_TO_OSIS[rawBookId] ?? null;
      if (!osisHint) {
        warnings.push(`Unknown USFM book id: ${rawBookId}`);
      }
      continue;
    }

    const hMatch = line.match(/^\\h\s+(.*)$/);
    if (hMatch) {
      titleHint = hMatch[1].trim();
      continue;
    }

    const chapterMatch = line.match(/^\\c\s+(\d+)/);
    if (chapterMatch) {
      flushVerse();
      currentChapter = Number(chapterMatch[1]);
      continue;
    }

    const verseMatch = line.match(/^\\v\s+(\d+)(?:\s+(.*))?$/);
    if (verseMatch) {
      flushVerse();
      currentVerse = Number(verseMatch[1]);
      if (verseMatch[2]) currentText.push(stripMarkers(verseMatch[2]));
      continue;
    }

    if (line.startsWith('\\')) {
      // Strip other markers but keep any trailing text content.
      const stripped = stripMarkers(line);
      if (stripped && currentVerse != null) currentText.push(stripped);
      continue;
    }

    if (currentVerse != null) {
      currentText.push(stripMarkers(line));
    }
  }
  flushVerse();

  return { osisHint, rawBookId, titleHint, verses, warnings };
}

function stripMarkers(s: string): string {
  return s
    .replace(/\\[+*]?[a-zA-Z0-9]+\*?/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** USFM 3-letter book codes -> OSIS ids for the 66-book canon. */
const USFM_TO_OSIS: Record<string, string> = {
  GEN: 'Gen', EXO: 'Exod', LEV: 'Lev', NUM: 'Num', DEU: 'Deut',
  JOS: 'Josh', JDG: 'Judg', RUT: 'Ruth', '1SA': '1Sam', '2SA': '2Sam',
  '1KI': '1Kgs', '2KI': '2Kgs', '1CH': '1Chr', '2CH': '2Chr',
  EZR: 'Ezra', NEH: 'Neh', EST: 'Esth', JOB: 'Job', PSA: 'Ps',
  PRO: 'Prov', ECC: 'Eccl', SNG: 'Song', ISA: 'Isa', JER: 'Jer',
  LAM: 'Lam', EZK: 'Ezek', DAN: 'Dan', HOS: 'Hos', JOL: 'Joel',
  AMO: 'Amos', OBA: 'Obad', JON: 'Jonah', MIC: 'Mic', NAM: 'Nah',
  HAB: 'Hab', ZEP: 'Zeph', HAG: 'Hag', ZEC: 'Zech', MAL: 'Mal',
  MAT: 'Matt', MRK: 'Mark', LUK: 'Luke', JHN: 'John', ACT: 'Acts',
  ROM: 'Rom', '1CO': '1Cor', '2CO': '2Cor', GAL: 'Gal', EPH: 'Eph',
  PHP: 'Phil', COL: 'Col', '1TH': '1Thess', '2TH': '2Thess',
  '1TI': '1Tim', '2TI': '2Tim', TIT: 'Titus', PHM: 'Phlm',
  HEB: 'Heb', JAS: 'Jas', '1PE': '1Pet', '2PE': '2Pet',
  '1JN': '1John', '2JN': '2John', '3JN': '3John', JUD: 'Jude',
  REV: 'Rev',
};

export { USFM_TO_OSIS };

import type { DbClient } from '../db/DbClient';
import type {
  Book,
  BookOsisId,
  VerseRow,
  Version,
  VersionId,
} from '../../domain/bible/types';

interface VersionRow {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
  source: string;
  copyright: string | null;
  installed_at: number;
}

interface BookRow {
  version_id: string;
  osis_id: string;
  name: string;
  ordinal: number;
}

interface VerseRawRow {
  version_id: string;
  book_osis: string;
  chapter: number;
  verse: number;
  text: string;
}

interface SearchHitRow extends VerseRawRow {
  rank: number;
}

export interface SearchHit extends VerseRow {
  rank: number;
}

/**
 * Read/write access for canonical Bible text: versions, books, verses, search.
 *
 * Writes are used by the seed installer and user importers; the reader UI
 * only needs the read methods.
 */
export class BibleRepository {
  constructor(private readonly db: DbClient) {}

  async listVersions(): Promise<Version[]> {
    const rows = await this.db.execute<VersionRow>(
      'SELECT * FROM versions ORDER BY installed_at ASC',
    );
    return rows.map(mapVersion);
  }

  async getVersion(id: VersionId): Promise<Version | null> {
    const rows = await this.db.execute<VersionRow>(
      'SELECT * FROM versions WHERE id = ? LIMIT 1',
      [id],
    );
    return rows[0] ? mapVersion(rows[0]) : null;
  }

  async upsertVersion(version: Version): Promise<void> {
    await this.db.execute(
      `INSERT INTO versions (id, name, abbreviation, language, source, copyright, installed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name=excluded.name,
         abbreviation=excluded.abbreviation,
         language=excluded.language,
         source=excluded.source,
         copyright=excluded.copyright`,
      [
        version.id,
        version.name,
        version.abbreviation,
        version.language,
        version.source,
        version.copyright ?? null,
        version.installedAt,
      ],
    );
  }

  async deleteVersion(id: VersionId): Promise<void> {
    await this.db.executeBatch([
      {
        sql: 'DELETE FROM verses_fts WHERE version_id = ?',
        params: [id],
      },
      { sql: 'DELETE FROM verses WHERE version_id = ?', params: [id] },
      { sql: 'DELETE FROM books WHERE version_id = ?', params: [id] },
      { sql: 'DELETE FROM versions WHERE id = ?', params: [id] },
    ]);
  }

  async listBooks(versionId: VersionId): Promise<Book[]> {
    const rows = await this.db.execute<BookRow>(
      'SELECT * FROM books WHERE version_id = ? ORDER BY ordinal ASC',
      [versionId],
    );
    return rows.map(mapBook);
  }

  async insertBooks(books: Book[]): Promise<void> {
    if (books.length === 0) return;
    await this.db.executeBatch(
      books.map((b) => ({
        sql: `INSERT OR REPLACE INTO books (version_id, osis_id, name, ordinal)
              VALUES (?, ?, ?, ?)`,
        params: [b.versionId, b.osisId, b.name, b.ordinal],
      })),
    );
  }

  async getChapter(
    versionId: VersionId,
    book: BookOsisId,
    chapter: number,
  ): Promise<VerseRow[]> {
    const rows = await this.db.execute<VerseRawRow>(
      `SELECT * FROM verses
       WHERE version_id = ? AND book_osis = ? AND chapter = ?
       ORDER BY verse ASC`,
      [versionId, book, chapter],
    );
    return rows.map(mapVerse);
  }

  async getChapterCount(
    versionId: VersionId,
    book: BookOsisId,
  ): Promise<number> {
    const rows = await this.db.execute<{ max: number | null }>(
      `SELECT MAX(chapter) as max FROM verses
       WHERE version_id = ? AND book_osis = ?`,
      [versionId, book],
    );
    return rows[0]?.max ?? 0;
  }

  async getVerseRange(
    versionId: VersionId,
    book: BookOsisId,
    chapter: number,
    verseStart: number,
    verseEnd: number,
  ): Promise<VerseRow[]> {
    const rows = await this.db.execute<VerseRawRow>(
      `SELECT * FROM verses
       WHERE version_id = ? AND book_osis = ? AND chapter = ?
         AND verse BETWEEN ? AND ?
       ORDER BY verse ASC`,
      [versionId, book, chapter, verseStart, verseEnd],
    );
    return rows.map(mapVerse);
  }

  async bulkInsertVerses(verses: VerseRow[]): Promise<void> {
    if (verses.length === 0) return;
    const chunks = chunk(verses, 500);
    for (const group of chunks) {
      await this.db.executeBatch(
        group.flatMap((v) => [
          {
            sql: `INSERT OR REPLACE INTO verses
                  (version_id, book_osis, chapter, verse, text)
                  VALUES (?, ?, ?, ?, ?)`,
            params: [v.versionId, v.book, v.chapter, v.verse, v.text],
          },
          {
            sql: `INSERT INTO verses_fts
                  (text, version_id, book_osis, chapter, verse)
                  VALUES (?, ?, ?, ?, ?)`,
            params: [v.text, v.versionId, v.book, v.chapter, v.verse],
          },
        ]),
      );
    }
  }

  async search(
    query: string,
    opts: { versionId?: VersionId; limit?: number } = {},
  ): Promise<SearchHit[]> {
    const limit = opts.limit ?? 50;
    const params: (string | number)[] = [query];
    let sql = `SELECT version_id, book_osis, chapter, verse, text, rank
               FROM verses_fts
               WHERE verses_fts MATCH ?`;
    if (opts.versionId) {
      sql += ' AND version_id = ?';
      params.push(opts.versionId);
    }
    sql += ' ORDER BY rank LIMIT ?';
    params.push(limit);
    const rows = await this.db.execute<SearchHitRow>(sql, params);
    return rows.map((row) => ({
      ...mapVerse(row),
      rank: row.rank,
    }));
  }
}

function mapVersion(row: VersionRow): Version {
  return {
    id: row.id,
    name: row.name,
    abbreviation: row.abbreviation,
    language: row.language,
    source: row.source as Version['source'],
    copyright: row.copyright ?? undefined,
    installedAt: row.installed_at,
  };
}

function mapBook(row: BookRow): Book {
  return {
    versionId: row.version_id,
    osisId: row.osis_id,
    name: row.name,
    ordinal: row.ordinal,
  };
}

function mapVerse(row: VerseRawRow): VerseRow {
  return {
    versionId: row.version_id,
    book: row.book_osis,
    chapter: row.chapter,
    verse: row.verse,
    text: row.text,
  };
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

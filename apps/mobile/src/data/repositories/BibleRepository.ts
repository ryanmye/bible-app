import type { Book, OsisBookId, Version, VerseRow } from '../../domain/bible/types';
import type { DbClient } from '../db/types';

type VersionDbRow = {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
  source: 'bundled' | 'usfm' | 'epub';
  copyright: string | null;
  installed_at: number;
};

type BookDbRow = {
  version_id: string;
  osis_id: string;
  name: string;
  ordinal: number;
};

type VerseDbRow = {
  version_id: string;
  book_osis: string;
  chapter: number;
  verse: number;
  text: string;
};

function toVersion(row: VersionDbRow): Version {
  return {
    id: row.id,
    name: row.name,
    abbreviation: row.abbreviation,
    language: row.language,
    source: row.source,
    copyright: row.copyright ?? null,
    installedAt: row.installed_at,
  };
}

function toBook(row: BookDbRow): Book {
  return {
    versionId: row.version_id,
    osisId: row.osis_id,
    name: row.name,
    ordinal: row.ordinal,
  };
}

function toVerse(row: VerseDbRow): VerseRow {
  return {
    versionId: row.version_id,
    book: row.book_osis,
    chapter: row.chapter,
    verse: row.verse,
    text: row.text,
  };
}

export class BibleRepository {
  constructor(private readonly db: DbClient) {}

  async listVersions(): Promise<Version[]> {
    const rows = await this.db.execute<VersionDbRow>(
      `SELECT id, name, abbreviation, language, source, copyright, installed_at
         FROM versions ORDER BY installed_at ASC;`,
    );
    return rows.map(toVersion);
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
         copyright=excluded.copyright,
         installed_at=excluded.installed_at;`,
      [
        version.id,
        version.name,
        version.abbreviation,
        version.language,
        version.source,
        version.copyright,
        version.installedAt,
      ],
    );
  }

  async listBooks(versionId: string): Promise<Book[]> {
    const rows = await this.db.execute<BookDbRow>(
      `SELECT version_id, osis_id, name, ordinal FROM books
         WHERE version_id = ? ORDER BY ordinal ASC;`,
      [versionId],
    );
    return rows.map(toBook);
  }

  async insertBooks(books: Book[]): Promise<void> {
    if (books.length === 0) return;
    await this.db.transaction(async (tx) => {
      for (const b of books) {
        await tx.execute(
          `INSERT OR REPLACE INTO books (version_id, osis_id, name, ordinal) VALUES (?, ?, ?, ?);`,
          [b.versionId, b.osisId, b.name, b.ordinal],
        );
      }
    });
  }

  async getChapter(versionId: string, book: OsisBookId, chapter: number): Promise<VerseRow[]> {
    const rows = await this.db.execute<VerseDbRow>(
      `SELECT version_id, book_osis, chapter, verse, text FROM verses
         WHERE version_id = ? AND book_osis = ? AND chapter = ?
         ORDER BY verse ASC;`,
      [versionId, book, chapter],
    );
    return rows.map(toVerse);
  }

  async getChapterCount(versionId: string, book: OsisBookId): Promise<number> {
    const rows = await this.db.execute<{ max_chapter: number | null }>(
      `SELECT MAX(chapter) AS max_chapter FROM verses WHERE version_id = ? AND book_osis = ?;`,
      [versionId, book],
    );
    return rows[0]?.max_chapter ?? 0;
  }

  async getVerse(
    versionId: string,
    book: OsisBookId,
    chapter: number,
    verse: number,
  ): Promise<VerseRow | null> {
    const rows = await this.db.execute<VerseDbRow>(
      `SELECT version_id, book_osis, chapter, verse, text FROM verses
         WHERE version_id = ? AND book_osis = ? AND chapter = ? AND verse = ?;`,
      [versionId, book, chapter, verse],
    );
    return rows[0] ? toVerse(rows[0]) : null;
  }

  async getRange(
    versionId: string,
    book: OsisBookId,
    chapter: number,
    verseStart: number,
    verseEnd: number,
  ): Promise<VerseRow[]> {
    const rows = await this.db.execute<VerseDbRow>(
      `SELECT version_id, book_osis, chapter, verse, text FROM verses
         WHERE version_id = ? AND book_osis = ? AND chapter = ?
           AND verse BETWEEN ? AND ?
         ORDER BY verse ASC;`,
      [versionId, book, chapter, verseStart, verseEnd],
    );
    return rows.map(toVerse);
  }

  async insertVerses(verses: VerseRow[]): Promise<void> {
    if (verses.length === 0) return;
    await this.db.transaction(async (tx) => {
      for (const v of verses) {
        await tx.execute(
          `INSERT OR REPLACE INTO verses (version_id, book_osis, chapter, verse, text)
             VALUES (?, ?, ?, ?, ?);`,
          [v.versionId, v.book, v.chapter, v.verse, v.text],
        );
      }
    });
  }

  async rebuildFtsIndex(): Promise<void> {
    await this.db.execute(`INSERT INTO verses_fts(verses_fts) VALUES ('rebuild');`);
  }

  async searchFts(
    query: string,
    options: { versionId?: string; limit?: number } = {},
  ): Promise<VerseRow[]> {
    const limit = options.limit ?? 50;
    const params: (string | number)[] = [query];
    let sql = `SELECT v.version_id, v.book_osis, v.chapter, v.verse, v.text
                 FROM verses_fts f JOIN verses v ON v.rowid = f.rowid
                 WHERE verses_fts MATCH ?`;
    if (options.versionId) {
      sql += ` AND v.version_id = ?`;
      params.push(options.versionId);
    }
    sql += ` LIMIT ?;`;
    params.push(limit);
    const rows = await this.db.execute<VerseDbRow>(sql, params);
    return rows.map(toVerse);
  }
}

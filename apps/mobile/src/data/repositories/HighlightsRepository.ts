import { v4 as uuidv4 } from 'uuid';
import type { Highlight, NewHighlight } from '../../domain/highlights/types';
import type { OsisBookId } from '../../domain/bible/types';
import type { DbClient } from '../db/types';

type HighlightDbRow = {
  id: string;
  book_osis: string;
  chapter: number;
  verse_start: number;
  verse_end: number;
  color: string;
  created_at: number;
  updated_at: number;
  remote_id: string | null;
  dirty: number;
};

function toHighlight(row: HighlightDbRow): Highlight {
  return {
    id: row.id,
    book: row.book_osis,
    chapter: row.chapter,
    verseStart: row.verse_start,
    verseEnd: row.verse_end,
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    remoteId: row.remote_id,
    dirty: row.dirty === 1,
  };
}

export class HighlightsRepository {
  constructor(private readonly db: DbClient) {}

  async create(input: NewHighlight): Promise<Highlight> {
    const now = Date.now();
    const h: Highlight = {
      id: input.id ?? uuidv4(),
      book: input.book,
      chapter: input.chapter,
      verseStart: input.verseStart,
      verseEnd: input.verseEnd,
      color: input.color,
      createdAt: now,
      updatedAt: now,
      remoteId: null,
      dirty: true,
    };
    await this.db.execute(
      `INSERT INTO highlights (id, book_osis, chapter, verse_start, verse_end, color, created_at, updated_at, remote_id, dirty)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, 1);`,
      [h.id, h.book, h.chapter, h.verseStart, h.verseEnd, h.color, h.createdAt, h.updatedAt],
    );
    return h;
  }

  async delete(id: string): Promise<void> {
    await this.db.execute(`DELETE FROM highlights WHERE id = ?;`, [id]);
  }

  async setColor(id: string, color: string): Promise<void> {
    await this.db.execute(
      `UPDATE highlights SET color = ?, updated_at = ?, dirty = 1 WHERE id = ?;`,
      [color, Date.now(), id],
    );
  }

  async list(): Promise<Highlight[]> {
    const rows = await this.db.execute<HighlightDbRow>(
      `SELECT * FROM highlights ORDER BY updated_at DESC;`,
    );
    return rows.map(toHighlight);
  }

  async listForChapter(book: OsisBookId, chapter: number): Promise<Highlight[]> {
    const rows = await this.db.execute<HighlightDbRow>(
      `SELECT * FROM highlights WHERE book_osis = ? AND chapter = ? ORDER BY verse_start ASC;`,
      [book, chapter],
    );
    return rows.map(toHighlight);
  }

  async listDirty(): Promise<Highlight[]> {
    const rows = await this.db.execute<HighlightDbRow>(
      `SELECT * FROM highlights WHERE dirty = 1 ORDER BY updated_at ASC;`,
    );
    return rows.map(toHighlight);
  }

  async markClean(id: string, remoteId: string): Promise<void> {
    await this.db.execute(
      `UPDATE highlights SET dirty = 0, remote_id = ? WHERE id = ?;`,
      [remoteId, id],
    );
  }
}

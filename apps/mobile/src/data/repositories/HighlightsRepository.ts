import type { DbClient } from '../db/DbClient';
import type { BookOsisId } from '../../domain/bible/types';
import type {
  Highlight,
  HighlightColor,
  HighlightInput,
} from '../../domain/highlights/types';

interface HighlightRow {
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
}

export interface HighlightsQuery {
  book?: BookOsisId;
  chapter?: number;
  color?: HighlightColor;
}

export class HighlightsRepository {
  constructor(
    private readonly db: DbClient,
    private readonly now: () => number = Date.now,
    private readonly genId: () => string = cryptoId,
  ) {}

  async list(query: HighlightsQuery = {}): Promise<Highlight[]> {
    const clauses: string[] = [];
    const params: (string | number)[] = [];
    if (query.book) {
      clauses.push('book_osis = ?');
      params.push(query.book);
    }
    if (query.chapter != null) {
      clauses.push('chapter = ?');
      params.push(query.chapter);
    }
    if (query.color) {
      clauses.push('color = ?');
      params.push(query.color);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const rows = await this.db.execute<HighlightRow>(
      `SELECT * FROM highlights ${where} ORDER BY updated_at DESC`,
      params,
    );
    return rows.map(mapHighlight);
  }

  async listForChapter(
    book: BookOsisId,
    chapter: number,
  ): Promise<Highlight[]> {
    return this.list({ book, chapter });
  }

  async upsert(input: HighlightInput): Promise<Highlight> {
    const existing = await this.db.execute<HighlightRow>(
      `SELECT * FROM highlights
       WHERE book_osis = ? AND chapter = ?
         AND verse_start = ? AND verse_end = ?
       LIMIT 1`,
      [input.book, input.chapter, input.verseStart, input.verseEnd],
    );
    const now = this.now();
    if (existing[0]) {
      await this.db.execute(
        `UPDATE highlights SET color = ?, updated_at = ?, dirty = 1 WHERE id = ?`,
        [input.color, now, existing[0].id],
      );
      return { ...mapHighlight(existing[0]), color: input.color, updatedAt: now, dirty: true };
    }
    const highlight: Highlight = {
      id: this.genId(),
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
      `INSERT INTO highlights
         (id, book_osis, chapter, verse_start, verse_end, color,
          created_at, updated_at, remote_id, dirty)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, 1)`,
      [
        highlight.id,
        highlight.book,
        highlight.chapter,
        highlight.verseStart,
        highlight.verseEnd,
        highlight.color,
        highlight.createdAt,
        highlight.updatedAt,
      ],
    );
    return highlight;
  }

  async delete(id: string): Promise<void> {
    await this.db.execute('DELETE FROM highlights WHERE id = ?', [id]);
  }

  async listDirty(): Promise<Highlight[]> {
    const rows = await this.db.execute<HighlightRow>(
      'SELECT * FROM highlights WHERE dirty = 1',
    );
    return rows.map(mapHighlight);
  }

  async markClean(id: string, remoteId: string): Promise<void> {
    await this.db.execute(
      'UPDATE highlights SET dirty = 0, remote_id = ? WHERE id = ?',
      [remoteId, id],
    );
  }
}

function mapHighlight(row: HighlightRow): Highlight {
  return {
    id: row.id,
    book: row.book_osis,
    chapter: row.chapter,
    verseStart: row.verse_start,
    verseEnd: row.verse_end,
    color: row.color as HighlightColor,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    remoteId: row.remote_id,
    dirty: row.dirty === 1,
  };
}

function cryptoId(): string {
  const g = globalThis as { crypto?: { randomUUID?: () => string } };
  if (g.crypto?.randomUUID) return g.crypto.randomUUID();
  return `h_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

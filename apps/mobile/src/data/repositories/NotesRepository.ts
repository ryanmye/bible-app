import type { DbClient } from '../db/DbClient';
import type {
  BookOsisId,
  VersionId,
} from '../../domain/bible/types';
import type { Note, NoteInput } from '../../domain/notes/types';

interface NoteRow {
  id: string;
  anchor_version: string | null;
  book_osis: string;
  chapter: number;
  verse_start: number;
  verse_end: number;
  body: string;
  created_at: number;
  updated_at: number;
  remote_id: string | null;
  dirty: number;
}

export interface NotesQuery {
  book?: BookOsisId;
  chapter?: number;
  anchorVersion?: VersionId | null;
}

export class NotesRepository {
  constructor(
    private readonly db: DbClient,
    private readonly now: () => number = Date.now,
    private readonly genId: () => string = cryptoId,
  ) {}

  async list(query: NotesQuery = {}): Promise<Note[]> {
    const clauses: string[] = [];
    const params: (string | number | null)[] = [];
    if (query.book) {
      clauses.push('book_osis = ?');
      params.push(query.book);
    }
    if (query.chapter != null) {
      clauses.push('chapter = ?');
      params.push(query.chapter);
    }
    if (query.anchorVersion !== undefined) {
      if (query.anchorVersion === null) {
        clauses.push('anchor_version IS NULL');
      } else {
        clauses.push('anchor_version = ?');
        params.push(query.anchorVersion);
      }
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const rows = await this.db.execute<NoteRow>(
      `SELECT * FROM notes ${where} ORDER BY updated_at DESC`,
      params,
    );
    return rows.map(mapNote);
  }

  async get(id: string): Promise<Note | null> {
    const rows = await this.db.execute<NoteRow>(
      'SELECT * FROM notes WHERE id = ? LIMIT 1',
      [id],
    );
    return rows[0] ? mapNote(rows[0]) : null;
  }

  async create(input: NoteInput): Promise<Note> {
    const now = this.now();
    const note: Note = {
      id: this.genId(),
      anchorVersion: input.anchorVersion,
      book: input.book,
      chapter: input.chapter,
      verseStart: input.verseStart,
      verseEnd: input.verseEnd,
      body: input.body,
      createdAt: now,
      updatedAt: now,
      remoteId: null,
      dirty: true,
    };
    await this.db.execute(
      `INSERT INTO notes
         (id, anchor_version, book_osis, chapter, verse_start, verse_end,
          body, created_at, updated_at, remote_id, dirty)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        note.id,
        note.anchorVersion,
        note.book,
        note.chapter,
        note.verseStart,
        note.verseEnd,
        note.body,
        note.createdAt,
        note.updatedAt,
        note.remoteId,
      ],
    );
    return note;
  }

  async update(
    id: string,
    patch: Partial<Pick<Note, 'body' | 'verseStart' | 'verseEnd'>>,
  ): Promise<void> {
    const existing = await this.get(id);
    if (!existing) throw new Error(`Note ${id} not found`);
    const now = this.now();
    await this.db.execute(
      `UPDATE notes SET
         body = ?, verse_start = ?, verse_end = ?,
         updated_at = ?, dirty = 1
       WHERE id = ?`,
      [
        patch.body ?? existing.body,
        patch.verseStart ?? existing.verseStart,
        patch.verseEnd ?? existing.verseEnd,
        now,
        id,
      ],
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.execute('DELETE FROM notes WHERE id = ?', [id]);
  }

  async listDirty(): Promise<Note[]> {
    const rows = await this.db.execute<NoteRow>(
      'SELECT * FROM notes WHERE dirty = 1',
    );
    return rows.map(mapNote);
  }

  async markClean(id: string, remoteId: string): Promise<void> {
    await this.db.execute(
      'UPDATE notes SET dirty = 0, remote_id = ? WHERE id = ?',
      [remoteId, id],
    );
  }
}

function mapNote(row: NoteRow): Note {
  return {
    id: row.id,
    anchorVersion: row.anchor_version,
    book: row.book_osis,
    chapter: row.chapter,
    verseStart: row.verse_start,
    verseEnd: row.verse_end,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    remoteId: row.remote_id,
    dirty: row.dirty === 1,
  };
}

function cryptoId(): string {
  // Delegates to a platform-provided UUID when available; otherwise falls
  // back to a plain random string. Tests inject their own generator.
  const g = globalThis as { crypto?: { randomUUID?: () => string } };
  if (g.crypto?.randomUUID) return g.crypto.randomUUID();
  return `n_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

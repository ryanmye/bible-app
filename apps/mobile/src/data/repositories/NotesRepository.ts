import { v4 as uuidv4 } from 'uuid';
import type { NewNote, Note } from '../../domain/notes/types';
import type { OsisBookId } from '../../domain/bible/types';
import type { DbClient } from '../db/types';

type NoteDbRow = {
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
};

function toNote(row: NoteDbRow): Note {
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

export class NotesRepository {
  constructor(private readonly db: DbClient) {}

  async create(input: NewNote): Promise<Note> {
    const now = Date.now();
    const note: Note = {
      id: input.id ?? uuidv4(),
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
      `INSERT INTO notes (id, anchor_version, book_osis, chapter, verse_start, verse_end, body, created_at, updated_at, remote_id, dirty)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1);`,
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

  async update(id: string, patch: Partial<Pick<Note, 'body' | 'verseStart' | 'verseEnd'>>): Promise<void> {
    const now = Date.now();
    const sets: string[] = [];
    const params: (string | number | null)[] = [];
    if (patch.body !== undefined) {
      sets.push('body = ?');
      params.push(patch.body);
    }
    if (patch.verseStart !== undefined) {
      sets.push('verse_start = ?');
      params.push(patch.verseStart);
    }
    if (patch.verseEnd !== undefined) {
      sets.push('verse_end = ?');
      params.push(patch.verseEnd);
    }
    if (sets.length === 0) return;
    sets.push('updated_at = ?', 'dirty = 1');
    params.push(now);
    params.push(id);
    await this.db.execute(`UPDATE notes SET ${sets.join(', ')} WHERE id = ?;`, params);
  }

  async delete(id: string): Promise<void> {
    await this.db.execute(`DELETE FROM notes WHERE id = ?;`, [id]);
  }

  async getById(id: string): Promise<Note | null> {
    const rows = await this.db.execute<NoteDbRow>(`SELECT * FROM notes WHERE id = ?;`, [id]);
    return rows[0] ? toNote(rows[0]) : null;
  }

  async list(): Promise<Note[]> {
    const rows = await this.db.execute<NoteDbRow>(
      `SELECT * FROM notes ORDER BY updated_at DESC;`,
    );
    return rows.map(toNote);
  }

  async listForChapter(book: OsisBookId, chapter: number): Promise<Note[]> {
    const rows = await this.db.execute<NoteDbRow>(
      `SELECT * FROM notes WHERE book_osis = ? AND chapter = ? ORDER BY verse_start ASC;`,
      [book, chapter],
    );
    return rows.map(toNote);
  }

  async listDirty(): Promise<Note[]> {
    const rows = await this.db.execute<NoteDbRow>(
      `SELECT * FROM notes WHERE dirty = 1 ORDER BY updated_at ASC;`,
    );
    return rows.map(toNote);
  }

  async markClean(id: string, remoteId: string): Promise<void> {
    await this.db.execute(
      `UPDATE notes SET dirty = 0, remote_id = ? WHERE id = ?;`,
      [remoteId, id],
    );
  }
}

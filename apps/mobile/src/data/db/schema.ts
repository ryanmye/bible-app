/**
 * Database schema declared as ordered migration strings.
 *
 * Rules:
 * - Never edit an existing migration; always add a new one.
 * - Every user-data table has `remote_id` and `dirty` columns so the
 *   SyncProvider can reconcile rows without refactoring.
 */
export interface Migration {
  id: number;
  name: string;
  statements: string[];
}

export const MIGRATIONS: readonly Migration[] = Object.freeze([
  {
    id: 1,
    name: 'initial_schema',
    statements: [
      `CREATE TABLE IF NOT EXISTS versions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        abbreviation TEXT NOT NULL,
        language TEXT NOT NULL,
        source TEXT NOT NULL,
        copyright TEXT,
        installed_at INTEGER NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS books (
        version_id TEXT NOT NULL,
        osis_id TEXT NOT NULL,
        name TEXT NOT NULL,
        ordinal INTEGER NOT NULL,
        PRIMARY KEY (version_id, osis_id),
        FOREIGN KEY (version_id) REFERENCES versions(id) ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS idx_books_version_ordinal
        ON books(version_id, ordinal)`,
      `CREATE TABLE IF NOT EXISTS verses (
        version_id TEXT NOT NULL,
        book_osis TEXT NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        text TEXT NOT NULL,
        PRIMARY KEY (version_id, book_osis, chapter, verse),
        FOREIGN KEY (version_id) REFERENCES versions(id) ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS idx_verses_chapter
        ON verses(version_id, book_osis, chapter)`,
      `CREATE VIRTUAL TABLE IF NOT EXISTS verses_fts USING fts5(
        text,
        version_id UNINDEXED,
        book_osis UNINDEXED,
        chapter UNINDEXED,
        verse UNINDEXED,
        tokenize = 'unicode61 remove_diacritics 2'
      )`,
      `CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        anchor_version TEXT,
        book_osis TEXT NOT NULL,
        chapter INTEGER NOT NULL,
        verse_start INTEGER NOT NULL,
        verse_end INTEGER NOT NULL,
        body TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        remote_id TEXT,
        dirty INTEGER NOT NULL DEFAULT 1
      )`,
      `CREATE INDEX IF NOT EXISTS idx_notes_ref
        ON notes(book_osis, chapter, verse_start)`,
      `CREATE INDEX IF NOT EXISTS idx_notes_dirty ON notes(dirty)`,
      `CREATE TABLE IF NOT EXISTS highlights (
        id TEXT PRIMARY KEY,
        book_osis TEXT NOT NULL,
        chapter INTEGER NOT NULL,
        verse_start INTEGER NOT NULL,
        verse_end INTEGER NOT NULL,
        color TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        remote_id TEXT,
        dirty INTEGER NOT NULL DEFAULT 1
      )`,
      `CREATE INDEX IF NOT EXISTS idx_highlights_ref
        ON highlights(book_osis, chapter, verse_start)`,
      `CREATE INDEX IF NOT EXISTS idx_highlights_dirty ON highlights(dirty)`,
      `CREATE TABLE IF NOT EXISTS bookmarks (
        id TEXT PRIMARY KEY,
        label TEXT,
        book_osis TEXT NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        remote_id TEXT,
        dirty INTEGER NOT NULL DEFAULT 1
      )`,
      `CREATE TABLE IF NOT EXISTS app_meta (
        key TEXT PRIMARY KEY,
        value TEXT
      )`,
    ],
  },
]);

export const SCHEMA_VERSION: number =
  MIGRATIONS.reduce((max, m) => Math.max(max, m.id), 0);

export const SCHEMA_V1 = [
  `CREATE TABLE IF NOT EXISTS versions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    abbreviation TEXT NOT NULL,
    language TEXT NOT NULL,
    source TEXT NOT NULL,
    copyright TEXT,
    installed_at INTEGER NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS books (
    version_id TEXT NOT NULL,
    osis_id TEXT NOT NULL,
    name TEXT NOT NULL,
    ordinal INTEGER NOT NULL,
    PRIMARY KEY (version_id, osis_id)
  );`,
  `CREATE TABLE IF NOT EXISTS verses (
    version_id TEXT NOT NULL,
    book_osis TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    text TEXT NOT NULL,
    PRIMARY KEY (version_id, book_osis, chapter, verse)
  );`,
  `CREATE INDEX IF NOT EXISTS idx_verses_chapter ON verses(version_id, book_osis, chapter);`,
  `CREATE VIRTUAL TABLE IF NOT EXISTS verses_fts USING fts5(text, content='verses', content_rowid='rowid');`,
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
  );`,
  `CREATE INDEX IF NOT EXISTS idx_notes_ref ON notes(book_osis, chapter, verse_start, verse_end);`,
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
  );`,
  `CREATE INDEX IF NOT EXISTS idx_highlights_ref ON highlights(book_osis, chapter, verse_start, verse_end);`,
];

export const MIGRATIONS: ReadonlyArray<ReadonlyArray<string>> = [SCHEMA_V1];

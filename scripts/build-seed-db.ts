#!/usr/bin/env tsx
/**
 * Builds the bundled Bible SQLite seed.
 *
 * Fetches three public-domain English versions from scrollmapper/bible_databases
 * (https://github.com/scrollmapper/bible_databases, MIT-licensed aggregation of
 * public-domain translations) and writes them into a single normalized
 * `seed.sqlite` file that matches the app's runtime schema.
 *
 * Usage (from repo root):
 *
 *   npm run seed:build
 *   npm run seed:build -- --versions KJV,ASV
 *
 * The output lives at `apps/mobile/assets/bibles/seed.sqlite` and is NOT
 * committed to git (see .gitignore + .gitattributes). It must be rebuilt
 * locally before the first app launch.
 */

import Database from 'better-sqlite3';
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { MIGRATIONS } from '../apps/mobile/src/data/db/schema';
import {
  CANONICAL_BOOKS,
  type CanonicalBook,
} from '../apps/mobile/src/domain/bible/canon';

interface ScrollmapperVerse {
  verse: number;
  text: string;
}
interface ScrollmapperChapter {
  chapter: number;
  verses: ScrollmapperVerse[];
}
interface ScrollmapperBook {
  name: string;
  chapters: ScrollmapperChapter[];
}
interface ScrollmapperBible {
  translation: string;
  books: ScrollmapperBook[];
}

interface VersionSpec {
  id: string;
  abbreviation: string;
  name: string;
  language: string;
  source: 'bundled';
  copyright: string;
  scrollmapperFile: string;
}

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..');
const SEED_DIR = resolve(ROOT, 'apps/mobile/assets/bibles');
const SEED_PATH = resolve(SEED_DIR, 'seed.sqlite');
const CACHE_DIR = resolve(ROOT, '.cache/bible-sources');

const ALL_VERSIONS: VersionSpec[] = [
  {
    id: 'kjv',
    abbreviation: 'KJV',
    name: 'King James Version',
    language: 'en',
    source: 'bundled',
    copyright: 'Public Domain (1769 Oxford edition)',
    scrollmapperFile: 'KJV.json',
  },
  {
    id: 'asv',
    abbreviation: 'ASV',
    name: 'American Standard Version',
    language: 'en',
    source: 'bundled',
    copyright: 'Public Domain (1901)',
    scrollmapperFile: 'ASV.json',
  },
  {
    id: 'bbe',
    abbreviation: 'BBE',
    name: 'Bible in Basic English',
    language: 'en',
    source: 'bundled',
    copyright: 'Public Domain (1949/1964, expired UK copyright)',
    scrollmapperFile: 'BBE.json',
  },
];

/** Map scrollmapper book names -> OSIS ids from our canonical list. */
const BOOK_NAME_ALIASES: Record<string, string> = {
  'Psalms': 'Ps',
  'Psalm': 'Ps',
  'Song of Songs': 'Song',
  'Song of Solomon': 'Song',
  'Canticles': 'Song',
  'Revelation of John': 'Rev',
  'Revelation': 'Rev',
  'Acts of the Apostles': 'Acts',
  '1 Samuel': '1Sam',
  '2 Samuel': '2Sam',
  '1 Kings': '1Kgs',
  '2 Kings': '2Kgs',
  '1 Chronicles': '1Chr',
  '2 Chronicles': '2Chr',
  '1 Corinthians': '1Cor',
  '2 Corinthians': '2Cor',
  '1 Thessalonians': '1Thess',
  '2 Thessalonians': '2Thess',
  '1 Timothy': '1Tim',
  '2 Timothy': '2Tim',
  '1 Peter': '1Pet',
  '2 Peter': '2Pet',
  '1 John': '1John',
  '2 John': '2John',
  '3 John': '3John',
  'I Samuel': '1Sam',
  'II Samuel': '2Sam',
  'I Kings': '1Kgs',
  'II Kings': '2Kgs',
  'I Chronicles': '1Chr',
  'II Chronicles': '2Chr',
  'I Corinthians': '1Cor',
  'II Corinthians': '2Cor',
  'I Thessalonians': '1Thess',
  'II Thessalonians': '2Thess',
  'I Timothy': '1Tim',
  'II Timothy': '2Tim',
  'I Peter': '1Pet',
  'II Peter': '2Pet',
  'I John': '1John',
  'II John': '2John',
  'III John': '3John',
};

const NAME_TO_CANONICAL = new Map<string, CanonicalBook>();
for (const book of CANONICAL_BOOKS) {
  NAME_TO_CANONICAL.set(book.name.toLowerCase(), book);
  NAME_TO_CANONICAL.set(book.osisId.toLowerCase(), book);
}
for (const [alias, osis] of Object.entries(BOOK_NAME_ALIASES)) {
  const canonical = CANONICAL_BOOKS.find((b) => b.osisId === osis);
  if (canonical) NAME_TO_CANONICAL.set(alias.toLowerCase(), canonical);
}

function resolveCanonical(name: string): CanonicalBook | null {
  return NAME_TO_CANONICAL.get(name.toLowerCase()) ?? null;
}

function parseArgs(): { versions: VersionSpec[] } {
  const args = process.argv.slice(2);
  let versionFilter: string[] | null = null;
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--versions' && args[i + 1]) {
      versionFilter = args[i + 1]
        .split(',')
        .map((s) => s.trim().toLowerCase());
      i += 1;
    }
  }
  const selected = versionFilter
    ? ALL_VERSIONS.filter((v) => versionFilter!.includes(v.id))
    : ALL_VERSIONS;
  if (selected.length === 0) {
    throw new Error(
      `No versions matched filter: ${versionFilter?.join(',') ?? '(none)'}`,
    );
  }
  return { versions: selected };
}

async function fetchVersion(spec: VersionSpec): Promise<ScrollmapperBible> {
  mkdirSync(CACHE_DIR, { recursive: true });
  const cachePath = resolve(CACHE_DIR, spec.scrollmapperFile);
  if (existsSync(cachePath)) {
    return JSON.parse(readFileSync(cachePath, 'utf8')) as ScrollmapperBible;
  }
  const url = `https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/${spec.scrollmapperFile}`;
  console.log(`  fetching ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  writeFileSync(cachePath, text);
  return JSON.parse(text) as ScrollmapperBible;
}

function applyMigrations(db: Database.Database): void {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at INTEGER NOT NULL
  )`);
  const applied = db
    .prepare('SELECT id FROM schema_migrations')
    .all() as { id: number }[];
  const appliedIds = new Set(applied.map((row) => row.id));
  const insertMigration = db.prepare(
    'INSERT INTO schema_migrations(id, name, applied_at) VALUES(?, ?, ?)',
  );
  for (const migration of MIGRATIONS) {
    if (appliedIds.has(migration.id)) continue;
    for (const stmt of migration.statements) {
      db.exec(stmt);
    }
    insertMigration.run(migration.id, migration.name, Date.now());
  }
}

function importVersion(
  db: Database.Database,
  spec: VersionSpec,
  data: ScrollmapperBible,
): { books: number; verses: number; skippedBooks: string[] } {
  const now = Date.now();

  db.prepare(
    `INSERT OR REPLACE INTO versions
     (id, name, abbreviation, language, source, copyright, installed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    spec.id,
    spec.name,
    spec.abbreviation,
    spec.language,
    spec.source,
    spec.copyright,
    now,
  );

  const insertBook = db.prepare(
    `INSERT OR REPLACE INTO books (version_id, osis_id, name, ordinal)
     VALUES (?, ?, ?, ?)`,
  );
  const insertVerse = db.prepare(
    `INSERT OR REPLACE INTO verses (version_id, book_osis, chapter, verse, text)
     VALUES (?, ?, ?, ?, ?)`,
  );
  const insertFts = db.prepare(
    `INSERT INTO verses_fts (text, version_id, book_osis, chapter, verse)
     VALUES (?, ?, ?, ?, ?)`,
  );

  db.prepare('DELETE FROM verses_fts WHERE version_id = ?').run(spec.id);
  db.prepare('DELETE FROM verses WHERE version_id = ?').run(spec.id);
  db.prepare('DELETE FROM books WHERE version_id = ?').run(spec.id);

  let bookCount = 0;
  let verseCount = 0;
  const skippedBooks: string[] = [];

  const txn = db.transaction((bible: ScrollmapperBible) => {
    for (const book of bible.books) {
      const canonical = resolveCanonical(book.name);
      if (!canonical) {
        skippedBooks.push(book.name);
        continue;
      }
      insertBook.run(spec.id, canonical.osisId, canonical.name, canonical.ordinal);
      bookCount += 1;
      for (const chapter of book.chapters) {
        for (const verse of chapter.verses) {
          const text = verse.text.replace(/\s+/g, ' ').trim();
          insertVerse.run(spec.id, canonical.osisId, chapter.chapter, verse.verse, text);
          insertFts.run(text, spec.id, canonical.osisId, chapter.chapter, verse.verse);
          verseCount += 1;
        }
      }
    }
  });
  txn(data);

  return { books: bookCount, verses: verseCount, skippedBooks };
}

async function main() {
  const { versions } = parseArgs();

  mkdirSync(SEED_DIR, { recursive: true });
  if (existsSync(SEED_PATH)) {
    console.log(`Removing existing seed at ${SEED_PATH}`);
    const fs = await import('node:fs/promises');
    await fs.unlink(SEED_PATH);
  }

  console.log(`Building seed at ${SEED_PATH}`);
  const db = new Database(SEED_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  applyMigrations(db);

  for (const spec of versions) {
    console.log(`Importing ${spec.abbreviation} (${spec.name})`);
    const data = await fetchVersion(spec);
    const stats = importVersion(db, spec, data);
    console.log(
      `  -> ${stats.books} books, ${stats.verses} verses` +
        (stats.skippedBooks.length
          ? ` (skipped: ${stats.skippedBooks.join(', ')})`
          : ''),
    );
  }

  db.exec('VACUUM');
  db.close();

  const fs = await import('node:fs/promises');
  const stat = await fs.stat(SEED_PATH);
  console.log(`Done. Seed size: ${(stat.size / 1024 / 1024).toFixed(1)} MB`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

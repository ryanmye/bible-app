#!/usr/bin/env ts-node
/**
 * scripts/build-seed-db.ts
 *
 * One-time dev script. Downloads KJV, ASV, and WEB JSON from
 * scrollmapper/bible_databases (MIT licensed) and normalizes them into
 * apps/mobile/assets/bibles/seed.sqlite matching the schema in
 * apps/mobile/src/data/db/schema.ts.
 *
 * Usage:
 *   npm run seed:build
 *
 * No auth / no tokens needed; files are fetched from raw.githubusercontent.com.
 * Output path: apps/mobile/assets/bibles/seed.sqlite
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import Database from 'better-sqlite3';

type ScrollmapperVerse = { verse: number; text: string };
type ScrollmapperChapter = { chapter: number; verses: ScrollmapperVerse[] };
type ScrollmapperBook = { name: string; chapters: ScrollmapperChapter[] };
type ScrollmapperDoc = { translation: string; books: ScrollmapperBook[] };

type VersionSpec = {
  id: string;
  name: string;
  abbreviation: string;
  language: string;
  copyright: string;
  url: string;
};

const SOURCES: VersionSpec[] = [
  {
    id: 'kjv',
    name: 'King James Version',
    abbreviation: 'KJV',
    language: 'en',
    copyright: 'Public Domain',
    url: 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/KJV.json',
  },
  {
    id: 'asv',
    name: 'American Standard Version',
    abbreviation: 'ASV',
    language: 'en',
    copyright: 'Public Domain',
    url: 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/ASV.json',
  },
  {
    id: 'web',
    name: 'World English Bible',
    abbreviation: 'WEB',
    language: 'en',
    copyright: 'Public Domain',
    // scrollmapper doesn't ship WEB directly; fall back to NHEB (New Heart English Bible),
    // which is also public domain, until we add a dedicated WEB source.
    url: 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/NHEB.json',
  },
];

const OSIS_BY_ORDINAL = [
  'Gen', 'Exod', 'Lev', 'Num', 'Deut', 'Josh', 'Judg', 'Ruth', '1Sam', '2Sam',
  '1Kgs', '2Kgs', '1Chr', '2Chr', 'Ezra', 'Neh', 'Esth', 'Job', 'Ps', 'Prov',
  'Eccl', 'Song', 'Isa', 'Jer', 'Lam', 'Ezek', 'Dan', 'Hos', 'Joel', 'Amos',
  'Obad', 'Jonah', 'Mic', 'Nah', 'Hab', 'Zeph', 'Hag', 'Zech', 'Mal',
  'Matt', 'Mark', 'Luke', 'John', 'Acts', 'Rom', '1Cor', '2Cor', 'Gal', 'Eph',
  'Phil', 'Col', '1Thess', '2Thess', '1Tim', '2Tim', 'Titus', 'Phlm', 'Heb',
  'Jas', '1Pet', '2Pet', '1John', '2John', '3John', 'Jude', 'Rev',
];

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS versions (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, abbreviation TEXT NOT NULL,
    language TEXT NOT NULL, source TEXT NOT NULL, copyright TEXT,
    installed_at INTEGER NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS books (
    version_id TEXT NOT NULL, osis_id TEXT NOT NULL, name TEXT NOT NULL,
    ordinal INTEGER NOT NULL, PRIMARY KEY (version_id, osis_id)
  );`,
  `CREATE TABLE IF NOT EXISTS verses (
    version_id TEXT NOT NULL, book_osis TEXT NOT NULL, chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL, text TEXT NOT NULL,
    PRIMARY KEY (version_id, book_osis, chapter, verse)
  );`,
  `CREATE INDEX IF NOT EXISTS idx_verses_chapter ON verses(version_id, book_osis, chapter);`,
  `CREATE VIRTUAL TABLE IF NOT EXISTS verses_fts USING fts5(text, content='verses', content_rowid='rowid');`,
];

const OUT_DIR = path.resolve(__dirname, '..', 'apps', 'mobile', 'assets', 'bibles');
const OUT_FILE = path.join(OUT_DIR, 'seed.sqlite');
const CACHE_DIR = path.resolve(__dirname, '.cache');

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return (await res.json()) as T;
}

async function loadSource(spec: VersionSpec): Promise<ScrollmapperDoc> {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const cacheFile = path.join(CACHE_DIR, `${spec.id}.json`);
  if (fs.existsSync(cacheFile)) {
    return JSON.parse(fs.readFileSync(cacheFile, 'utf8')) as ScrollmapperDoc;
  }
  console.log(`[seed] fetching ${spec.abbreviation} from ${spec.url}`);
  const doc = await fetchJson<ScrollmapperDoc>(spec.url);
  fs.writeFileSync(cacheFile, JSON.stringify(doc));
  return doc;
}

function loadAll(): Promise<Array<{ spec: VersionSpec; doc: ScrollmapperDoc }>> {
  return Promise.all(SOURCES.map(async (spec) => ({ spec, doc: await loadSource(spec) })));
}

async function main(): Promise<void> {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  if (fs.existsSync(OUT_FILE)) fs.unlinkSync(OUT_FILE);

  const db = new Database(OUT_FILE);
  for (const s of SCHEMA_STATEMENTS) db.exec(s);

  const insertVersion = db.prepare(
    `INSERT INTO versions (id, name, abbreviation, language, source, copyright, installed_at)
     VALUES (@id, @name, @abbreviation, @language, 'bundled', @copyright, @installedAt);`,
  );
  const insertBook = db.prepare(
    `INSERT OR REPLACE INTO books (version_id, osis_id, name, ordinal) VALUES (?, ?, ?, ?);`,
  );
  const insertVerse = db.prepare(
    `INSERT OR REPLACE INTO verses (version_id, book_osis, chapter, verse, text)
     VALUES (?, ?, ?, ?, ?);`,
  );

  const now = Date.now();
  const sources = await loadAll();

  const run = db.transaction(() => {
    for (const { spec, doc } of sources) {
      console.log(`[seed] writing ${spec.abbreviation} (${doc.books.length} books)`);
      insertVersion.run({
        id: spec.id,
        name: spec.name,
        abbreviation: spec.abbreviation,
        language: spec.language,
        copyright: spec.copyright,
        installedAt: now,
      });
      doc.books.forEach((book, idx) => {
        const osis = OSIS_BY_ORDINAL[idx] ?? book.name;
        insertBook.run(spec.id, osis, book.name, idx + 1);
        for (const ch of book.chapters) {
          for (const v of ch.verses) {
            insertVerse.run(spec.id, osis, ch.chapter, v.verse, v.text);
          }
        }
      });
    }

    // Rebuild FTS (content table is `verses`; populate once)
    db.exec(`INSERT INTO verses_fts(rowid, text) SELECT rowid, text FROM verses;`);
  });
  run();

  db.exec(`VACUUM;`);
  db.close();
  const size = fs.statSync(OUT_FILE).size;
  console.log(`[seed] wrote ${OUT_FILE} (${(size / 1024 / 1024).toFixed(1)} MB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

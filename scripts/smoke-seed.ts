#!/usr/bin/env ts-node
/**
 * scripts/smoke-seed.ts
 *
 * Non-RN smoke test: opens the bundled seed.sqlite, renders Genesis 1 KJV
 * through BibleRepository, creates a note + highlight via the other repos,
 * closes, reopens, and verifies persistence. Useful in CI / sanity on Linux
 * where we can't boot the macOS app.
 */
import * as path from 'node:path';
import Database from 'better-sqlite3';
import {
  BibleRepository,
  HighlightsRepository,
  NotesRepository,
} from '../apps/mobile/src/data/repositories';
import { runMigrations } from '../apps/mobile/src/data/db/migrations';
import type { DbClient, SqlParam, SqlRow } from '../apps/mobile/src/data/db/types';

const SEED = path.resolve(__dirname, '..', 'apps', 'mobile', 'assets', 'bibles', 'seed.sqlite');

function wrap(db: Database.Database): DbClient {
  const client: DbClient = {
    async execute<Row extends SqlRow = SqlRow>(sql: string, params: SqlParam[] = []): Promise<Row[]> {
      const trimmed = sql.trim();
      if (/^SELECT\s/i.test(trimmed)) {
        return db.prepare(sql).all(...(params as unknown[])) as Row[];
      }
      if (/^PRAGMA\s/i.test(trimmed) && !/=/.test(trimmed)) {
        return db.prepare(sql).all(...(params as unknown[])) as Row[];
      }
      if (/^PRAGMA\s.*=/i.test(trimmed)) {
        db.exec(sql);
        return [] as Row[];
      }
      db.prepare(sql).run(...(params as unknown[]));
      return [] as Row[];
    },
    async executeBatch(statements) {
      for (const s of statements) db.exec(s);
    },
    async transaction(fn) {
      return fn(client);
    },
    async close() {
      db.close();
    },
  };
  return client;
}

async function openSeed(): Promise<{ db: Database.Database; client: DbClient }> {
  const db = new Database(SEED);
  const client = wrap(db);
  await runMigrations(client);
  return { db, client };
}

async function main(): Promise<void> {
  const { client: c1 } = await openSeed();
  const bible = new BibleRepository(c1);
  const notes = new NotesRepository(c1);
  const highlights = new HighlightsRepository(c1);

  const versions = await bible.listVersions();
  console.log('[smoke] versions:', versions.map((v) => v.abbreviation).join(', '));
  if (!versions.find((v) => v.id === 'kjv')) throw new Error('KJV missing');

  const gen1 = await bible.getChapter('kjv', 'Gen', 1);
  console.log(`[smoke] Genesis 1 KJV: ${gen1.length} verses`);
  if (gen1.length === 0) throw new Error('no verses');
  console.log(`[smoke] Gen 1:1 → "${gen1[0].text}"`);

  const note = await notes.create({
    anchorVersion: 'kjv',
    book: 'Gen',
    chapter: 1,
    verseStart: 1,
    verseEnd: 1,
    body: 'smoke-test note',
  });
  const hl = await highlights.create({
    book: 'Gen',
    chapter: 1,
    verseStart: 1,
    verseEnd: 1,
    color: 'yellow',
  });
  console.log(`[smoke] created note ${note.id} and highlight ${hl.id}`);
  await c1.close();

  // Reopen and verify
  const { client: c2 } = await openSeed();
  const bible2 = new BibleRepository(c2);
  const notes2 = new NotesRepository(c2);
  const highlights2 = new HighlightsRepository(c2);
  const foundNote = await notes2.getById(note.id);
  if (!foundNote || foundNote.body !== 'smoke-test note') {
    throw new Error('note did not persist');
  }
  const chapterHl = await highlights2.listForChapter('Gen', 1);
  if (!chapterHl.find((h) => h.id === hl.id)) {
    throw new Error('highlight did not persist');
  }
  const ver = await bible2.getVerse('kjv', 'Gen', 1, 1);
  if (!ver) throw new Error('verse missing after reopen');
  console.log('[smoke] persistence confirmed after reopen');

  // Clean up so re-running the smoke test stays idempotent
  await notes2.delete(note.id);
  await highlights2.delete(hl.id);
  await c2.close();
  console.log('[smoke] OK');
}

main().catch((e) => {
  console.error('[smoke] FAIL', e);
  process.exit(1);
});

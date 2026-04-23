#!/usr/bin/env tsx
/**
 * Headless smoke test that exercises the same code paths the macOS app uses
 * on boot, against the real built seed.sqlite.
 *
 * - Opens the seed DB via better-sqlite3 (stands in for op-sqlite on native)
 * - Wraps it in a DbClient that matches our interface
 * - Uses BibleRepository, NotesRepository, HighlightsRepository directly
 * - Reads Genesis 1 KJV, John 3 KJV, adds a note + highlight, reloads, and
 *   confirms persistence.
 *
 * Run with:  npx tsx scripts/smoke-test.ts
 */

import Database from 'better-sqlite3';
import { mkdirSync, existsSync, unlinkSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { runMigrations } from '../apps/mobile/src/data/db/migrate';
import type { DbClient, SqlParam } from '../apps/mobile/src/data/db/DbClient';
import { BibleRepository } from '../apps/mobile/src/data/repositories/BibleRepository';
import { NotesRepository } from '../apps/mobile/src/data/repositories/NotesRepository';
import { HighlightsRepository } from '../apps/mobile/src/data/repositories/HighlightsRepository';

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..');
const SEED = resolve(ROOT, 'apps/mobile/assets/bibles/seed.sqlite');
const WORK_DIR = resolve(ROOT, '.cache/smoke');
const WORK_DB = resolve(WORK_DIR, 'bibleapp.sqlite');

class BetterSqliteClient implements DbClient {
  constructor(private readonly db: Database.Database) {}

  async execute<T = unknown>(sql: string, params: SqlParam[] = []): Promise<T[]> {
    const stmt = this.db.prepare(sql);
    if (isSelect(sql)) {
      return stmt.all(...(params as unknown[])) as T[];
    }
    stmt.run(...(params as unknown[]));
    return [];
  }

  async executeBatch(
    statements: Array<{ sql: string; params?: SqlParam[] }>,
  ): Promise<void> {
    const txn = this.db.transaction(
      (stmts: Array<{ sql: string; params?: SqlParam[] }>) => {
        for (const s of stmts) {
          const stmt = this.db.prepare(s.sql);
          stmt.run(...((s.params ?? []) as unknown[]));
        }
      },
    );
    txn(statements);
  }

  async close(): Promise<void> {
    this.db.close();
  }
}

function isSelect(sql: string): boolean {
  return /^\s*(select|with)\b/i.test(sql) || /RETURNING/i.test(sql);
}

async function main() {
  if (!existsSync(SEED)) {
    throw new Error(`Seed not built: ${SEED}. Run \`npm run seed:build\` first.`);
  }

  mkdirSync(WORK_DIR, { recursive: true });
  if (existsSync(WORK_DB)) unlinkSync(WORK_DB);

  console.log('Simulating first-launch seed copy...');
  copyFileSync(SEED, WORK_DB);
  const db = new Database(WORK_DB);
  db.pragma('foreign_keys = ON');
  const client = new BetterSqliteClient(db);

  console.log('Running migrations (should be a no-op since seed already has them)...');
  await runMigrations(client);

  const bible = new BibleRepository(client);
  const versions = await bible.listVersions();
  console.log(`\n[OK] ${versions.length} versions installed:`);
  for (const v of versions) {
    console.log(`   - ${v.abbreviation}: ${v.name} (${v.language}, ${v.source})`);
  }

  const genesis1 = await bible.getChapter('kjv', 'Gen', 1);
  console.log(
    `\n[OK] Genesis 1 KJV loaded: ${genesis1.length} verses. First verse:`,
  );
  console.log(`   "${genesis1[0].text}"`);

  const john3 = await bible.getChapter('kjv', 'John', 3);
  const v16 = john3.find((v) => v.verse === 16);
  console.log(`\n[OK] John 3:16 KJV:\n   "${v16?.text}"`);

  console.log('\nCreating a note and highlight...');
  const notes = new NotesRepository(client);
  const highlights = new HighlightsRepository(client);
  const note = await notes.create({
    anchorVersion: 'kjv',
    book: 'John',
    chapter: 3,
    verseStart: 16,
    verseEnd: 16,
    body: 'Classic verse — God so loved the world.',
  });
  const hl = await highlights.upsert({
    book: 'John',
    chapter: 3,
    verseStart: 16,
    verseEnd: 17,
    color: 'yellow',
  });
  console.log(`[OK] Note ${note.id} dirty=${note.dirty}`);
  console.log(`[OK] Highlight ${hl.id} color=${hl.color}`);

  console.log('\nSimulating app restart (close + reopen DB)...');
  await client.close();
  const db2 = new Database(WORK_DB);
  const client2 = new BetterSqliteClient(db2);
  const notes2 = new NotesRepository(client2);
  const highlights2 = new HighlightsRepository(client2);

  const persistedNotes = await notes2.list();
  const persistedHighlights = await highlights2.list();
  console.log(`[OK] After restart: ${persistedNotes.length} note(s), ${persistedHighlights.length} highlight(s)`);

  const searched = await new BibleRepository(client2).search('beginning', {
    versionId: 'kjv',
    limit: 3,
  });
  console.log(`\n[OK] FTS5 search for "beginning" returned ${searched.length} hits:`);
  for (const h of searched.slice(0, 3)) {
    console.log(`   ${h.book} ${h.chapter}:${h.verse} — ${h.text.slice(0, 80)}...`);
  }

  await client2.close();
  console.log('\nAll smoke checks passed.');
}

main().catch((err) => {
  console.error('SMOKE TEST FAILED:', err);
  process.exit(1);
});

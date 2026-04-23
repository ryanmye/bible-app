import { BibleRepository } from '../../src/data/repositories/BibleRepository';
import { FakeDb } from '../fakes/FakeDb';

test('getChapter selects rows ordered by verse', async () => {
  const db = new FakeDb();
  db.mockSelect(/FROM verses/, [
    { version_id: 'kjv', book_osis: 'John', chapter: 3, verse: 16, text: 'For God so loved...' },
  ]);
  const repo = new BibleRepository(db);
  const verses = await repo.getChapter('kjv', 'John', 3);
  expect(verses).toEqual([
    { versionId: 'kjv', book: 'John', chapter: 3, verse: 16, text: 'For God so loved...' },
  ]);
  expect(db.calls[0].sql).toContain('FROM verses');
  expect(db.calls[0].sql).toContain('ORDER BY verse ASC');
  expect(db.calls[0].params).toEqual(['kjv', 'John', 3]);
});

test('upsertVersion writes an ON CONFLICT upsert', async () => {
  const db = new FakeDb();
  const repo = new BibleRepository(db);
  await repo.upsertVersion({
    id: 'kjv',
    name: 'King James Version',
    abbreviation: 'KJV',
    language: 'en',
    source: 'bundled',
    installedAt: 1,
  });
  expect(db.calls[0].sql).toContain('INSERT INTO versions');
  expect(db.calls[0].sql).toContain('ON CONFLICT(id)');
  expect(db.calls[0].params).toEqual([
    'kjv',
    'King James Version',
    'KJV',
    'en',
    'bundled',
    null,
    1,
  ]);
});

test('bulkInsertVerses writes both verses and fts rows', async () => {
  const db = new FakeDb();
  const repo = new BibleRepository(db);
  await repo.bulkInsertVerses([
    { versionId: 'kjv', book: 'Gen', chapter: 1, verse: 1, text: 'In the beginning...' },
  ]);
  const inserts = db.calls.map((c) => c.sql);
  expect(inserts.some((s) => s.includes('INTO verses'))).toBe(true);
  expect(inserts.some((s) => s.includes('INTO verses_fts'))).toBe(true);
});

test('search forwards the query and optional versionId', async () => {
  const db = new FakeDb();
  db.mockSelect('FROM verses_fts', [
    {
      version_id: 'kjv',
      book_osis: 'John',
      chapter: 3,
      verse: 16,
      text: 'For God so loved...',
      rank: -1,
    },
  ]);
  const repo = new BibleRepository(db);
  const hits = await repo.search('loved', { versionId: 'kjv', limit: 10 });
  expect(hits).toHaveLength(1);
  expect(hits[0].text).toContain('loved');
  expect(db.calls[0].params).toEqual(['loved', 'kjv', 10]);
});

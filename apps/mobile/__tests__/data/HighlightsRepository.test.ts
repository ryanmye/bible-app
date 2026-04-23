import { HighlightsRepository } from '../../src/data/repositories/HighlightsRepository';
import { FakeDb } from '../fakes/FakeDb';

const fixedNow = () => 1_700_000_000_000;
const fixedId = () => 'hl-id';

test('upsert inserts when no existing highlight matches', async () => {
  const db = new FakeDb();
  db.mockSelect(/FROM highlights\s+WHERE/, []);
  const repo = new HighlightsRepository(db, fixedNow, fixedId);

  const highlight = await repo.upsert({
    book: 'Gen',
    chapter: 1,
    verseStart: 1,
    verseEnd: 1,
    color: 'yellow',
  });

  expect(highlight.id).toBe('hl-id');
  expect(highlight.color).toBe('yellow');
  const insert = db.calls.find((c) => c.sql.toUpperCase().startsWith('INSERT'));
  expect(insert).toBeDefined();
});

test('upsert updates existing highlight when one exists', async () => {
  const db = new FakeDb();
  db.mockSelect(/FROM highlights\s+WHERE book_osis/, [
    {
      id: 'existing-id',
      book_osis: 'Gen',
      chapter: 1,
      verse_start: 1,
      verse_end: 1,
      color: 'yellow',
      created_at: 1,
      updated_at: 1,
      remote_id: null,
      dirty: 1,
    },
  ]);
  const repo = new HighlightsRepository(db, fixedNow, fixedId);

  const result = await repo.upsert({
    book: 'Gen',
    chapter: 1,
    verseStart: 1,
    verseEnd: 1,
    color: 'green',
  });

  expect(result.id).toBe('existing-id');
  expect(result.color).toBe('green');
  const update = db.calls.find((c) => c.sql.toUpperCase().startsWith('UPDATE'));
  expect(update).toBeDefined();
  expect(update!.params).toEqual(['green', fixedNow(), 'existing-id']);
});

test('list with color filter includes the color clause', async () => {
  const db = new FakeDb();
  db.mockSelect(/FROM highlights/, []);
  const repo = new HighlightsRepository(db, fixedNow, fixedId);
  await repo.list({ book: 'Ps', chapter: 23, color: 'blue' });
  const select = db.calls[0];
  expect(select.sql).toContain('color = ?');
  expect(select.params).toEqual(['Ps', 23, 'blue']);
});

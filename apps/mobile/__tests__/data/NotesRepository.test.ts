import { NotesRepository } from '../../src/data/repositories/NotesRepository';
import { FakeDb } from '../fakes/FakeDb';

const fixedNow = () => 1_700_000_000_000;
const fixedId = () => 'test-note-id';

test('create inserts a dirty note and returns the full object', async () => {
  const db = new FakeDb();
  const repo = new NotesRepository(db, fixedNow, fixedId);

  const note = await repo.create({
    anchorVersion: 'kjv',
    book: 'John',
    chapter: 3,
    verseStart: 16,
    verseEnd: 16,
    body: 'For God so loved the world.',
  });

  expect(note).toMatchObject({
    id: 'test-note-id',
    book: 'John',
    chapter: 3,
    verseStart: 16,
    verseEnd: 16,
    dirty: true,
    remoteId: null,
  });

  const insert = db.calls.find((c) => c.sql.toUpperCase().startsWith('INSERT'));
  expect(insert).toBeDefined();
  expect(insert!.sql).toContain('INTO notes');
  expect(insert!.params).toEqual([
    'test-note-id',
    'kjv',
    'John',
    3,
    16,
    16,
    'For God so loved the world.',
    fixedNow(),
    fixedNow(),
    null,
  ]);
});

test('list with book+chapter filter builds the right WHERE clause', async () => {
  const db = new FakeDb();
  db.mockSelect('FROM notes', []);
  const repo = new NotesRepository(db, fixedNow, fixedId);
  await repo.list({ book: 'Gen', chapter: 1 });
  const select = db.calls.find((c) => c.sql.includes('FROM notes'))!;
  expect(select.sql).toContain('book_osis = ?');
  expect(select.sql).toContain('chapter = ?');
  expect(select.params).toEqual(['Gen', 1]);
});

test('update throws when note is missing', async () => {
  const db = new FakeDb();
  db.mockSelect(/FROM notes WHERE id/, []);
  const repo = new NotesRepository(db, fixedNow, fixedId);
  await expect(repo.update('missing', { body: 'x' })).rejects.toThrow(
    /Note missing not found/,
  );
});

test('markClean sets dirty = 0 and stores the remote id', async () => {
  const db = new FakeDb();
  const repo = new NotesRepository(db, fixedNow, fixedId);
  await repo.markClean('abc', 'remote-123');
  const call = db.calls[0];
  expect(call.sql).toMatch(/UPDATE notes SET dirty = 0, remote_id = \?/);
  expect(call.params).toEqual(['remote-123', 'abc']);
});

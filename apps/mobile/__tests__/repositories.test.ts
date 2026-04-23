import { createInMemoryDb } from '../src/data/db/testing';
import { runMigrations } from '../src/data/db/migrations';
import {
  BibleRepository,
  HighlightsRepository,
  NotesRepository,
} from '../src/data/repositories';

describe('repositories', () => {
  it('migrates a fresh DB up to the latest version', async () => {
    const db = createInMemoryDb();
    const version = await runMigrations(db);
    expect(version).toBe(1);
    const second = await runMigrations(db);
    expect(second).toBe(1);
    await db.close();
  });

  it('BibleRepository upserts versions, books, verses and serves chapter queries', async () => {
    const db = createInMemoryDb();
    await runMigrations(db);
    const bible = new BibleRepository(db);

    await bible.upsertVersion({
      id: 'kjv',
      name: 'King James',
      abbreviation: 'KJV',
      language: 'en',
      source: 'bundled',
      copyright: 'PD',
      installedAt: 1,
    });
    await bible.insertBooks([
      { versionId: 'kjv', osisId: 'Gen', name: 'Genesis', ordinal: 1 },
    ]);
    await bible.insertVerses([
      { versionId: 'kjv', book: 'Gen', chapter: 1, verse: 1, text: 'In the beginning…' },
      { versionId: 'kjv', book: 'Gen', chapter: 1, verse: 2, text: 'And the earth…' },
      { versionId: 'kjv', book: 'Gen', chapter: 1, verse: 3, text: 'And God said…' },
    ]);

    const versions = await bible.listVersions();
    expect(versions).toHaveLength(1);
    expect(versions[0].abbreviation).toBe('KJV');

    const chapter = await bible.getChapter('kjv', 'Gen', 1);
    expect(chapter.map((v) => v.verse)).toEqual([1, 2, 3]);

    const range = await bible.getRange('kjv', 'Gen', 1, 1, 2);
    expect(range).toHaveLength(2);

    const verse = await bible.getVerse('kjv', 'Gen', 1, 3);
    expect(verse?.text).toContain('And God said');

    await db.close();
  });

  it('NotesRepository creates, updates, lists and deletes notes', async () => {
    const db = createInMemoryDb();
    await runMigrations(db);
    const notes = new NotesRepository(db);

    const n = await notes.create({
      anchorVersion: 'kjv',
      book: 'Gen',
      chapter: 1,
      verseStart: 1,
      verseEnd: 1,
      body: 'First note',
    });
    expect(n.id).toBeDefined();
    expect(n.dirty).toBe(true);

    await notes.update(n.id, { body: 'Updated', verseStart: 1, verseEnd: 2 });
    const fetched = await notes.getById(n.id);
    expect(fetched?.body).toBe('Updated');
    expect(fetched?.verseEnd).toBe(2);

    const chapterNotes = await notes.listForChapter('Gen', 1);
    expect(chapterNotes).toHaveLength(1);

    const dirty = await notes.listDirty();
    expect(dirty).toHaveLength(1);

    await notes.delete(n.id);
    expect(await notes.list()).toHaveLength(0);

    await db.close();
  });

  it('HighlightsRepository supports range highlights and listing', async () => {
    const db = createInMemoryDb();
    await runMigrations(db);
    const highlights = new HighlightsRepository(db);

    const h = await highlights.create({
      book: 'John',
      chapter: 3,
      verseStart: 16,
      verseEnd: 17,
      color: 'yellow',
    });
    expect(h.color).toBe('yellow');

    await highlights.setColor(h.id, 'green');
    const list = await highlights.listForChapter('John', 3);
    expect(list[0].color).toBe('green');

    await highlights.delete(h.id);
    expect(await highlights.list()).toHaveLength(0);

    await db.close();
  });
});

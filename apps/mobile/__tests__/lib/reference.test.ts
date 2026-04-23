import { formatReference, parseReference } from '../../src/lib/reference';

test('parseReference parses single verse', () => {
  expect(parseReference('John 3:16')).toEqual({
    book: 'John',
    chapter: 3,
    verse: 16,
    verseEnd: undefined,
  });
});

test('parseReference parses chapter-only', () => {
  expect(parseReference('Genesis 1')).toEqual({
    book: 'Gen',
    chapter: 1,
    verse: undefined,
    verseEnd: undefined,
  });
});

test('parseReference parses numbered book and range', () => {
  expect(parseReference('1 John 4:7-9')).toEqual({
    book: '1John',
    chapter: 4,
    verse: 7,
    verseEnd: 9,
  });
});

test('parseReference returns null for unknown books', () => {
  expect(parseReference('Nope 1:1')).toBeNull();
});

test('formatReference round-trips', () => {
  expect(formatReference({ book: 'John', chapter: 3, verse: 16 })).toBe(
    'John 3:16',
  );
  expect(
    formatReference({ book: 'Rom', chapter: 8, verse: 28, verseEnd: 30 }),
  ).toBe('Romans 8:28-30');
  expect(formatReference({ book: 'Gen', chapter: 1 })).toBe('Genesis 1');
});

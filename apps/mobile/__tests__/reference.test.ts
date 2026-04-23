import { parseReference, formatReference } from '../src/lib/reference';

describe('parseReference', () => {
  it('parses "Gen 1"', () => {
    expect(parseReference('Gen 1')).toEqual({ book: 'Gen', chapter: 1, verse: undefined });
  });
  it('parses "John 3:16"', () => {
    expect(parseReference('John 3:16')).toEqual({ book: 'John', chapter: 3, verse: 16 });
  });
  it('parses full name', () => {
    expect(parseReference('Genesis 2:4')).toEqual({ book: 'Gen', chapter: 2, verse: 4 });
  });
  it('rejects garbage', () => {
    expect(parseReference('not a ref')).toBeNull();
  });
});

describe('formatReference', () => {
  it('formats chapter-only', () => {
    expect(formatReference({ book: 'Gen', chapter: 1 })).toBe('Gen 1');
  });
  it('formats with verse', () => {
    expect(formatReference({ book: 'John', chapter: 3, verse: 16 }, 'John')).toBe('John 3:16');
  });
});

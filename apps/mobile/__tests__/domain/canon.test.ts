import {
  CANONICAL_BOOKS,
  CANONICAL_BY_OSIS,
  canonicalBookName,
} from '../../src/domain/bible/canon';
import { referenceLabel } from '../../src/domain/bible/types';

describe('canonical book list', () => {
  test('has 66 books with strictly increasing ordinals', () => {
    expect(CANONICAL_BOOKS).toHaveLength(66);
    CANONICAL_BOOKS.forEach((b, i) => {
      expect(b.ordinal).toBe(i + 1);
    });
  });

  test('covers OT and NT', () => {
    const ot = CANONICAL_BOOKS.filter((b) => b.testament === 'OT');
    const nt = CANONICAL_BOOKS.filter((b) => b.testament === 'NT');
    expect(ot).toHaveLength(39);
    expect(nt).toHaveLength(27);
  });

  test('canonicalBookName looks up human-readable names', () => {
    expect(canonicalBookName('Gen')).toBe('Genesis');
    expect(canonicalBookName('Rev')).toBe('Revelation');
    expect(canonicalBookName('Unknown')).toBe('Unknown');
  });

  test('CANONICAL_BY_OSIS is keyed by osisId', () => {
    expect(CANONICAL_BY_OSIS.John.name).toBe('John');
  });
});

describe('referenceLabel', () => {
  test('chapter only', () => {
    expect(referenceLabel({ book: 'Gen', chapter: 1 }, 'Genesis')).toBe(
      'Genesis 1',
    );
  });
  test('single verse', () => {
    expect(
      referenceLabel({ book: 'John', chapter: 3, verse: 16 }, 'John'),
    ).toBe('John 3:16');
  });
  test('verse range', () => {
    expect(
      referenceLabel(
        { book: 'Rom', chapter: 8, verse: 28, verseEnd: 30 },
        'Romans',
      ),
    ).toBe('Romans 8:28-30');
  });
});

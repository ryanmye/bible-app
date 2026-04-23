import { parseUsfm } from '../../src/data/importers/usfm/parseUsfm';

const SAMPLE = `\\id GEN Genesis
\\h Genesis
\\mt Genesis
\\c 1
\\p
\\v 1 In the beginning God created the heavens and the earth.
\\v 2 The earth was formless and empty.
\\c 2
\\v 1 Thus the heavens and the earth were finished.
`;

test('parseUsfm extracts osisHint, titleHint, and verses', () => {
  const parsed = parseUsfm(SAMPLE);
  expect(parsed.osisHint).toBe('Gen');
  expect(parsed.titleHint).toBe('Genesis');
  expect(parsed.verses).toEqual([
    {
      book: 'Gen',
      chapter: 1,
      verse: 1,
      text: 'In the beginning God created the heavens and the earth.',
    },
    {
      book: 'Gen',
      chapter: 1,
      verse: 2,
      text: 'The earth was formless and empty.',
    },
    {
      book: 'Gen',
      chapter: 2,
      verse: 1,
      text: 'Thus the heavens and the earth were finished.',
    },
  ]);
  expect(parsed.warnings).toEqual([]);
});

test('parseUsfm warns on unknown book id', () => {
  const parsed = parseUsfm('\\id XYZ Unknown\n\\c 1\n\\v 1 hi\n');
  expect(parsed.warnings).toEqual(['Unknown USFM book id: XYZ']);
  expect(parsed.osisHint).toBeNull();
  expect(parsed.verses[0].book).toBe('XYZ');
});

test('parseUsfm strips inline markers', () => {
  const parsed = parseUsfm(
    '\\id JHN John\n\\c 3\n\\v 16 For \\wj God so loved the world\\wj*.\n',
  );
  expect(parsed.verses[0].text).toBe('For God so loved the world .');
});

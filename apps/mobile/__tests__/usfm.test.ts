import { parseUsfm } from '../src/data/importers/usfm/parseUsfm';

describe('parseUsfm', () => {
  it('parses a minimal USFM book into verses', () => {
    const text = [
      '\\id GEN Genesis - test',
      '\\h Genesis',
      '\\c 1',
      '\\v 1 In the beginning God created the heaven and the earth.',
      '\\v 2 And the earth was without form, and void;',
      '  and darkness was upon the face of the deep.',
      '\\c 2',
      '\\v 1 Thus the heavens and the earth were finished.',
    ].join('\n');
    const result = parseUsfm({ text, versionId: 'u_test' });
    expect(result.books).toHaveLength(1);
    expect(result.books[0].osisId).toBe('GEN');
    expect(result.verses).toHaveLength(3);
    expect(result.verses[1].text).toContain('darkness was upon the face of the deep');
    expect(result.verses[2].chapter).toBe(2);
  });

  it('throws when no \\id is present', () => {
    expect(() => parseUsfm({ text: '\\v 1 hello', versionId: 'x' })).toThrow(/no .id/);
  });
});

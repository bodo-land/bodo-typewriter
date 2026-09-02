/**
 * Data-driven test: every consonant key followed by every other consonant
 * key (including itself), with no vowel typed between them.
 *
 * Asserts the halant-insertion formula —
 * `transliterate(c1 + c2) === char(c1) + HALANT + char(c2)` — across the
 * full CONSONANT_MAPPINGS × CONSONANT_MAPPINGS product. Verified against
 * the real engine output before being encoded; the only mismatches were
 * cases where concatenating the two keys spells a longer valid key, which
 * the tokenizer's longest-match rule picks up first — those are excluded
 * here and covered explicitly below instead.
 */

import { describe, it, expect } from 'vitest';
import { transliterate } from '../src/engine/transliterator';
import { CONSONANT_MAPPINGS } from '../src/engine/mappings';
import { U } from '../src/engine/unicode';

const consonantKeys = Object.keys(CONSONANT_MAPPINGS);

/**
 * c1 + c2 where the concatenated string is itself a longer valid consonant
 * key, so the tokenizer consumes it as ONE token instead of two separate
 * consonants + halant. E.g. 'k' + 'h' = "kh", which is the 2-char key for
 * ख — the tokenizer never sees "k" then "h" as separate tokens.
 */
const KNOWN_EXCEPTIONS = new Set([
  'kh+yao', 'kh+y',
  'k+h', 'g+h', 'c+h', 'j+h', 'T+h', 'D+h', 't+h', 'd+h', 'p+h', 'b+h',
  'x+h', 's+h',
  'n+g', 'n+gh',
]);

describe('consonant × consonant matrix (halant conjuncts)', () => {
  for (const c1 of consonantKeys) {
    for (const c2 of consonantKeys) {
      const pair = `${c1}+${c2}`;
      if (KNOWN_EXCEPTIONS.has(pair)) continue;

      it(`${pair} → ${CONSONANT_MAPPINGS[c1].char}्${CONSONANT_MAPPINGS[c2].char}`, () => {
        const expected = CONSONANT_MAPPINGS[c1].char + U.HALANT + CONSONANT_MAPPINGS[c2].char;
        expect(transliterate(c1 + c2)).toBe(expected);
      });
    }
  }
});

describe('consonant × consonant matrix — documented exceptions (longest-match collisions)', () => {
  it("k+h: 'kh' tokenizes as one key (→ ख), not k + halant + h", () => {
    expect(transliterate('kh')).toBe('ख');
  });
  it("g+h: 'gh' tokenizes as one key (→ घ)", () => {
    expect(transliterate('gh')).toBe('घ');
  });
  it("c+h: 'ch' tokenizes as one key (→ छ)", () => {
    expect(transliterate('ch')).toBe('छ');
  });
  it("j+h: 'jh' tokenizes as one key (→ झ)", () => {
    expect(transliterate('jh')).toBe('झ');
  });
  it("T+h: 'Th' tokenizes as one key (→ ठ)", () => {
    expect(transliterate('Th')).toBe('ठ');
  });
  it("D+h: 'Dh' tokenizes as one key (→ ढ)", () => {
    expect(transliterate('Dh')).toBe('ढ');
  });
  it("t+h: 'th' tokenizes as one key (→ थ)", () => {
    expect(transliterate('th')).toBe('थ');
  });
  it("d+h: 'dh' tokenizes as one key (→ ध)", () => {
    expect(transliterate('dh')).toBe('ध');
  });
  it("p+h: 'ph' tokenizes as one key (→ फ)", () => {
    expect(transliterate('ph')).toBe('फ');
  });
  it("b+h: 'bh' tokenizes as one key (→ भ)", () => {
    expect(transliterate('bh')).toBe('भ');
  });
  it("x+h: 'xh' tokenizes as one key (→ श), distinct from x alone (→ ष)", () => {
    expect(transliterate('xh')).toBe('श');
  });
  it("s+h: 'sh' tokenizes as one key (→ श)", () => {
    expect(transliterate('sh')).toBe('श');
  });
  it("n+g: 'ng' tokenizes as the anusvara vowel key (→ ं), not n + halant + g", () => {
    expect(transliterate('ng')).toBe('ं');
  });
  it("n+gh: 'ngh' tokenizes as ng (→ ं) + h (→ ह)", () => {
    expect(transliterate('ngh')).toBe('ंह');
  });
  it("kh+y: 'khy' tokenizes as the 3-char conjunct key (→ ख्ष), not kh + halant + y", () => {
    expect(transliterate('khy')).toBe('ख्ष');
  });
  it("kh+yao: 'khyao' greedily consumes 'khy' first, then 'a' + 'o' separately", () => {
    expect(transliterate('khyao')).toBe('ख्षाअ');
  });
});

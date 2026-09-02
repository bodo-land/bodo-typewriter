/**
 * Data-driven test: the 'ng' anusvara context-rule, exercised against every
 * consonant, generalizing the single hand-written 'sang'/'ngk' cases in
 * src/__tests__/transliterator.test.ts to the full consonant set.
 *
 * All three formulas below were verified against the real engine output
 * (zero mismatches across all consonants) before being encoded as tests.
 */

import { describe, it, expect } from 'vitest';
import { transliterate } from '../src/engine/transliterator';
import { CONSONANT_MAPPINGS } from '../src/engine/mappings';
import { U } from '../src/engine/unicode';

const consonantKeys = Object.keys(CONSONANT_MAPPINGS);

describe("consonant + 'a' + 'ng' → consonant + ā mātrā + anusvara", () => {
  // Generalizes 'sang' → सां to every consonant.
  for (const c of consonantKeys) {
    it(`${c}ang → ${CONSONANT_MAPPINGS[c].char}${U.M_AA}${U.ANUSVARA}`, () => {
      const expected = CONSONANT_MAPPINGS[c].char + U.M_AA + U.ANUSVARA;
      expect(transliterate(c + 'a' + 'ng')).toBe(expected);
    });
  }
});

describe("bare consonant + 'ng' at end of input → consonant + anusvara", () => {
  for (const c of consonantKeys) {
    it(`${c}ng → ${CONSONANT_MAPPINGS[c].char}${U.ANUSVARA}`, () => {
      const expected = CONSONANT_MAPPINGS[c].char + U.ANUSVARA;
      expect(transliterate(c + 'ng')).toBe(expected);
    });
  }
});

describe("consonant + 'ng' + another consonant → anusvara only, no ग inserted", () => {
  // Generalizes 'ngk' → ंख (ng word-initial) to ng appearing after every
  // consonant and before every other consonant.
  for (const c1 of consonantKeys) {
    for (const c2 of consonantKeys) {
      it(`${c1}ng${c2} → ${CONSONANT_MAPPINGS[c1].char}${U.ANUSVARA}${CONSONANT_MAPPINGS[c2].char}`, () => {
        const expected = CONSONANT_MAPPINGS[c1].char + U.ANUSVARA + CONSONANT_MAPPINGS[c2].char;
        expect(transliterate(c1 + 'ng' + c2)).toBe(expected);
      });
    }
  }
});

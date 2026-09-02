/**
 * Data-driven test: every consonant key × every vowel key.
 *
 * Rather than hand-writing individual cases, this asserts a single formula
 * — `transliterate(consonantKey + vowelKey) === consonantChar + vowelMatra`
 * — against every combination in CONSONANT_MAPPINGS × VOWEL_MAPPINGS. The
 * formula was verified against the real engine output before being encoded
 * here (see the exceptions below, which are the only two combinations
 * where it doesn't hold).
 *
 * 'ng', 'M', and 'oM' are excluded from this matrix — they're context-
 * sensitive (anusvara placement depends on what follows), not simple
 * matra application, and are covered separately in anusvara-matrix.test.ts.
 */

import { describe, it, expect } from 'vitest';
import { transliterate } from '../src/engine/transliterator';
import { CONSONANT_MAPPINGS, VOWEL_MAPPINGS } from '../src/engine/mappings';

const CONTEXT_SENSITIVE_VOWEL_KEYS = new Set(['ng', 'M', 'oM']);

const consonantKeys = Object.keys(CONSONANT_MAPPINGS);
const vowelKeys = Object.keys(VOWEL_MAPPINGS).filter(k => !CONTEXT_SENSITIVE_VOWEL_KEYS.has(k));

/**
 * Combinations where the naive "consonant char + matra" formula does not
 * hold, because the concatenated KEY STRING is itself a longer valid token
 * that the tokenizer's longest-match rule picks up first.
 *
 * `NY` + `oo` → "NYoo" is tokenized as `NYo` (the 3-char base-ञ consonant
 * entry) + `o` (inherent vowel), not `NY` + `oo`.
 * `NY` + `ou` → "NYou" is tokenized as `NYo` + `u`, not `NY` + `ou`.
 */
const KNOWN_EXCEPTIONS = new Set(['NY+oo', 'NY+ou']);

describe('consonant × vowel matrix (mātrā application)', () => {
  for (const ck of consonantKeys) {
    for (const vk of vowelKeys) {
      const pair = `${ck}+${vk}`;
      if (KNOWN_EXCEPTIONS.has(pair)) continue;

      it(`${pair} → ${CONSONANT_MAPPINGS[ck].char}${VOWEL_MAPPINGS[vk].matra}`, () => {
        const expected = CONSONANT_MAPPINGS[ck].char + VOWEL_MAPPINGS[vk].matra;
        expect(transliterate(ck + vk)).toBe(expected);
      });
    }
  }
});

describe('consonant × vowel matrix — documented exceptions (longest-match collisions)', () => {
  it("NY+oo: 'NYoo' tokenizes as NYo (→ ञ) + o (inherent), not NY + oo", () => {
    expect(transliterate('NYoo')).toBe('ञ');
  });

  it("NY+ou: 'NYou' tokenizes as NYo (→ ञ) + u (→ ु), not NY + ou", () => {
    expect(transliterate('NYou')).toBe('ञु');
  });
});

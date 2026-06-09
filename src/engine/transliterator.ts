/**
 * Core transliteration engine — Roman → Bodo Devanagari Unicode.
 *
 * Processing pipeline
 * -------------------
 *
 *   Roman string
 *       ↓  tokenize()         (longest-match, typed tokens)
 *   Token[]
 *       ↓  processTokens()    (state machine)
 *   Unicode string
 *
 * State machine states
 * --------------------
 *   INITIAL         — start of input, or after a space/passthrough
 *   AFTER_CONSONANT — a consonant has been emitted; next vowel becomes mātrā
 *   AFTER_VOWEL     — a vowel was emitted; next vowel is standalone
 *
 * Halant insertion
 * ----------------
 * When a consonant immediately follows another consonant (no vowel between),
 * U+094D HALANT (virama) is inserted so the pair forms a conjunct.
 *
 * 'ng' special rule  (DOCUMENTED)
 * --------------------------------
 * 'ng' / 'M' after any content → anusvara ं.
 * 'ng' + following vowel        → anusvara ं + ग + mātrā of that vowel.
 *
 * Inherent vowel ('o' key)
 * ------------------------
 * 'o' after a consonant = inherent vowel.  No visible sign is added; the
 * consonant is simply committed as-is (Devanagari inherent-a convention).
 * 'o' at word start / after vowel = standalone अ.
 */

import { tokenize } from './tokenizer';
import {
  isVowelToken,
  isConsonantToken,
  matraFor,
  standaloneVowelFor,
  consonantCharFor,
  expandNg,
} from './rules';
import { SPECIAL_MAPPINGS } from './mappings';
import { U } from './unicode';

type State = 'initial' | 'after_consonant' | 'after_vowel';

/**
 * Transliterate a Roman-script string into Bodo Devanagari Unicode.
 *
 * @example
 * transliterate('namoskaar') → 'नमोस्कार'
 * transliterate('bodo')      → 'बोदो'
 * transliterate('gonga')     → 'गंगा'
 */
export function transliterate(input: string): string {
  if (!input) return '';

  const tokens = tokenize(input);
  let out = '';
  let state: State = 'initial';
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    // ── Special / symbol ──────────────────────────────────────────────────
    if (token.kind === 'special') {
      out += SPECIAL_MAPPINGS[token.raw].output;
      state = 'initial';
      i++;
      continue;
    }

    // ── Pass-through (space, digit, unknown) ─────────────────────────────
    if (token.kind === 'passthrough') {
      out += token.raw;
      state = 'initial';
      i++;
      continue;
    }

    // ── 'ng' / 'M' — anusvara (special rule) ─────────────────────────────
    if (token.kind === 'vowel' && (token.raw === 'ng' || token.raw === 'M')) {
      const expansion = expandNg(tokens[i + 1]);
      out += expansion.anusvara + expansion.gaWithMatra;
      if (expansion.consumeNext) i++; // skip the following vowel token
      state = 'after_vowel';
      i++;
      continue;
    }

    // ── Consonant ─────────────────────────────────────────────────────────
    if (isConsonantToken(token)) {
      const cChar = consonantCharFor(token.raw);

      if (state === 'after_consonant') {
        // Conjunct: previous consonant gets halant, new consonant begins
        out += U.HALANT + cChar;
      } else {
        out += cChar;
      }
      state = 'after_consonant';
      i++;
      continue;
    }

    // ── Vowel ─────────────────────────────────────────────────────────────
    if (isVowelToken(token)) {
      if (state === 'after_consonant') {
        const matra = matraFor(token.raw);
        if (matra === '') {
          // Inherent vowel ('o' key): consonant is committed, no sign added.
          // Nothing appended — the consonant is already in `out`.
        } else {
          out += matra;
        }
        state = 'after_vowel';
      } else {
        // Standalone vowel (initial or post-vowel position)
        out += standaloneVowelFor(token.raw);
        state = 'after_vowel';
      }
      i++;
      continue;
    }

    // Fallback (should not happen)
    out += token.raw;
    state = 'initial';
    i++;
  }

  return out;
}

/**
 * Transliterate only a single "word segment" (portion without spaces).
 * Useful for partial re-transliteration as the user types.
 */
export function transliterateSegment(segment: string): string {
  return transliterate(segment);
}

/**
 * Given a complete Roman input and a cursor position within it,
 * return the corresponding cursor position in the Unicode output.
 *
 * Strategy: transliterate prefixes of increasing length and measure the
 * output length at each step.
 */
export function mapCursorPosition(roman: string, romanCursor: number): number {
  return transliterate(roman.slice(0, romanCursor)).length;
}

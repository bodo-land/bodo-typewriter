/**
 * Core transliteration engine — English → Bodo Devanagari Unicode.
 *
 * Processing pipeline
 * -------------------
 *
 *   English string
 *       ↓  tokenize()         (longest-match trie, typed tokens)
 *   Token[]
 *       ↓  state machine
 *   Unicode string (NFC-normalised)
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
 *
 * Avagraha ('.a')
 * ---------------
 * Only emitted after a vowel has been output (ENG-004 fix).  Typing '.a'
 * after a consonant or at the start of input is silently discarded.
 *
 * Underscore ('_')
 * ----------------
 * Silent word-boundary marker: resets the state machine to INITIAL (so it
 * doesn't join into a conjunct/mātrā with what follows) but emits no
 * character of its own.
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
 * Transliterate an English-script string into Bodo Devanagari Unicode (NFC).
 *
 * @example
 * transliterate('bwdw')   → 'बोदो'
 * transliterate('gonga')  → 'गंगा'
 * transliterate('sang')   → 'सां'
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

    // ── Underscore — silent word-boundary marker, emits nothing ──────────
    if (token.kind === 'passthrough' && token.raw === '_') {
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
      out += state === 'after_consonant' ? U.HALANT + cChar : cChar;
      state = 'after_consonant';
      i++;
      continue;
    }

    // ── Vowel ─────────────────────────────────────────────────────────────
    if (isVowelToken(token)) {
      if (state === 'after_consonant') {
        const matra = matraFor(token.raw);
        if (matra !== '') out += matra;
        // inherent vowel ('o'): consonant already in out, nothing appended
        state = 'after_vowel';
      } else {
        out += standaloneVowelFor(token.raw);
        state = 'after_vowel';
      }
      i++;
      continue;
    }

    // Fallback (should not be reached)
    out += token.raw;
    state = 'initial';
    i++;
  }

  return out.normalize('NFC');
}

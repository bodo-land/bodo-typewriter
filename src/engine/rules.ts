/**
 * Context-sensitive composition rules for the Bodo transliteration engine.
 *
 * These rules govern how tokens combine when rendered:
 *
 * 1. Vowel after consonant  → mātrā (vowel sign), not standalone vowel.
 * 2. Consonant after consonant → insert halant (virama ्) between them.
 * 3. 'o' after consonant    → inherent vowel: commit consonant with no sign.
 * 4. 'ng' rule (DOCUMENTED) → 'ng'/'M' after consonant/matra = anusvara (ं);
 *                              'ng'/'M' followed by a vowel token  = ंग + matra.
 *
 * The transliterator calls these helpers; they do not parse tokens themselves.
 */

import { U } from './unicode';
import { VOWEL_MAPPINGS, CONSONANT_MAPPINGS } from './mappings';
import type { Token } from './tokenizer';

// ── Public helpers ──────────────────────────────────────────────────────────

/**
 * Returns true when a token represents any vowel key.
 */
export function isVowelToken(t: Token): boolean {
  return t.kind === 'vowel';
}

/**
 * Returns true when a token represents a consonant (including unaspirated).
 */
export function isConsonantToken(t: Token): boolean {
  return t.kind === 'consonant';
}

/**
 * Resolve a vowel token in "after-consonant" context:
 * returns the mātrā string, or '' for the inherent-vowel (key 'o').
 */
export function matraFor(raw: string): string {
  return VOWEL_MAPPINGS[raw]?.matra ?? '';
}

/**
 * Resolve a vowel token in standalone context (start of word / after vowel).
 */
export function standaloneVowelFor(raw: string): string {
  return VOWEL_MAPPINGS[raw]?.standalone ?? '';
}

/**
 * Resolve a consonant token to its Unicode character.
 */
export function consonantCharFor(raw: string): string {
  return CONSONANT_MAPPINGS[raw]?.char ?? raw;
}

/**
 * 'ng' special rule — DOCUMENTED on pramukhime.com/help/bodo-typing-help:
 *
 *   "The character 'ng' produces 'ं' unless followed by a vowel sign,
 *    then producing 'ंग'."
 *
 * @param nextToken — the lookahead token (may be undefined at end of input)
 * @returns the Unicode expansion for 'ng' given the lookahead
 *
 * When next is a vowel:  returns { prefix: U.ANUSVARA, conjunct: U.GA + mātrā }
 * Otherwise:             returns { prefix: U.ANUSVARA, conjunct: '' }
 */
export type NgExpansion = {
  /** Always the anusvara ं */
  anusvara: string;
  /** If next token is a vowel: U.GA + its mātrā string. Otherwise: '' */
  gaWithMatra: string;
  /** Advance the outer loop by 1 extra token (consume the vowel) */
  consumeNext: boolean;
};

export function expandNg(nextToken: Token | undefined): NgExpansion {
  if (nextToken && isVowelToken(nextToken)) {
    const m = matraFor(nextToken.raw);
    return {
      anusvara: U.ANUSVARA,
      gaWithMatra: U.GA + (m === '' ? '' : m), // inherent 'o' vowel on ग = just ग
      consumeNext: true,
    };
  }
  return { anusvara: U.ANUSVARA, gaWithMatra: '', consumeNext: false };
}

/**
 * Returns true if `char` is a Devanagari consonant codepoint in U+0900–U+097F.
 * Used to decide whether to insert halant when two consonants are adjacent.
 */
export function isDevanagariConsonant(char: string): boolean {
  const cp = char.codePointAt(0) ?? 0;
  // Consonants occupy U+0915–U+0939, U+0958–U+095F (nukta forms), U+0979–U+097F
  return (cp >= 0x0915 && cp <= 0x0939) || (cp >= 0x0958 && cp <= 0x095F);
}

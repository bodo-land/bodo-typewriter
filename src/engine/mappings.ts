/**
 * Complete key-to-Unicode mapping tables for the Bodo transliteration engine.
 *
 * Design principles
 * -----------------
 * • Consonants are listed here as Unicode strings; matra vs. standalone vowel
 *   selection happens in transliterator.ts at runtime.
 * • Every entry carries a `source` tag so callers can surface provenance.
 * • Keys are case-sensitive (e.g. 'I' ≠ 'i', 'NG' ≠ 'ng').
 *
 * Sources: DOCUMENTED = pramukhime.com/help/bodo-typing-help
 *          INFERRED   = Assamese chart + Devanagari conventions + Bodo phonology
 */

import { U } from './unicode';

export type Source = 'documented' | 'inferred';

export type VowelEntry = {
  /** Independent vowel form (used at word-start or after another vowel) */
  standalone: string;
  /** Mātrā form (used after a consonant); empty string = inherent vowel (no sign) */
  matra: string;
  source: Source;
};

export type ConsonantEntry = {
  char: string;
  source: Source;
};

export type SpecialEntry = {
  output: string;
  source: Source;
};

// ── Vowels ─────────────────────────────────────────────────────────────────
// Ordered longest-first to aid the tokenizer.
export const VOWEL_MAPPINGS: Record<string, VowelEntry> = {
  // 3+ char sequences first
  // NOTE: 'ong' intentionally omitted — 'o' + 'ng' produces अं naturally (o=अ standalone, ng=anusvara)
  //       and including 'ong' would greedily consume "gonga" wrong (g+ong+a instead of g+o+ng+g+a).
  'oM':  { standalone: U.A + U.ANUSVARA, matra: U.ANUSVARA, source: 'documented' }, // अं / ं
  'oo':  { standalone: U.UU,  matra: U.M_UU,  source: 'inferred'   }, // ऊ / ू
  'ou':  { standalone: U.AU,  matra: U.M_AU,  source: 'documented' }, // औ / ौ
  'wo':  { standalone: U.AU,  matra: U.M_AU,  source: 'documented' }, // औ / ौ
  'wi':  { standalone: U.AI,  matra: U.M_AI,  source: 'documented' }, // ऐ / ै
  'ai':  { standalone: U.AI,  matra: U.M_AI,  source: 'documented' }, // ऐ / ै
  'ee':  { standalone: U.II,  matra: U.M_II,  source: 'inferred'   }, // ई / ी
  'Ri':  { standalone: U.RI,  matra: U.M_RI,  source: 'inferred'   }, // ऋ / ृ
  'RI':  { standalone: U.RII, matra: U.M_RII, source: 'inferred'   }, // ॠ / ॄ
  // 2-char modifier sequences
  'ng':  { standalone: U.ANUSVARA, matra: U.ANUSVARA, source: 'documented' }, // ं — context rule in transliterator
  // 1-char sequences
  'a':   { standalone: U.AA,  matra: U.M_AA,  source: 'documented' }, // आ / ा
  'A':   { standalone: U.AA,  matra: U.M_AA,  source: 'documented' }, // आ / ा
  'i':   { standalone: U.I,   matra: U.M_I,   source: 'documented' }, // इ / ि
  // 'I' used to be documented as य (consonant) instead of ई — overridden
  // per explicit request so short/long i/I pairs with इ/ई the same way
  // u/U already pairs with उ/ऊ. य is now reachable only via 'y'. 'ee'
  // still works too (kept as an alias, not removed).
  'I':   { standalone: U.II,  matra: U.M_II,  source: 'inferred'   }, // ई / ी
  'u':   { standalone: U.U,   matra: U.M_U,   source: 'documented' }, // उ / ु
  'U':   { standalone: U.UU,  matra: U.M_UU,  source: 'inferred'   }, // ऊ / ू
  'e':   { standalone: U.E,   matra: U.M_E,   source: 'documented' }, // ए / े
  'w':   { standalone: U.O,   matra: U.M_O,   source: 'documented' }, // ओ / ो
  'o':   { standalone: U.A,   matra: '',       source: 'documented' }, // अ / (none) — inherent vowel, emits nothing as matra
  'M':   { standalone: U.ANUSVARA, matra: U.ANUSVARA, source: 'documented' }, // ं
};

// ── Consonants ──────────────────────────────────────────────────────────────
// Ordered longest-first.
export const CONSONANT_MAPPINGS: Record<string, ConsonantEntry> = {
  // 3+ char sequences
  'khy': { char: U.KHA + U.HALANT + U.SSA, source: 'inferred' }, // ख्ष — conjunct kṣ
  'NYo': { char: U.NYA, source: 'inferred' }, // ञ — base form of ञ

  // 2-char sequences with aspirated variants
  'wao': { char: U.WAO, source: 'inferred' }, // वाव
  'yao': { char: U.YAO, source: 'inferred' }, // याव

  // 2-char sequences
  'NG':  { char: U.NGA,  source: 'documented' }, // ङ
  'NY':  { char: U.NYA,  source: 'inferred'   }, // ञ
  'kh':  { char: U.KHA,  source: 'documented' }, // ख
  'gh':  { char: U.GHA,  source: 'inferred'   }, // घ
  'ch':  { char: U.CHA,  source: 'inferred'   }, // छ
  'jh':  { char: U.JHA,  source: 'inferred'   }, // झ
  'Th':  { char: U.TTHA, source: 'inferred'   }, // ठ
  'Dh':  { char: U.DDHA, source: 'inferred'   }, // ढ
  'th':  { char: U.THA,  source: 'documented' }, // थ
  'dh':  { char: U.DHA,  source: 'documented' }, // ध
  'ph':  { char: U.PHA,  source: 'documented' }, // फ
  'bh':  { char: U.BHA,  source: 'inferred'   }, // भ
  'sh':  { char: U.SHA,  source: 'inferred'   }, // श
  'xh':  { char: U.SHA,  source: 'inferred'   }, // श
  'Xh':  { char: U.SSA,  source: 'inferred'   }, // ष

  // 1-char sequences (single keystroke consonants)
  'k':   { char: U.KA,  source: 'documented' }, // क — Bodo's default 'k' sound
  'g':   { char: U.GA,   source: 'documented' }, // ग
  'c':   { char: U.CA,   source: 'inferred'   }, // च
  'C':   { char: U.CHA,  source: 'inferred'   }, // छ
  'j':   { char: U.JA,   source: 'documented' }, // ज
  'J':   { char: U.JHA,  source: 'inferred'   }, // झ
  'T':   { char: U.TTA,  source: 'inferred'   }, // ट
  'D':   { char: U.DDA,  source: 'inferred'   }, // ड
  'N':   { char: U.NNA,  source: 'inferred'   }, // ण
  // 't'/'p' were originally mapped to their aspirated counterparts थ/फ
  // (pramukhime.com documents this as "Bodo's default t/p sound"), which
  // meant 'th'/'ph' and plain 't'/'p' all produced the same output and
  // त/प had no key of their own. Overridden per explicit request so
  // 't' → त and 'p' → प, matching the unaspirated/aspirated pairing
  // used everywhere else in the table (kh/gh/ch/jh/etc.) — this is a
  // deliberate departure from the documented Pramukh IME behavior, not
  // an oversight.
  't':   { char: U.TA,   source: 'inferred' }, // त
  'd':   { char: U.DA,   source: 'documented' }, // द
  'n':   { char: U.NA,   source: 'documented' }, // न
  'p':   { char: U.PA,   source: 'inferred' }, // प
  'f':   { char: U.PHA,  source: 'documented' }, // फ
  'b':   { char: U.BA,   source: 'documented' }, // ब
  'B':   { char: U.BHA,  source: 'inferred'   }, // भ
  'm':   { char: U.MA,   source: 'documented' }, // म
  'y':   { char: U.YA,   source: 'documented' }, // य — 'I' used to also work here (documented as "य = I/y") but now means ई instead, see VOWEL_MAPPINGS
  'r':   { char: U.RA,   source: 'documented' }, // र
  'l':   { char: U.LA,   source: 'documented' }, // ल
  'L':   { char: U.LLA,  source: 'inferred'   }, // ऴ
  'O':   { char: U.VA,   source: 'documented' }, // व — capital O (Bodo semi-vowel)
  'v':   { char: U.VA,   source: 'inferred'   }, // व
  'S':   { char: U.SHA,  source: 'inferred'   }, // श
  'x':   { char: U.SSA,  source: 'inferred'   }, // ष
  's':   { char: U.SA,   source: 'documented' }, // स
  'h':   { char: U.HA,   source: 'documented' }, // ह
};

/**
 * Keys that require 'o' suffix to produce the unaspirated base consonant.
 * Pattern from Assamese chart: ক = ko, ত = to, প = po.
 * In Bodo, these aspirated-default consonants have unaspirated counterparts.
 *
 * INFERRED — following Assamese/PramukhIndic convention.
 */
export const UNASPIRATED_BASES: Record<string, string> = {
  'ko': U.KA, // क
  'to': U.TA, // त
  'po': U.PA, // प
};

// ── Special / symbol mappings ───────────────────────────────────────────────
export const SPECIAL_MAPPINGS: Record<string, SpecialEntry> = {
  '||':  { output: U.DOUBLE_DANDA, source: 'documented' }, // ॥
  '+-':  { output: U.SWASTIKA,     source: 'documented' }, // 卍
  '.a':  { output: U.AVAGRAHA,     source: 'documented' }, // ऽ
  'Rs':  { output: U.RUPEE,        source: 'documented' }, // ₹
  'OM':  { output: U.OM,           source: 'documented' }, // ॐ
  '|':   { output: U.DANDA,        source: 'documented' }, // ।
  "'":   { output: U.MODIFIER_APOSTROPHE, source: 'documented' }, // ʼ
  // Visarga: emitted as suffix diacritic regardless of context (INFERRED)
  'H':   { output: U.VISARGA,      source: 'inferred'   }, // ः
};

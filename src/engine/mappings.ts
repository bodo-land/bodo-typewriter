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
  'oM':  { standalone: U.A + U.ANUSVARA, matra: U.ANUSVARA, source: 'documented' },
  'oo':  { standalone: U.UU,  matra: U.M_UU,  source: 'inferred'   },
  'ou':  { standalone: U.AU,  matra: U.M_AU,  source: 'documented' },
  'wo':  { standalone: U.AU,  matra: U.M_AU,  source: 'documented' },
  'wi':  { standalone: U.AI,  matra: U.M_AI,  source: 'documented' },
  'ai':  { standalone: U.AI,  matra: U.M_AI,  source: 'documented' },
  'ee':  { standalone: U.II,  matra: U.M_II,  source: 'inferred'   },
  'Ri':  { standalone: U.RI,  matra: U.M_RI,  source: 'inferred'   },
  'RI':  { standalone: U.RII, matra: U.M_RII, source: 'inferred'   },
  // 2-char modifier sequences
  'ng':  { standalone: U.ANUSVARA, matra: U.ANUSVARA, source: 'documented' }, // context rule in transliterator
  // 1-char sequences
  'a':   { standalone: U.AA,  matra: U.M_AA,  source: 'documented' },
  'A':   { standalone: U.AA,  matra: U.M_AA,  source: 'documented' },
  'i':   { standalone: U.I,   matra: U.M_I,   source: 'documented' },
  // NOTE: 'I' (capital I) is DOCUMENTED as mapping to य (consonant), not ई.
  //       Use 'ee' for ई (inferred from Assamese chart).
  'u':   { standalone: U.U,   matra: U.M_U,   source: 'documented' },
  'U':   { standalone: U.UU,  matra: U.M_UU,  source: 'inferred'   },
  'e':   { standalone: U.E,   matra: U.M_E,   source: 'documented' },
  'w':   { standalone: U.O,   matra: U.M_O,   source: 'documented' },
  'o':   { standalone: U.A,   matra: '',       source: 'documented' }, // inherent vowel — emits nothing as matra
  'M':   { standalone: U.ANUSVARA, matra: U.ANUSVARA, source: 'documented' },
};

// ── Consonants ──────────────────────────────────────────────────────────────
// Ordered longest-first.
export const CONSONANT_MAPPINGS: Record<string, ConsonantEntry> = {
  // 3+ char sequences
  'khy': { char: U.KHA + U.HALANT + U.SSA, source: 'inferred' }, // conjunct kṣ
  'NYo': { char: U.NYA, source: 'inferred' }, // base form of ञ

  // 2-char sequences with aspirated variants
  'wao': { char: U.WAO, source: 'inferred' }, // वाव
  'yao': { char: U.YAO, source: 'inferred' }, // वाव

  // 2-char sequences
  'NG':  { char: U.NGA,  source: 'documented' },
  'NY':  { char: U.NYA,  source: 'inferred'   },
  'kh':  { char: U.KHA,  source: 'documented' },
  'gh':  { char: U.GHA,  source: 'inferred'   },
  'ch':  { char: U.CHA,  source: 'inferred'   }, // छ
  'jh':  { char: U.JHA,  source: 'inferred'   },
  'Th':  { char: U.TTHA, source: 'inferred'   },
  'Dh':  { char: U.DDHA, source: 'inferred'   },
  'th':  { char: U.THA,  source: 'documented' },
  'dh':  { char: U.DHA,  source: 'documented' },
  'ph':  { char: U.PHA,  source: 'documented' },
  'bh':  { char: U.BHA,  source: 'inferred'   },
  'sh':  { char: U.SHA,  source: 'inferred'   },
  'xh':  { char: U.SHA,  source: 'inferred'   },
  'Xh':  { char: U.SSA,  source: 'inferred'   },

  // 1-char sequences (single keystroke consonants)
  'k':   { char: U.KHA,  source: 'documented' }, // ख — Bodo's default 'k' sound
  'g':   { char: U.GA,   source: 'documented' },
  'c':   { char: U.CA,   source: 'inferred'   }, // च
  'C':   { char: U.CHA,  source: 'inferred'   }, // छ
  'j':   { char: U.JA,   source: 'documented' },
  'J':   { char: U.JHA,  source: 'inferred'   },
  'T':   { char: U.TTA,  source: 'inferred'   },
  'D':   { char: U.DDA,  source: 'inferred'   },
  'N':   { char: U.NNA,  source: 'inferred'   },
  't':   { char: U.THA,  source: 'documented' }, // थ — Bodo's default 't' sound
  'd':   { char: U.DA,   source: 'documented' },
  'n':   { char: U.NA,   source: 'documented' },
  'p':   { char: U.PHA,  source: 'documented' }, // फ — Bodo's default 'p' sound
  'f':   { char: U.PHA,  source: 'documented' },
  'b':   { char: U.BA,   source: 'documented' },
  'B':   { char: U.BHA,  source: 'inferred'   },
  'm':   { char: U.MA,   source: 'documented' },
  'y':   { char: U.YA,   source: 'documented' },
  'I':   { char: U.YA,   source: 'documented' }, // capital I = य (DOCUMENTED: "य = I/y")
  'r':   { char: U.RA,   source: 'documented' },
  'l':   { char: U.LA,   source: 'documented' },
  'L':   { char: U.LLA,  source: 'inferred'   },
  'O':   { char: U.VA,   source: 'documented' }, // व — capital O (Bodo semi-vowel)
  'v':   { char: U.VA,   source: 'inferred'   },
  'S':   { char: U.SHA,  source: 'inferred'   },
  'x':   { char: U.SSA,  source: 'inferred'   },
  's':   { char: U.SA,   source: 'documented' },
  'h':   { char: U.HA,   source: 'documented' },
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
  '||':  { output: U.DOUBLE_DANDA, source: 'documented' },
  '+-':  { output: U.SWASTIKA,     source: 'documented' },
  '.a':  { output: U.AVAGRAHA,     source: 'documented' },
  'Rs':  { output: U.RUPEE,        source: 'documented' },
  'OM':  { output: U.OM,           source: 'documented' },
  '|':   { output: U.DANDA,        source: 'documented' },
  "'":   { output: U.MODIFIER_APOSTROPHE, source: 'documented' },
  // Visarga: emitted as suffix diacritic regardless of context (INFERRED)
  'H':   { output: U.VISARGA,      source: 'inferred'   },
};

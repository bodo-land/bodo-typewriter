/**
 * Devanagari consonant → English key quick-reference, in classical varga
 * order (same layout as any Sanskrit/Hindi consonant chart). Unlike
 * data/referenceData.ts (which lists every accepted spelling, aliases
 * included), this picks exactly one canonical key per letter — the
 * simplest one a newcomer should reach for — for a compact always-on
 * cheat sheet (see ConsonantKeyRail.tsx).
 *
 * Verified directly against transliterator.ts output, not just read off
 * mappings.ts — two letters turned up a real gap that way: 'त' and 'प'
 * have no working key in this engine. Bodo phonology treats the plain
 * consonant keys 't' and 'p' as their *aspirated* counterparts (था/फा,
 * "Bodo's default t/p sound" per mappings.ts), and the unaspirated forms'
 * intended fallback — UNASPIRATED_BASES's 'to'/'po' — is dead code the
 * tokenizer never reads (confirmed: "to"+"a" transliterates as थ + आ,
 * two separate tokens, not त). So key: null for those two, honestly.
 */

export type ConsonantKey = {
  devanagari: string;
  /** null = not currently reachable by typing anything in this engine. */
  key: string | null;
};

export const CONSONANT_KEYS: ConsonantKey[] = [
  { devanagari: 'क', key: 'k' },
  { devanagari: 'ख', key: 'kh' },
  { devanagari: 'ग', key: 'g' },
  { devanagari: 'घ', key: 'gh' },
  { devanagari: 'ङ', key: 'NG' },

  { devanagari: 'च', key: 'c' },
  { devanagari: 'छ', key: 'ch' },
  { devanagari: 'ज', key: 'j' },
  { devanagari: 'झ', key: 'jh' },
  { devanagari: 'ञ', key: 'NY' },

  { devanagari: 'ट', key: 'T' },
  { devanagari: 'ठ', key: 'Th' },
  { devanagari: 'ड', key: 'D' },
  { devanagari: 'ढ', key: 'Dh' },
  { devanagari: 'ण', key: 'N' },

  { devanagari: 'त', key: null },
  { devanagari: 'थ', key: 't' },
  { devanagari: 'द', key: 'd' },
  { devanagari: 'ध', key: 'dh' },
  { devanagari: 'न', key: 'n' },

  { devanagari: 'प', key: null },
  { devanagari: 'फ', key: 'p' },
  { devanagari: 'ब', key: 'b' },
  { devanagari: 'भ', key: 'bh' },
  { devanagari: 'म', key: 'm' },

  { devanagari: 'य', key: 'y' },
  { devanagari: 'र', key: 'r' },
  { devanagari: 'ल', key: 'l' },
  { devanagari: 'व', key: 'v' },

  { devanagari: 'श', key: 'sh' },
  { devanagari: 'ष', key: 'x' },
  { devanagari: 'स', key: 's' },

  { devanagari: 'ह', key: 'h' },
];

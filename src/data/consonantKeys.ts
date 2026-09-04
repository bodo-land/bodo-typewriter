/**
 * Devanagari consonant → English key quick-reference, in classical varga
 * order (same layout as any Sanskrit/Hindi consonant chart). Unlike
 * data/referenceData.ts (which lists every accepted spelling, aliases
 * included), this picks exactly one canonical key per letter — the
 * simplest one a newcomer should reach for — for a compact always-on
 * cheat sheet (see ConsonantKeyRail.tsx).
 *
 * Verified directly against transliterator.ts output rather than just
 * read off mappings.ts — this is what caught 't'/'p' originally landing
 * on थ/फ instead of त/प (mappings.ts used to alias them to their
 * aspirated counterparts, following documented Pramukh IME behavior).
 * That's since been overridden in mappings.ts itself so 't' → त and
 * 'p' → प for real, matching every other unaspirated/aspirated pair
 * in this chart — not just relabeled here.
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

  { devanagari: 'त', key: 't' },
  { devanagari: 'थ', key: 'th' },
  { devanagari: 'द', key: 'd' },
  { devanagari: 'ध', key: 'dh' },
  { devanagari: 'न', key: 'n' },

  { devanagari: 'प', key: 'p' },
  { devanagari: 'फ', key: 'ph' },
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

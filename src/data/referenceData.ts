/**
 * Static reference data for the Script Reference panel's Vowels tab. The
 * consonant reference now lives in data/consonantKeys.ts (verified against
 * the real engine, not the phonetic chart) — see ConsonantKeyRail.tsx.
 *
 * The `english` values below are the actual engine keys (verified against
 * transliterator.ts output), not a phonetic/IPA-style romanization — two
 * entries turned up real gaps that way, the same category of bug as
 * consonantKeys.ts's त/प finding:
 *   - ई is 'I' (short/long pair with इ, same pattern as उ/ऊ = u/U).
 *     Capital 'I' used to alias य instead — mappings.ts now gives ई its
 *     own vowel entry so 'I' means ई and य is reachable only via 'y'.
 *   - ऋ is 'Ri' (capital R), not 'ri' — lowercase tokenizes as र+इ (रि).
 *   - औ is 'wo' (or 'ou') — 'ow' tokenizes as two separate vowels (अओ).
 *   - ः (visarga) is capital 'H' — 'ah' just produces आह.
 *   - ँ (chandrabindu) has no working key at all in this engine —
 *     unicode.ts documents one ("-/~") but it was never wired into
 *     mappings.ts, so both are silent no-ops. english: null, like
 *     consonantKeys.ts's त/प.
 */

export type ChartRow = { output: string; diacritic?: string; english: string | null; ipa?: string };

export const VOWEL_REF: ChartRow[] = [
  { output: 'अ',  diacritic: '—',  english: 'o',    ipa: '[o]' },
  { output: 'आ',  diacritic: 'ा',  english: 'a',    ipa: '[a]' },
  { output: 'इ',  diacritic: 'ि',  english: 'i',    ipa: '[i]' },
  { output: 'ई',  diacritic: 'ी',  english: 'I',    ipa: '[i]' },
  { output: 'उ',  diacritic: 'ु',  english: 'u',    ipa: '[u]' },
  { output: 'ऊ',  diacritic: 'ू',  english: 'U',    ipa: '[u]' },
  { output: 'ऋ',  diacritic: 'ृ',  english: 'Ri',   ipa: '[ri]' },
  { output: 'ए',  diacritic: 'े',  english: 'e',    ipa: '[e]' },
  { output: 'ऐ',  diacritic: 'ै',  english: 'wi',   ipa: '[oi/ɯi]' },
  { output: 'ओ',  diacritic: 'ो',  english: 'w',    ipa: '[ɯ]' },
  { output: 'औ',  diacritic: 'ौ',  english: 'wo',   ipa: '[ɯu]' },
  { output: 'ं',  diacritic: '—',  english: 'ng',   ipa: '[ŋ]' },
  { output: 'ः',  diacritic: '—',  english: 'H',    ipa: '[h]' },
  { output: 'ँ',  diacritic: '—',  english: null,   ipa: '[ ̃ ]' },
];

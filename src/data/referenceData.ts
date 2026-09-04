/**
 * Static reference data for the Script Reference panel's Vowels tab. The
 * consonant reference now lives in data/consonantKeys.ts (verified against
 * the real engine, not the phonetic chart) — see ConsonantKeyRail.tsx.
 */

export type ChartRow = { output: string; diacritic?: string; english: string; ipa?: string };

export const VOWEL_REF: ChartRow[] = [
  { output: 'अ',  diacritic: '—',  english: 'ô',    ipa: '[o]' },
  { output: 'आ',  diacritic: 'ा',  english: 'a',    ipa: '[a]' },
  { output: 'इ',  diacritic: 'ि',  english: 'i',    ipa: '[i]' },
  { output: 'ई',  diacritic: 'ी',  english: 'ī',    ipa: '[i]' },
  { output: 'उ',  diacritic: 'ु',  english: 'u',    ipa: '[u]' },
  { output: 'ऊ',  diacritic: 'ू',  english: 'ū',    ipa: '[u]' },
  { output: 'ऋ',  diacritic: 'ृ',  english: 'ri',   ipa: '[ri]' },
  { output: 'ए',  diacritic: 'े',  english: 'e',    ipa: '[e]' },
  { output: 'ऐ',  diacritic: 'ै',  english: 'ŵi',   ipa: '[oi/ɯi]' },
  { output: 'ओ',  diacritic: 'ो',  english: 'ŵ',    ipa: '[ɯ]' },
  { output: 'औ',  diacritic: 'ौ',  english: 'ŵu',   ipa: '[ɯu]' },
  { output: 'ं',  diacritic: '—',  english: 'ṅg',   ipa: '[ŋ]' },
  { output: 'ः',  diacritic: '—',  english: 'ah',   ipa: '[h]' },
  { output: 'ँ',  diacritic: '—',  english: 'ṅ',    ipa: '[ ̃ ]' },
];

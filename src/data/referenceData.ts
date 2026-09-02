/**
 * Static reference data for the Script Reference panel's Vowels tab. The
 * consonant reference now lives in data/consonantKeys.ts (verified against
 * the real engine, not the phonetic chart) — see ConsonantKeyRail.tsx.
 */

export type ChartRow = { output: string; diacritic?: string; roman: string; ipa?: string };

export const VOWEL_REF: ChartRow[] = [
  { output: 'अ',  diacritic: '—',  roman: 'ô',    ipa: '[o]' },
  { output: 'आ',  diacritic: 'ा',  roman: 'a',    ipa: '[a]' },
  { output: 'इ',  diacritic: 'ि',  roman: 'i',    ipa: '[i]' },
  { output: 'ई',  diacritic: 'ी',  roman: 'ī',    ipa: '[i]' },
  { output: 'उ',  diacritic: 'ु',  roman: 'u',    ipa: '[u]' },
  { output: 'ऊ',  diacritic: 'ू',  roman: 'ū',    ipa: '[u]' },
  { output: 'ऋ',  diacritic: 'ृ',  roman: 'ri',   ipa: '[ri]' },
  { output: 'ए',  diacritic: 'े',  roman: 'e',    ipa: '[e]' },
  { output: 'ऐ',  diacritic: 'ै',  roman: 'ŵi',   ipa: '[oi/ɯi]' },
  { output: 'ओ',  diacritic: 'ो',  roman: 'ŵ',    ipa: '[ɯ]' },
  { output: 'औ',  diacritic: 'ौ',  roman: 'ŵu',   ipa: '[ɯu]' },
  { output: 'ं',  diacritic: '—',  roman: 'ṅg',   ipa: '[ŋ]' },
  { output: 'ः',  diacritic: '—',  roman: 'ah',   ipa: '[h]' },
  { output: 'ँ',  diacritic: '—',  roman: 'ṅ',    ipa: '[ ̃ ]' },
];

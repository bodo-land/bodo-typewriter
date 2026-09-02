/**
 * Static reference data for the Script Reference panel. Vowels & consonants
 * are the phonetic chart transcribed from bodo_deva.md, not the app's
 * typing-key scheme — see SPECIAL_REF and docs/13-key-and-unicode-reference.md
 * for the actual input keys.
 */

export type ChartRow = { output: string; diacritic?: string; roman: string; ipa?: string };
export type RefRow = { keys: string[]; output: string; label: string };
export type ExampleRow = { roman: string; devanagari: string; meaning: string };

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

// Consonant chart ("खौरां हांखो :: व्यंजन वर्ण :: Consonant") — full 5x5
// Devanagari grid plus the semivowel/sibilant/conjunct row and the two
// nasal diacritics, each with the simple phonetic romanization given.
export const CONSONANT_REF: ChartRow[] = [
  { output: 'क', roman: 'k' },
  { output: 'ख', roman: 'kh' },
  { output: 'ग', roman: 'g' },
  { output: 'घ', roman: 'gh' },
  { output: 'ङ', roman: 'ng' },
  { output: 'च', roman: 'c' },
  { output: 'छ', roman: 'ch' },
  { output: 'ज', roman: 'j' },
  { output: 'झ', roman: 'jh' },
  { output: 'ञ', roman: 'ny' },
  { output: 'ट', roman: 't' },
  { output: 'ठ', roman: 'th' },
  { output: 'ड', roman: 'd' },
  { output: 'ढ', roman: 'dh' },
  { output: 'ण', roman: 'n' },
  { output: 'त', roman: 't' },
  { output: 'थ', roman: 'th' },
  { output: 'द', roman: 'd' },
  { output: 'ध', roman: 'dh' },
  { output: 'न', roman: 'n' },
  { output: 'प', roman: 'p' },
  { output: 'फ', roman: 'ph' },
  { output: 'ब', roman: 'b' },
  { output: 'भ', roman: 'bh' },
  { output: 'म', roman: 'm' },
  { output: 'य', roman: 'y' },
  { output: 'र', roman: 'r' },
  { output: 'ल', roman: 'l' },
  { output: 'व', roman: 'w' },
  { output: 'श', roman: 'sh' },
  { output: 'ष', roman: 'sh' },
  { output: 'स', roman: 's' },
  { output: 'ह', roman: 'h' },
  { output: 'क्ष', roman: 'khy' },
  { output: 'ड़', roman: 'r' },
  { output: 'ं', roman: 'angsaar' },
  { output: 'ँ', roman: 'akhaaphur' },
];

export const SPECIAL_REF: RefRow[] = [
  { keys: ['|'],    output: '।',  label: 'Danda (sentence full stop)' },
  { keys: ['||'],   output: '॥',  label: 'Double danda' },
  { keys: ['.a'],   output: 'ऽ',  label: 'Avagraha' },
  { keys: ["'"],    output: 'ʼ',  label: 'Glottal apostrophe' },
  { keys: ['OM'],   output: 'ॐ',  label: 'Om' },
  { keys: ['Rs'],   output: '₹',  label: 'Rupee sign' },
];

export const EXAMPLES: ExampleRow[] = [
  { roman: 'bwdw',     devanagari: 'बोदो',      meaning: 'Bodo (the language)' },
  { roman: 'khwn',     devanagari: 'खोन',       meaning: 'Ear' },
  { roman: 'gonga',    devanagari: 'गंगा',      meaning: 'Ganga (river)' },
  { roman: 'bwdwland', devanagari: 'बोदोलान्ड', meaning: 'Bodoland' },
  { roman: 'sang',     devanagari: 'सां',       meaning: 'With (nasal)' },
  { roman: 'OM',       devanagari: 'ॐ',         meaning: 'Om' },
];

/**
 * Devanagari Unicode constants used by the Bodo Pramukh-compatible IME.
 *
 * Sources:
 *   DOCUMENTED  — explicitly stated on pramukhime.com/help/bodo-typing-help
 *   INFERRED    — derived from Assamese chart (pramukhindic-assamese.png),
 *                 standard Devanagari conventions, or Bodo phonology
 */

export const U = {
  // ── Independent vowels ─────────────────────────────────────────────────
  A:   'अ', // अ  — DOCUMENTED (key: o)
  AA:  'आ', // आ  — DOCUMENTED (key: a/A)
  I:   'इ', // इ  — DOCUMENTED (key: i)
  II:  'ई', // ई  — INFERRED   (key: ee/I)
  U:   'उ', // उ  — DOCUMENTED (key: u)
  UU:  'ऊ', // ऊ  — INFERRED   (key: oo/U)
  RI:  'ऋ', // ऋ  — INFERRED   (key: Ri)
  RII: 'ॠ', // ॠ  — INFERRED   (key: RI)
  E:   'ए', // ए  — DOCUMENTED (key: e)
  AI:  'ऐ', // ऐ  — DOCUMENTED (key: wi/ai)
  O:   'ओ', // ओ  — DOCUMENTED (key: w)
  AU:  'औ', // औ  — DOCUMENTED (key: wo/ou)

  // ── Vowel signs (mātrās) ───────────────────────────────────────────────
  M_AA:  'ा', // ा  — DOCUMENTED (key: a/A)
  M_I:   'ि', // ि  — DOCUMENTED (key: i)
  M_II:  'ी', // ी  — INFERRED   (key: ee/I)
  M_U:   'ु', // ु  — DOCUMENTED (key: u)
  M_UU:  'ू', // ू  — INFERRED   (key: oo/U)
  M_RI:  'ृ', // ृ  — INFERRED   (key: Ri)
  M_RII: 'ॄ', // ॄ  — INFERRED   (key: RI)
  M_E:   'े', // े  — DOCUMENTED (key: e)
  M_AI:  'ै', // ै  — DOCUMENTED (key: wi/ai)
  M_O:   'ो', // ो  — DOCUMENTED (key: w)
  M_AU:  'ौ', // ौ  — DOCUMENTED (key: wo/ou)

  // ── Diacritics ─────────────────────────────────────────────────────────
  ANUSVARA:    'ं', // ं  — DOCUMENTED (key: ng/M)
  VISARGA:     'ः', // ः  — INFERRED   (key: H)
  CHANDRABINDU:'ँ', // ँ  — INFERRED   (key: -/~)
  HALANT:      '्', // ्  — derived    (inserted between consonant clusters)
  AVAGRAHA:    'ऽ', // ऽ  — DOCUMENTED (key: .a)

  // ── Consonants ─────────────────────────────────────────────────────────
  // Velars
  KA:  'क', // क  — INFERRED   (key: ko — unaspirated, following Assamese pattern)
  KHA: 'ख', // ख  — DOCUMENTED (key: k/kh)
  GA:  'ग', // ग  — DOCUMENTED (key: g)
  GHA: 'घ', // घ  — INFERRED   (key: gh)
  NGA: 'ङ', // ङ  — DOCUMENTED (key: NG)

  // Palatals
  CA:  'च', // च  — INFERRED   (key: c)
  CHA: 'छ', // छ  — INFERRED   (key: C/ch)
  JA:  'ज', // ज  — DOCUMENTED (key: j)
  JHA: 'झ', // झ  — INFERRED   (key: jh/J)
  NYA: 'ञ', // ञ  — INFERRED   (key: NY)
  WAO: 'वाव', // वाव — INFERRED   (key: wao)
  YAO: 'याव', // याव — INFERRED   (key: yao)

  // Retroflexes
  TTA:  'ट', // ट  — INFERRED   (key: T)
  TTHA: 'ठ', // ठ  — INFERRED   (key: Th)
  DDA:  'ड', // ड  — INFERRED   (key: D)
  DDHA: 'ढ', // ढ  — INFERRED   (key: Dh)
  NNA:  'ण', // ण  — INFERRED   (key: N)

  // Dentals
  TA:  'त', // त  — INFERRED   (key: to — unaspirated, following Assamese pattern)
  THA: 'थ', // थ  — DOCUMENTED (key: t/th)
  DA:  'द', // द  — DOCUMENTED (key: d)
  DHA: 'ध', // ध  — DOCUMENTED (key: dh)
  NA:  'न', // न  — DOCUMENTED (key: n)

  // Labials
  PA:  'प', // प  — INFERRED   (key: po — unaspirated)
  PHA: 'फ', // फ  — DOCUMENTED (key: p/ph/f)
  BA:  'ब', // ब  — DOCUMENTED (key: b)
  BHA: 'भ', // भ  — INFERRED   (key: bh/B)
  MA:  'म', // म  — DOCUMENTED (key: m)

  // Semivowels / liquids / sibilants
  YA:  'य', // य  — DOCUMENTED (key: y — capital 'I' used to also work but now means ई instead)
  RA:  'र', // र  — DOCUMENTED (key: r)
  LA:  'ल', // ल  — DOCUMENTED (key: l)
  LLA: 'ऴ', // ऴ  — INFERRED   (key: L) — U+0934 LLLA, not U+0933 LLA (ळ), despite the constant's name
  VA:  'व', // व  — DOCUMENTED (key: O  — capital-O)
  SHA: 'श', // श  — INFERRED   (key: S/sh/xh)
  SSA: 'ष', // ष  — INFERRED   (key: x/Xh)
  SA:  'स', // स  — DOCUMENTED (key: s)
  HA:  'ह', // ह  — DOCUMENTED (key: h)

  // Special Bodo characters
  MODIFIER_APOSTROPHE: 'ʼ', // ʼ — DOCUMENTED (key: ')

  // Punctuation / symbols
  DANDA:        '।', // ।  — DOCUMENTED (key: |)
  DOUBLE_DANDA: '॥', // ॥  — DOCUMENTED (key: ||)
  OM:           'ॐ', // ॐ  — DOCUMENTED (key: OM)
  RUPEE:        '₹', // ₹  — DOCUMENTED (key: Rs)
  SWASTIKA:     '卍', // 卐  — DOCUMENTED (key: +-)
} as const;

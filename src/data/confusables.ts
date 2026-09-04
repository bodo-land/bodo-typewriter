/**
 * Groups of English keys that are easy to mix up while typing, each producing
 * a different Bodo Devanagari result.
 *
 * Every unaspirated/aspirated consonant pair in mappings.ts is covered here
 * as a trailing-'h' pair (checked directly against transliterate() output,
 * not just read off the table) — capital-letter case-variants (C, J, etc.)
 * are deliberately excluded even where they'd also work, in favor of the
 * plain lowercase '+h' spelling everywhere.
 * Still parked (not deleted, not yet re-checked): o/O/w, u/U, m/M, h/H,
 * the N retroflex nasal, l/L, and the x sibilant.
 *
 *   - 'c'/'ch' → च vs छ.
 *   - 'j'/'jh' → ज vs झ.
 *   - 'k'/'kh' → क vs ख.
 *   - 'g'/'gh' → ग vs घ.
 *   - 'T'/'Th' → ट vs ठ.
 *   - 'D'/'Dh' → ड vs ढ.
 *   - 't'/'th' → त vs थ.
 *   - 'd'/'dh' → द vs ध.
 *   - 'p'/'ph' → प vs फ.
 *   - 'b'/'bh' → ब vs भ.
 *   - 's'/'sh' → स vs श.
 *   - 'i'/'I' → इ vs ई, short/long vowel pair (same pattern as u/U for
 *     उ/ऊ). Capital 'I' used to alias य (a consonant) instead, making
 *     this the most dangerous pair in the set since it crossed
 *     categories — fixed directly in mappings.ts, not just here.
 *   - 'a'/'A' → both आ, in every context (standalone and after a
 *     consonant) — a confirmed no-op between just the two of them:
 *     getSuggestions() only ever offers an alternative that produces
 *     different output, so 'a' will never suggest 'A' on its own. It's
 *     'e' joining this group (below) that makes 'a' actually useful to
 *     have here — 'a' vs 'e' IS a real difference (सा vs से).
 *   - 'e' → phonetic guess (not a case relation) that 'e' and 'a' are
 *     close enough to mix up — e.g. typing "se" when "sa" was meant.
 *     Folded into the a/A group rather than its own pair because 'sa'
 *     and 'sA' produce the identical सा; grouping all three together
 *     means "se" correctly offers just one "sa" suggestion (the dedupe
 *     in getSuggestionSections picks 'a' over 'A' since it comes first),
 *     not two near-identical "sa"/"sA" chips.
 *   - 'ai'/'ae'/'ay' → not single English keys but three spellings typists
 *     use for the same "ai"-ish sound, each tokenizing differently:
 *     "ai" is one diphthong token (नै), "ae" is two vowel tokens 'a'+'e'
 *     (नाए), and "ay" is a vowel token 'a' followed by the consonant 'y'
 *     (नाय) — three genuinely different outputs for what a typist may
 *     think of as one sound (e.g. "thang_nai" vs "thang_nae" vs
 *     "thang_nay"). getSuggestionSections() matches this family against
 *     a *pair* of adjacent tokens too (not just a single token), so
 *     "ae" and "ay" are found the same way "ai" is, and any one of the
 *     three suggests the other two.
 */
export const CONFUSABLE_FAMILIES: string[][] = [
  ['c', 'ch'],
  ['j', 'jh'],
  ['k', 'kh'],
  ['g', 'gh'],
  ['T', 'Th'],
  ['D', 'Dh'],
  ['t', 'th'],
  ['d', 'dh'],
  ['p', 'ph'],
  ['b', 'bh'],
  ['s', 'sh'],
  ['a', 'A', 'e'],
  ['i', 'I'],
  ['ai', 'ae', 'ay'],
];

/**
 * Groups of English keys that are easy to mix up while typing, each producing
 * a different Bodo Devanagari result.
 *
 * WORK IN PROGRESS — deliberately narrowed to 4 case pairs for now (the
 * rest of the previously-explored set — o/O/w, u/U, m/M, h/H, the t/d/n
 * retroflex families, b/B, l/L, and the s/sh/x sibilant group — is parked,
 * not deleted permanently; re-add groups here one at a time as they're
 * revisited).
 *
 * Each pair below is same-letter-different-case, checked against
 * src/engine/mappings.ts:
 *   - 'c'/'C' → च vs छ (unaspirated vs aspirated) — genuinely different.
 *   - 'j'/'J' → ज vs झ (unaspirated vs aspirated) — genuinely different.
 *   - 'i'/'I' → इ (vowel) vs य (consonant) — genuinely different, and the
 *     most dangerous of the four since it crosses categories.
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
  ['c', 'C'],
  ['j', 'J'],
  ['a', 'A', 'e'],
  ['i', 'I'],
  ['ai', 'ae', 'ay'],
];

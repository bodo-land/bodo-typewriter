/**
 * Groups of Roman keys that are easy to mix up while typing, each producing
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
 *     consonant) — this one is a confirmed no-op: getSuggestions() only
 *     ever offers an alternative that produces different output, so 'a'/
 *     'A' will never actually show a suggestion chip. Kept in the list
 *     anyway since it was asked for explicitly; if the mapping table ever
 *     changes so they diverge, this starts working with no code change.
 */
export const CONFUSABLE_FAMILIES: string[][] = [
  ['c', 'C'],
  ['j', 'J'],
  ['a', 'A'],
  ['i', 'I'],
];

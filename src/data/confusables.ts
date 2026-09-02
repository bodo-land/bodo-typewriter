/**
 * Groups of Roman keys that are easy to mix up while typing, each producing
 * a different Bodo Devanagari result. Two different kinds of confusion are
 * mixed together here (see the comment on each group):
 *
 *  - Verified from the mapping tables: same letter, different case (e.g.
 *    'o' vs 'O'), or a plain/aspirated/retroflex family that shares a
 *    letter (e.g. 't'/'th'/'T'/'Th'). These are exact — checked against
 *    src/engine/mappings.ts.
 *  - Phonetic guesses: letters that aren't related in the code at all (no
 *    shared prefix, no case, no alias) but sound close enough that a Bodo
 *    typist might type one meaning another (e.g. e/i/y). These are
 *    judgment calls, not derived facts — revise this list if any of these
 *    groupings are wrong or incomplete.
 *
 * Each group deliberately DOES include multiple spellings of the same sound
 * (e.g. श is 'S', 'sh', AND 'xh' below) — that's needed so lookup works no
 * matter which spelling the user actually typed (a word using "they" needs
 * its 'th' token to resolve to this family just as much as a word using
 * 't' does). getSuggestions() is what's responsible for never *offering*
 * two aliases of the same sound as separate suggestions — it dedupes by
 * resulting output, keeping only the first spelling it finds for each
 * distinct result. Don't try to solve that here by removing aliases; that
 * just breaks lookup for whichever spelling got removed.
 */
export const CONFUSABLE_FAMILIES: string[][] = [
  // "o" family — verified case-pair (o/O) + phonetic: 'w' is also
  // documented as "vowel o", so all three are "o-ish" romanizations that
  // land in completely different places: अ (vowel), व (consonant), ओ (vowel).
  ['o', 'O', 'w'],

  // "i" family — verified case-pair (i/I: vowel vs consonant) + phonetic
  // guess that e/y are close enough to mix up too. 'y' is the same output
  // as 'I' (both य) — kept for lookup, deduped at suggestion time.
  ['i', 'I', 'y', 'ee', 'e'],

  // "u" family — verified: short vs long u. 'oo' is the same output as 'U'
  // (both ऊ) — kept for lookup, deduped at suggestion time.
  ['u', 'U', 'oo'],

  // "m" family — verified case-pair: consonant vs anusvara diacritic.
  ['m', 'M'],

  // "h" family — verified case-pair: consonant vs visarga diacritic.
  ['h', 'H'],

  // "t" family — verified: dental vs retroflex, plain and aspirated. 'th'
  // is the same output as 't' (both थ) — kept for lookup, deduped at
  // suggestion time.
  ['t', 'th', 'T', 'Th'],

  // "d" family — verified: dental vs retroflex, plain and aspirated — all
  // four are genuinely different sounds (द/ध/ड/ढ), no aliases here.
  ['d', 'dh', 'D', 'Dh'],

  // "n" family — verified case-pair: dental vs retroflex nasal.
  ['n', 'N'],

  // "c" family — verified: unaspirated vs aspirated. 'ch' is the same
  // output as 'C' (both छ) — kept for lookup, deduped at suggestion time.
  ['c', 'C', 'ch'],

  // "j" family — verified: unaspirated vs aspirated. 'jh' is the same
  // output as 'J' (both झ) — kept for lookup, deduped at suggestion time.
  ['j', 'J', 'jh'],

  // "b" family — verified: unaspirated vs aspirated. 'bh' is the same
  // output as 'B' (both भ) — kept for lookup, deduped at suggestion time.
  ['b', 'B', 'bh'],

  // "l" family — verified case-pair: an unrelated consonant, not just aspiration.
  ['l', 'L'],

  // "s" family — verified: स/श/ष sibilants. 'sh'/'xh' are the same output
  // as 'S' (all श); 'Xh' is the same output as 'x' (both ष) — kept for
  // lookup, deduped at suggestion time.
  ['s', 'S', 'sh', 'xh', 'x', 'Xh'],
];

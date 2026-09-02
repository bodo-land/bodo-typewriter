import { tokenize } from '../engine/tokenizer';
import { transliterate } from '../engine/transliterator';
import { CONFUSABLE_FAMILIES } from '../data/confusables';

export type SuggestionOption = {
  key: string;
  /** The full segment with this option applied — e.g. "fwr", not just "w". */
  roman: string;
  unicode: string;
  /** True for the option matching what the user actually typed for this segment. */
  isCurrent: boolean;
};

export type SuggestionGroup = {
  /** Token index within the segment (not the whole buffer). */
  tokenIndex: number;
  /** Every distinct-output spelling for this position, current one included. */
  options: SuggestionOption[];
};

export type SuggestionSection = {
  /** Index among "_"-delimited segments of the buffer. */
  segmentIndex: number;
  segment: string;
  groups: SuggestionGroup[];
};

function familyFor(key: string): string[] | undefined {
  return CONFUSABLE_FAMILIES.find(family => family.includes(key));
}

/** Cap so a word with several confusable letters doesn't flood the UI. */
const MAX_OPTIONS_PER_GROUP = 6;

/**
 * 'M' (and 'ng', same rule, though it isn't in any family today) aren't a
 * simple 1-for-1 substitute the way the rest of the confusable keys are:
 * per the ng context rule in transliterator.ts, immediately before a vowel
 * they expand into anusvara + ग + that vowel's mark, not just their own
 * character. So "ma" → "Ma" isn't really "the same word with one letter
 * swapped", it's मा → ंगा — a structurally different result that reads as
 * a broken suggestion rather than a helpful one. Away from a following
 * vowel (word-end, before a consonant) 'M' is just anusvara and behaves
 * like any other simple swap, e.g. "khalam" → "khalaM" (खालाम → खालां) is
 * fine and stays offered.
 */
const CONTEXT_SENSITIVE_KEYS = new Set(['M', 'ng']);

function isContextSensitiveBeforeVowel(key: string, nextToken: { kind: string } | undefined): boolean {
  return CONTEXT_SENSITIVE_KEYS.has(key) && nextToken?.kind === 'vowel';
}

/**
 * The composing buffer can be a chain of independent "words" joined by the
 * silent "_" boundary marker (see transliterator.ts) — e.g. "fo_ra_y" is
 * three words typed as one buffer. Suggestions only make sense per-word:
 * comparing "did you mean" alternatives across a word boundary would be
 * meaningless. So this splits on "_" first and evaluates each segment on
 * its own — the UI renders one section per segment, and a fresh "_"
 * naturally starts a new section as soon as the user types it.
 *
 * Within a segment, this tokenizes it (the same tokenizer the real engine
 * uses, so multi-character keys like "th" are treated as one unit), finds
 * every token that belongs to a confusable family (data/confusables.ts),
 * and for that position lists every distinct-output spelling in the
 * family — the one the user actually typed included, so the UI can show
 * "here's what you have, and here's what else you could have meant" as
 * one comparable list of full words (e.g. "fwr → फोर", "fOr → फ्व्र",
 * "for → फर"), not just the single swapped letter.
 */
export function getSuggestionSections(romanBuffer: string): SuggestionSection[] {
  if (!romanBuffer) return [];

  const segments = romanBuffer.split('_');
  const sections: SuggestionSection[] = [];

  segments.forEach((segment, segmentIndex) => {
    if (!segment) return;

    const tokens = tokenize(segment);
    const groups: SuggestionGroup[] = [];

    tokens.forEach((token, tokenIndex) => {
      const family = familyFor(token.raw);
      if (!family) return;

      const before = tokens.slice(0, tokenIndex).map(t => t.raw).join('');
      const after = tokens.slice(tokenIndex + 1).map(t => t.raw).join('');
      const seenOutputs = new Set<string>();
      const options: SuggestionOption[] = [];

      const currentUnicode = transliterate(segment);
      seenOutputs.add(currentUnicode);
      options.push({ key: token.raw, roman: segment, unicode: currentUnicode, isCurrent: true });

      const nextToken = tokens[tokenIndex + 1];

      for (const altKey of family) {
        if (altKey === token.raw) continue;
        if (isContextSensitiveBeforeVowel(altKey, nextToken)) continue;
        const roman = before + altKey + after;
        const unicode = transliterate(roman);
        if (seenOutputs.has(unicode)) continue;
        seenOutputs.add(unicode);
        options.push({ key: altKey, roman, unicode, isCurrent: false });
      }

      // A group of one (just the current spelling, no real alternatives) isn't useful.
      if (options.length > 1) {
        groups.push({ tokenIndex, options: options.slice(0, MAX_OPTIONS_PER_GROUP) });
      }
    });

    if (groups.length > 0) sections.push({ segmentIndex, segment, groups });
  });

  return sections;
}

/**
 * Rebuilds the full "_"-joined buffer with one segment's Roman text
 * replaced — used when the user clicks a suggestion chip.
 */
export function applySuggestionToBuffer(romanBuffer: string, segmentIndex: number, newSegmentRoman: string): string {
  const segments = romanBuffer.split('_');
  segments[segmentIndex] = newSegmentRoman;
  return segments.join('_');
}

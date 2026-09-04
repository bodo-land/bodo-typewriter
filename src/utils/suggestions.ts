import { tokenize } from '../engine/tokenizer';
import { transliterate } from '../engine/transliterator';
import { CONFUSABLE_FAMILIES } from '../data/confusables';

export type SuggestionOption = {
  key: string;
  /** The full segment with this option applied — e.g. "fwr", not just "w". */
  english: string;
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
 *
 * Most families are matched against a single token's raw text. The
 * "ai"/"ae" family is the exception: "ai" tokenizes as one token, but
 * "ae" tokenizes as two adjacent vowel tokens ('a' then 'e'), since "ae"
 * isn't a direct mapping of its own. So at each position this first tries
 * matching a *pair* of adjacent tokens' concatenated raw text (to catch
 * "ae"), and only falls back to the single token if that pair doesn't
 * belong to any family — letting the same family work in both directions.
 */
export function getSuggestionSections(englishBuffer: string): SuggestionSection[] {
  if (!englishBuffer) return [];

  const segments = englishBuffer.split('_');
  const sections: SuggestionSection[] = [];

  segments.forEach((segment, segmentIndex) => {
    if (!segment) return;

    const tokens = tokenize(segment);
    const groups: SuggestionGroup[] = [];

    let i = 0;
    while (i < tokens.length) {
      const pairRaw = i + 1 < tokens.length ? tokens[i].raw + tokens[i + 1].raw : undefined;
      const pairFamily = pairRaw ? familyFor(pairRaw) : undefined;
      const span = pairFamily ? 2 : 1;
      const raw = pairFamily ? pairRaw! : tokens[i].raw;
      const family = pairFamily ?? familyFor(tokens[i].raw);

      if (!family) { i += 1; continue; }

      const before = tokens.slice(0, i).map(t => t.raw).join('');
      const after = tokens.slice(i + span).map(t => t.raw).join('');
      const seenOutputs = new Set<string>();
      const options: SuggestionOption[] = [];

      const currentUnicode = transliterate(segment);
      seenOutputs.add(currentUnicode);
      options.push({ key: raw, english: segment, unicode: currentUnicode, isCurrent: true });

      const nextToken = tokens[i + span];

      for (const altKey of family) {
        if (altKey === raw) continue;
        if (span === 1 && isContextSensitiveBeforeVowel(altKey, nextToken)) continue;
        const english = before + altKey + after;
        const unicode = transliterate(english);
        if (seenOutputs.has(unicode)) continue;
        seenOutputs.add(unicode);
        options.push({ key: altKey, english, unicode, isCurrent: false });
      }

      // A group of one (just the current spelling, no real alternatives) isn't useful.
      if (options.length > 1) {
        groups.push({ tokenIndex: i, options: options.slice(0, MAX_OPTIONS_PER_GROUP) });
      }

      i += span;
    }

    if (groups.length > 0) sections.push({ segmentIndex, segment, groups });
  });

  return sections;
}

/**
 * Rebuilds the full "_"-joined buffer with one segment's English text
 * replaced — used when the user clicks a suggestion chip.
 */
export function applySuggestionToBuffer(englishBuffer: string, segmentIndex: number, newSegmentEnglish: string): string {
  const segments = englishBuffer.split('_');
  segments[segmentIndex] = newSegmentEnglish;
  return segments.join('_');
}

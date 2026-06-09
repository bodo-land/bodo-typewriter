/**
 * Longest-match tokenizer for the Bodo transliteration engine.
 *
 * Algorithm
 * ---------
 * All recognised token keys (from every mapping table) are merged into one
 * flat list sorted by key LENGTH DESCENDING.  At each position the first
 * matching key wins — this is the classic "maximal munch" / longest-match rule.
 *
 * Why a single list?
 * ------------------
 * Splitting by category and checking consonants before vowels would cause
 * short consonant keys ('n', len 1) to beat longer vowel keys ('ng', len 2).
 * True longest-match prevents that: 'ng' (len 2) always wins over 'n' (len 1).
 *
 * When two keys have the SAME length, a tiebreaker order applies:
 *   special > consonant > vowel
 * In practice no two tables share the same key string, so ties are uncommon.
 *
 * UNASPIRATED_BASES ('ko', 'to', 'po') are NOT included in the tokenizer.
 * They are exported as documentation but omitted here because 'ko' would
 * greedily consume 'k' + 'ou', breaking the documented 'kou' → खौ mapping.
 *
 * Unrecognised characters pass through unchanged (digits, spaces, etc.).
 */

import { VOWEL_MAPPINGS, CONSONANT_MAPPINGS, SPECIAL_MAPPINGS } from './mappings';

export type TokenKind = 'vowel' | 'consonant' | 'special' | 'passthrough';

export type Token = {
  raw: string;
  kind: TokenKind;
};

type Entry = { key: string; kind: TokenKind };

function makeEntries(obj: Record<string, unknown>, kind: TokenKind): Entry[] {
  return Object.keys(obj).map(key => ({ key, kind }));
}

// Merge all tables, sort by length DESC, then by category priority for equal lengths.
const CATEGORY_PRIORITY: Record<TokenKind, number> = {
  special: 0,
  consonant: 1,
  vowel: 2,
  passthrough: 3,
};

const ALL_ENTRIES: Entry[] = [
  ...makeEntries(SPECIAL_MAPPINGS, 'special'),
  ...makeEntries(CONSONANT_MAPPINGS, 'consonant'),
  ...makeEntries(VOWEL_MAPPINGS, 'vowel'),
].sort((a, b) => {
  const lenDiff = b.key.length - a.key.length;
  if (lenDiff !== 0) return lenDiff;
  return CATEGORY_PRIORITY[a.kind] - CATEGORY_PRIORITY[b.kind];
});

/**
 * Tokenise a Roman-script input string into a sequence of typed tokens.
 *
 * @example
 * tokenize('khan')
 * // → [
 * //   { raw: 'kh', kind: 'consonant' },  // 'kh' (len 2) beats 'k' (len 1)
 * //   { raw: 'a',  kind: 'vowel'     },
 * //   { raw: 'n',  kind: 'consonant' },
 * // ]
 *
 * @example
 * tokenize('sang')
 * // → [
 * //   { raw: 's',  kind: 'consonant' },
 * //   { raw: 'a',  kind: 'vowel'     },
 * //   { raw: 'ng', kind: 'vowel'     }, // 'ng' (len 2) beats 'n' (len 1)
 * // ]
 */
export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    let matched = false;

    for (const entry of ALL_ENTRIES) {
      if (input.startsWith(entry.key, i)) {
        tokens.push({ raw: entry.key, kind: entry.kind });
        i += entry.key.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      tokens.push({ raw: input[i], kind: 'passthrough' });
      i++;
    }
  }

  return tokens;
}

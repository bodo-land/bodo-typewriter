/**
 * Longest-match tokenizer for the Bodo transliteration engine.
 *
 * Algorithm
 * ---------
 * All recognised token keys are inserted into a prefix trie at module load.
 * At each input position the trie is walked one character at a time; the
 * deepest node that carries a valid TokenKind is the longest match.
 *
 * Complexity: O(n × k) where k = max key length (3), i.e. effectively O(n).
 * Previous linear scan was O(n × m) with m = 61 entries.
 *
 * UNASPIRATED_BASES ('ko', 'to', 'po') are NOT in the trie (same reason as
 * before: 'ko' would greedily consume 'k' + 'ou').
 *
 * Unrecognised characters pass through unchanged (digits, spaces, etc.).
 *
 * Duplicate-key guard
 * -------------------
 * In development, buildTrie asserts that no two mapping tables share the same
 * key string.  A duplicate would cause one entry's kind to silently overwrite
 * the other's in the trie (ENG-008).
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

// ─── Trie ─────────────────────────────────────────────────────────────────────

type TrieNode = {
  children: Map<string, TrieNode>;
  kind: TokenKind | null; // non-null = this node is a valid token endpoint
};

function newNode(): TrieNode {
  return { children: new Map(), kind: null };
}

function buildTrie(entries: Entry[]): TrieNode {
  // Guard against duplicate keys across mapping tables in development (ENG-008).
  // Optional chaining: import.meta.env only exists under Vite/Vitest, not
  // when this module is imported by a plain Node script (e.g. tests/convert.ts).
  if (import.meta.env?.DEV) {
    const seen = new Map<string, TokenKind>();
    for (const { key, kind } of entries) {
      if (seen.has(key)) {
        throw new Error(
          `Duplicate trie key "${key}": first as ${seen.get(key)}, now as ${kind}. ` +
          'Check VOWEL_MAPPINGS, CONSONANT_MAPPINGS, and SPECIAL_MAPPINGS for conflicts.',
        );
      }
      seen.set(key, kind);
    }
  }

  const root = newNode();
  for (const { key, kind } of entries) {
    let node = root;
    for (const ch of key) {
      if (!node.children.has(ch)) node.children.set(ch, newNode());
      node = node.children.get(ch)!;
    }
    node.kind = kind;
  }
  return root;
}

const ALL_ENTRIES: Entry[] = [
  ...makeEntries(SPECIAL_MAPPINGS, 'special'),
  ...makeEntries(CONSONANT_MAPPINGS, 'consonant'),
  ...makeEntries(VOWEL_MAPPINGS, 'vowel'),
];

const ROOT = buildTrie(ALL_ENTRIES);

/**
 * Tokenise a Roman-script input string into a sequence of typed tokens.
 *
 * @example
 * tokenize('khan')
 * // → [
 * //   { raw: 'kh', kind: 'consonant' },  // trie walks 'k'→'h', longest wins
 * //   { raw: 'a',  kind: 'vowel'     },
 * //   { raw: 'n',  kind: 'consonant' },
 * // ]
 *
 * @example
 * tokenize('sang')
 * // → [
 * //   { raw: 's',  kind: 'consonant' },
 * //   { raw: 'a',  kind: 'vowel'     },
 * //   { raw: 'ng', kind: 'vowel'     }, // trie walks 'n'→'g', longest wins
 * // ]
 */
export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    let node = ROOT;
    let lastKind: TokenKind | null = null;
    let lastEnd = i;
    let j = i;

    // Walk the trie, tracking the deepest valid token endpoint seen so far.
    while (j < input.length) {
      const child = node.children.get(input[j]);
      if (!child) break;
      node = child;
      j++;
      if (node.kind !== null) {
        lastKind = node.kind;
        lastEnd = j;
      }
    }

    if (lastKind !== null) {
      tokens.push({ raw: input.slice(i, lastEnd), kind: lastKind });
      i = lastEnd;
    } else {
      tokens.push({ raw: input[i], kind: 'passthrough' });
      i++;
    }
  }

  return tokens;
}

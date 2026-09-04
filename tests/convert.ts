/**
 * Manual conversion/comparison tool for real-world Bodo text — NOT an
 * automated test. Run it by hand and eyeball the result; there's no
 * pass/fail here.
 *
 * The files under tests/markdown/*.md are real Bodo prose in Devanagari
 * (e.g. pages of a grammar textbook) with no English-input counterpart. This
 * script lets you write your own guess at the English input for a passage,
 * run it through the actual transliteration engine, and see line-by-line
 * where it agrees or disagrees with the reference text — without having
 * to write formal test assertions for text whose "correct" English spelling
 * is your own hypothesis, not a documented fact.
 *
 * Usage:
 *   npm run convert -- <englishInputFile>                  # just print the conversion
 *   npm run convert -- <englishInputFile> <referenceFile>   # convert + diff against reference
 *
 * A mismatch here is not necessarily an engine bug — it may just mean the
 * guessed English input doesn't match this engine's key scheme. See
 * docs/13-key-and-unicode-reference.md for the actual key → Unicode rules,
 * and docs/05-special-rules.md for the ng/halant/inherent-vowel rules.
 */

import { readFileSync } from 'node:fs';
import { transliterate } from '../src/engine/transliterator';

function firstDiffIndex(a: string, b: string): number {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) return i;
  }
  return a.length === b.length ? -1 : len;
}

function main() {
  const [, , englishPath, referencePath] = process.argv;

  if (!englishPath) {
    console.error('Usage: npm run convert -- <englishInputFile> [referenceFile]');
    process.exit(1);
  }

  const englishText = readFileSync(englishPath, 'utf8');
  const converted = transliterate(englishText);

  if (!referencePath) {
    console.log(converted);
    return;
  }

  const reference = readFileSync(referencePath, 'utf8');
  const convertedLines = converted.split('\n');
  const referenceLines = reference.split('\n');
  const lineCount = Math.max(convertedLines.length, referenceLines.length);

  let matches = 0;
  for (let i = 0; i < lineCount; i++) {
    const a = (convertedLines[i] ?? '').trim();
    const b = (referenceLines[i] ?? '').trim();

    if (a === b) {
      matches++;
      if (a) console.log(`  ✓ ${a}`);
      continue;
    }

    console.log(`  ✗ line ${i + 1}`);
    console.log(`      converted: ${a || '(empty)'}`);
    console.log(`      reference: ${b || '(empty)'}`);
    const diffAt = firstDiffIndex(a, b);
    if (diffAt >= 0) {
      console.log(`      first diff at char ${diffAt}: ${JSON.stringify(a[diffAt] ?? '')} vs ${JSON.stringify(b[diffAt] ?? '')}`);
    }
  }

  console.log(`\n${matches}/${lineCount} lines match`);
}

main();

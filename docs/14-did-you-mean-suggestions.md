# Chapter 14 — "Did You Mean?" Suggestions

## 14.1 The Problem It Solves

In this engine, a single keystroke can send you to a completely different
letter. Typing `s` gives स, but forget the `h` and mean to type `sh` and
you get श instead — two unrelated-looking Devanagari letters, one
keystroke apart. Same story for `c`/`ch`, `t`/`th`, `i`/`I`, and a dozen
other pairs. A typist who doesn't notice the slip ends up with a word
that's subtly, silently wrong.

"Did You Mean?" watches what you're composing and, the moment it detects
you've typed something from a known confusable pair, shows you the *other*
spelling and what it would produce — side by side, so you can compare and
click to swap if you meant the other one.

```
Type:  thang_nai
See:   Did You Mean
         theng → थें
         nae   → नाए
         nay   → नाय
```

## 14.2 The Data — `src/data/confusables.ts`

Everything the feature knows about "these keys are easy to mix up" lives
in one array:

```ts
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
```

A **family** is just a list of keys where typing any one of them for a
given letter position could plausibly have meant any of the others. Most
families here are the unaspirated/aspirated consonant pairs (drop the
`h`, land on a different letter) — `k`/`kh`, `c`/`ch`, `t`/`th`, and so on
through `s`/`sh`. The rest are special cases:

- **`['i', 'I']`** — short/long vowel pair (इ/ई), the same pattern as
  `u`/`U` for उ/ऊ. This one used to be dangerous: `I` was originally
  documented as an alias for य (a *consonant*), so this family could
  suggest jumping from a vowel to a consonant mid-word. That's fixed in
  the engine itself now (`mappings.ts` gives ई its own `'I'` key), not
  just papered over here.
- **`['a', 'A', 'e']`** — `a` and `A` produce the *identical* आ in every
  context, so on their own they'd never suggest each other (the code only
  ever offers alternatives with *different* output). `e` joins the group
  because "se" vs "sa" is a real, easy phonetic slip — folding it into
  the same family (rather than giving it its own `['a', 'e']` pair) means
  typing `se` correctly offers just one `sa` suggestion, not two
  near-identical `sa`/`sA` chips.
- **`['ai', 'ae', 'ay']`** — three different spellings of the same
  "ai"-ish sound that a typist might reach for, each tokenizing
  completely differently under the hood (see 14.3.3 below).

Every single family here was verified against the *real* engine output
before being added — never just assumed from how the keys look. See
14.7 for the exact verification method, since it's the same one used
every time this list grows.

**Deliberately excluded:** capital-letter case variants like `C` and `J`
used to be in here too (since `C`/`ch` both → छ and `J`/`jh` both → झ),
but they were dropped once the lowercase `+h` pair covered the same
ground — one consistent spelling per suggestion instead of two ways to
reach the same one.

**Still parked** (known to exist, not yet re-verified/re-added):
`o`/`O`/`w`, `u`/`U`, `m`/`M`, `h`/`H`, the retroflex nasal `N`, `l`/`L`,
and the `x` sibilant.

## 14.3 Generating Suggestions — `src/utils/suggestions.ts`

The entry point is one function:

```ts
export function getSuggestionSections(englishBuffer: string): SuggestionSection[]
```

It's called on every keystroke with the *composing buffer* — the raw
English text the user is currently typing, before it's committed. Here's
what it does, step by step.

### 14.3.1 Split on "_"

The composing buffer can be a chain of independent words joined by the
silent `_` word-boundary marker (e.g. `"fo_ra_y"` is three words typed as
one buffer — see Chapter 5 for what `_` does in the transliterator
itself). Suggestions only make sense *per word*: comparing alternatives
across a word boundary would be meaningless. So the first thing
`getSuggestionSections` does is `englishBuffer.split('_')` and evaluates
each segment independently. The UI renders one labeled section per
segment, and a fresh `_` naturally starts a new section the instant the
user types it.

### 14.3.2 Tokenize each segment

Each segment is run through the exact same `tokenize()` the real
transliterator uses (Chapter 7), so multi-character keys like `"th"` are
already correctly recognized as one unit rather than `"t"` + `"h"`. This
guarantees the suggestion engine and the actual typing engine always
agree about where one "letter" ends and the next begins.

### 14.3.3 Find confusable positions — single token or a pair

For each token position, the code checks whether that token's raw text
is in a confusable family. Most of the time this is a plain single-token
lookup: the token `"th"` in `"thang"` is looked up directly against
`familyFor('th')`, which finds `['t', 'th']`.

The `ai`/`ae`/`ay` family is the exception, and it exists specifically
*because* single-token lookup isn't enough for it:

| Spelling | Tokenizes as | Why |
|---|---|---|
| `ai` | one token `ai` | direct vowel mapping |
| `ae` | two tokens `a` + `e` | `"ae"` has no mapping of its own |
| `ay` | two tokens `a` + `y` | vowel `a` followed by consonant `y` |

So at every position, `getSuggestionSections` first tries matching a
**pair** of adjacent tokens' concatenated raw text (catching `"ae"` and
`"ay"`), and only falls back to the single token if that pair isn't a
known family. This is what lets `nai`, `nae`, and `nay` all suggest each
other regardless of which one you actually typed.

### 14.3.4 Build the options list

Once a family is found at a position, the code builds one `SuggestionOption`
per family member that would produce **different, not-yet-seen** output:

```ts
const currentUnicode = transliterate(segment);
seenOutputs.add(currentUnicode);
options.push({ key: raw, english: segment, unicode: currentUnicode, isCurrent: true });

for (const altKey of family) {
  if (altKey === raw) continue;
  const english = before + altKey + after;
  const unicode = transliterate(english);
  if (seenOutputs.has(unicode)) continue;   // dedup — see a/A/e above
  seenOutputs.add(unicode);
  options.push({ key: altKey, english, unicode, isCurrent: false });
}
```

The current spelling is always computed and included first (marked
`isCurrent: true`) — the UI filters it back out before rendering (see
14.4), but keeping it in the data means the dedup logic (`seenOutputs`)
naturally prevents suggesting an alternative that happens to produce the
exact same output you already have.

### 14.3.5 One exception: `M`/`ng` before a vowel

`'M'` and `'ng'` aren't simple 1-for-1 substitutes the way the rest of
the confusable keys are. Per the `ng` context rule (Chapter 5), immediately
before a vowel they expand into anusvara + ग + that vowel's mark, not just
their own character — so swapping `'m'` → `'M'` right before a vowel
wouldn't read as "the same word with one letter changed," it'd be a
structurally different, confusing-looking result (`मा` → `ंगा`). This case
is explicitly skipped:

```ts
const CONTEXT_SENSITIVE_KEYS = new Set(['M', 'ng']);
function isContextSensitiveBeforeVowel(key, nextToken) {
  return CONTEXT_SENSITIVE_KEYS.has(key) && nextToken?.kind === 'vowel';
}
```

Away from a following vowel (word-end, before a consonant), `'M'` is just
a plain anusvara and behaves like any other simple swap.

### 14.3.6 Cap and finish

Each position's option list is capped at `MAX_OPTIONS_PER_GROUP = 6` so a
word with several confusable letters doesn't flood the UI. A group with
only the current spelling and no real alternative isn't shown at all
(`options.length > 1` check) — no point suggesting nothing.

## 14.4 Applying a Suggestion

```ts
export function applySuggestionToBuffer(englishBuffer: string, segmentIndex: number, newSegmentEnglish: string): string
```

Clicking a suggestion chip calls this to rebuild the whole `_`-joined
buffer with just that one segment swapped out, then feeds the result back
into the composing buffer (`ime.setEnglish(...)`) and refocuses the input.
Only the clicked segment changes — every other word in the buffer is left
untouched.

## 14.5 The UI — `Suggestions.tsx` and the "Did You Mean" tab

`Suggestions.tsx` renders the `SuggestionSection[]` from
`getSuggestionSections` as a vertical list: one labeled group per segment
(`"Did you mean (2)"` when there's more than one segment in play), each
containing full-word chips (`kbd` + `→` + the Devanagari result) — showing
the complete alternate word, not just the single swapped letter, so it
reads as "here's what you have vs. here's what else you could have
meant" rather than a cryptic single-character diff. It deliberately
filters out `isCurrent` options before rendering — only the *other*
spellings are shown, since the user can already see what they typed in
the input box above; echoing it back would just be noise.

This list lives inside `ReferencePanel.tsx` as one of its tabs
(`'suggestions'`, labeled "Did You Mean" in the tab strip), alongside
Vowels and Consonants — not as a separate floating panel. When there's
nothing to suggest, that tab shows a plain "Nothing to suggest right
now — keep typing." message instead of disappearing.

## 14.6 Auto-Opening — `App.tsx`

The panel doesn't just sit there waiting to be opened manually. `App.tsx`
watches `hasSuggestions` (`imeActive && suggestionSections.length > 0`)
and jumps straight to the "Did You Mean" tab the moment it goes true:

```ts
const hadSuggestions = useRef(false);
const prevSegmentCount = useRef(segmentCount);
useEffect(() => {
  const newSegment = segmentCount !== prevSegmentCount.current;
  if (hasSuggestions && (!hadSuggestions.current || newSegment)) {
    setReferenceOpen(true);
    setReferenceTab('suggestions');
  }
  hadSuggestions.current = hasSuggestions;
  prevSegmentCount.current = segmentCount;
}, [hasSuggestions, segmentCount]);
```

Two things trigger the auto-open, not just one:

1. **The plain rising edge** — `hasSuggestions` goes from false to true
   (you typed enough of a word to trigger a suggestion for the first
   time).
2. **A new `"_"`-delimited segment starts** — tracked via `segmentCount`.

The second trigger exists because of a real bug this exact mechanism used
to have: suggestions can stay continuously `true` *across* a `_`
boundary (e.g. in `"thang_nai"`, segment 0 `"thang"` already has a
suggestion before you even get to segment 1 `"nai"`). With only the
rising-edge check, manually closing the panel once would leave it closed
for every word you typed afterward, for the rest of the session, as long
as *something* stayed suggestible — which reads as "suggestions just
stopped working." Tracking segment count fixes that: starting a genuinely
new word always gets a fresh chance to auto-open, even right after you
dismissed the previous one. Refining the *same* word further after a
manual close intentionally does **not** reopen it — only moving on to a
new one does. That distinction is deliberate, not an oversight: the goal
is "don't nag about the word I just dismissed," not "never show me
anything again."

## 14.7 How to Add a New Confusable Family

This is the exact process used for every family currently in the list —
never skip straight to editing the array:

1. **Write a throwaway test** calling `transliterate()` directly on both
   candidate keys (plus a trailing vowel, e.g. `transliterate('sa')` vs
   `transliterate('sha')`) and log the result.
2. **Confirm the outputs are genuinely different.** If they're identical
   (like `a`/`A` on their own), the pair is a no-op and won't be offered
   by the dedup logic anyway — not worth adding by itself.
3. **Check for context-sensitivity.** Does either key behave differently
   depending on what follows it (like `M`/`ng` before a vowel)? If so, it
   may need an entry in `CONTEXT_SENSITIVE_KEYS` too, not just the family
   list.
4. **Add the pair to `CONFUSABLE_FAMILIES`** with a one-line comment
   explaining what it maps to.
5. **Delete the throwaway test**, then verify with `getSuggestionSections`
   directly (not just `transliterate`) on a couple of real words
   containing the new keys, checking the actual chips that would render —
   this is what catches dedup issues (e.g. two families accidentally
   producing the same output) before they reach the UI.
6. Run the full pipeline (`tsc -b`, lint, `vitest run`, `build`) — adding
   a family never breaks existing tests (it's pure data), but it's the
   standing checklist for every change in this codebase regardless.

## 14.8 Known Limitations

- Only single-position swaps are suggested. A word with two independent
  confusable letters gets two separate groups (one per position), not a
  combinatorial "all four ways to spell this" explosion.
- The `ai`/`ae`/`ay` pair-matching logic only looks at *adjacent* tokens —
  it can't catch a family that would require skipping a token in between.
- Suggestions are purely mechanical (family lookup), not dictionary-aware.
  There's no sense of "which spelling is a real word" — both sides of a
  family are always shown if they produce different output, regardless of
  whether either is meaningful in context.

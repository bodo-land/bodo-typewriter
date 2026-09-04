# Chapter 7 — The Tokenizer

## 7.1 What the Tokenizer Does

The tokenizer converts a raw Roman-script input string into a sequence of
**typed tokens**.  Each token has:

- `raw` — the matched key sequence (e.g. `"kh"`, `"ng"`, `"a"`)
- `kind` — one of `'vowel'`, `'consonant'`, `'special'`, `'passthrough'`

The transliterator then processes this token stream, never seeing the raw
string again.

---

## 7.2 The Longest-Match Algorithm

The tokenizer implements **maximal munch** (longest-match scanning):

> At each position in the input, try every known token from longest to
> shortest.  The first token that matches wins.

This is the only correct algorithm for this problem.  Without it, `"kh"`
could be parsed as `"k"` + `"h"` (two consonants) instead of `"kh"` (one
aspirated consonant), and `"ng"` would split into `"n"` (consonant) + `"g"`
(consonant) instead of the anusvara modifier.

### Pseudocode

```
tokens = []
i = 0
while i < len(input):
    matched = false
    for token_key in ALL_ENTRIES (sorted longest-first):
        if input[i:].startswith(token_key):
            tokens.append({ raw: token_key, kind: token_key.kind })
            i += len(token_key)
            matched = true
            break
    if not matched:
        tokens.append({ raw: input[i], kind: 'passthrough' })
        i += 1
return tokens
```

### Worked Examples

**Input: `"khan"`**
```
Position 0: try 'kh' (len 2) → input[0:2] = "kh" ✓ → token: {raw:'kh', kind:'consonant'}
Position 2: try 'a'  (len 1) → ✓ → token: {raw:'a',  kind:'vowel'}
Position 3: try 'n'  (len 1) → ✓ → token: {raw:'n',  kind:'consonant'}
Result: [ kh(C), a(V), n(C) ]
```

**Input: `"sang"`**
```
Position 0: try 's'  (len 1) → ✓ → token: {raw:'s',  kind:'consonant'}
Position 1: try 'ai' (len 2) → input[1:3] = "an" ✗
            try 'a'  (len 1) → ✓ → token: {raw:'a',  kind:'vowel'}
Position 2: try 'ng' (len 2) → input[2:4] = "ng" ✓ → token: {raw:'ng', kind:'vowel'}
Result: [ s(C), a(V), ng(V) ]   — 'ng' correctly wins over 'n'
```

**Input: `"kou"`**
```
Position 0: try 'kou' (no such token) ✗
            try 'ko'  (no such token — removed) ✗
            try 'k'   (len 1) → ✓ → token: {raw:'k', kind:'consonant'}
Position 1: try 'ou'  (len 2) → input[1:3] = "ou" ✓ → token: {raw:'ou', kind:'vowel'}
Result: [ k(C), ou(V) ]   — correctly: ख + ौ = खौ
```

**Input: `"gonga"`**
```
Position 0: 'g'  → consonant
Position 1: 'o'  → vowel (inherent)
Position 2: 'ng' → vowel (anusvara modifier, len 2 beats 'n' len 1)
Position 3: 'g'  → consonant
Position 4: 'a'  → vowel (AA mātrā)
Result: [ g(C), o(V), ng(V), g(C), a(V) ]  ✓
```

---

## 7.3 Token Priority and the Category Problem

### The Problem

All tokens are in one of four categories: special, consonant, vowel, passthrough.
A naïve implementation might check categories sequentially:

```
// WRONG approach
for key in SPECIAL_KEYS:  try match
for key in CONSONANT_KEYS:  try match
for key in VOWEL_KEYS:  try match
```

This fails because `CONSONANT_KEYS` (checked before `VOWEL_KEYS`) contains
`'n'` (length 1).  When parsing `"sang"`, at position 2 the engine would
match `'n'` before it ever gets to check `'ng'` (length 2, in VOWEL_KEYS).

Result with naïve approach:
```
sang → s(C), a(V), n(C), g(C) → स + ा + न + ् + ग = सान्ग  ✗
```

### The Solution — Single Sorted List

This engine merges **all** token keys from **all** tables into one flat array,
then sorts by **key length descending**:

```typescript
const ALL_ENTRIES: Entry[] = [
  ...makeEntries(SPECIAL_MAPPINGS, 'special'),
  ...makeEntries(CONSONANT_MAPPINGS, 'consonant'),
  ...makeEntries(VOWEL_MAPPINGS, 'vowel'),
].sort((a, b) => b.key.length - a.key.length || PRIORITY[a.kind] - PRIORITY[b.kind]);
```

Now `'ng'` (length 2) appears before `'n'` (length 1) in the list.  At any
position, the scan reaches `'ng'` first and matches it if possible.

### Tiebreaker for Equal Lengths

When two entries have the same key length, `CATEGORY_PRIORITY` breaks ties:
`special (0) > consonant (1) > vowel (2)`.

In practice this rarely matters because no two tables share the same key
string at the same length.  The most notable example is `'OM'` (length 2,
special) which doesn't conflict with anything else.

---

## 7.4 Collision Analysis

The following key sequences appear in multiple mapping tables and must be
handled correctly:

| Key | In which tables | Resolution |
|-----|----------------|-----------|
| `H` | CONSONANT (ह), SPECIAL (ः) | Moved to SPECIAL → always emits ः |
| `M` | VOWEL (anusvara) | No conflict |
| `I` | VOWEL (ई), formerly CONSONANT (य) | Removed from CONSONANT; 'I' → ई always (य is reachable only via 'y' now) |
| `w` | VOWEL (`w`→ओ), prefix of `wo`/`wi` | Longest-match: `wo`, `wi` (len 2) beat `w` (len 1) |
| `o` | VOWEL (`o`→अ), prefix of `ou`, `oo`, `oM` | Longest-match: multi-char entries beat `o` |

---

## 7.5 Tokens NOT Included (and Why)

### `ong` (removed)

Would produce अं, same as `o` + `ng`.  Including it causes "gonga" to
tokenise as `g + [ong] + a` → wrong output.  Removed deliberately.
See Chapter 5.5 for full explanation.

### UNASPIRATED_BASES: `ko`, `to`, `po` (excluded from tokeniser)

The Assamese chart suggests `ko` → क (unaspirated ka).  However, including
`ko` in the tokeniser causes `kou` to tokenise as `ko + u` (क + उ) instead
of `k + ou` (ख + ौ), breaking the documented `ou` → औ mapping.

These bases are defined in `UNASPIRATED_BASES` for reference but are not
added to `ALL_ENTRIES`.  They are effectively unsupported in the current
engine.  A future version could handle them via context-aware tokenisation.

---

## 7.6 Passthrough Tokens

Any character that matches nothing in any mapping table becomes a
`passthrough` token and is emitted unchanged into the output.

Common passthrough characters:
- Digits: `0`–`9`
- Spaces: ` ` (ASCII 32)
- Newlines: `\n`
- Punctuation: `.`, `,`, `?`, `!`, `(`, `)`, etc. (except those with mappings)
- Unknown uppercase: `K`, `P`, `Q`, etc.
- Latin letters not assigned: `q`, `z`, `X` (note: `x` → ष is assigned)

A passthrough token also resets the state machine to `initial`, so any
in-progress consonant cluster is committed before the passthrough character
is written.

---

## 7.7 Token Table Statistics

| Category | Count | Longest key |
|----------|-------|-------------|
| Special | 8 | `'||'` (2 chars), `'+-'` (2 chars), `'.a'` (2 chars), `'OM'` (2 chars), `'Rs'` (2 chars) |
| Consonant | 34 | `'khy'` (3 chars) |
| Vowel | 19 | `'oM'` (2 chars), `'ou'` (2 chars), `'wo'` (2 chars), etc. |
| **Total** | **61** | `'khy'` (3 chars) |

The token scan terminates at the first match per position.  In the worst
case (passthrough character), all 61 entries are checked.  In practice,
the first or second entry usually matches, making the tokeniser O(1)
amortised per character.

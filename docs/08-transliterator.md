# Chapter 8 — The Transliterator State Machine

## 8.1 Overview

The transliterator is a **single-pass left-to-right state machine** that
consumes a token stream and produces a Devanagari Unicode string.

```typescript
function transliterate(input: string): string {
  const tokens = tokenize(input);   // Chapter 7
  let out = '';
  let state: State = 'initial';
  let i = 0;
  while (i < tokens.length) {
    // ... process tokens[i] based on state ...
    i++;
  }
  return out;
}
```

---

## 8.2 States

```
┌──────────┐
│ INITIAL  │   Start of input, or just after a passthrough character.
└──────────┘   Next vowel → standalone. Next consonant → emit consonant.

┌──────────────────┐
│ AFTER_CONSONANT  │   A consonant was emitted last.
└──────────────────┘   Next vowel → mātrā (vowel sign).
                        Next consonant → halant + consonant (conjunct).

┌─────────────┐
│ AFTER_VOWEL │   A vowel was emitted last.
└─────────────┘   Next vowel → standalone (new syllable).
                   Next consonant → emit consonant (no halant).
```

---

## 8.3 State Transition Table

| Current State | Token Kind | Action | New State |
|---------------|-----------|--------|-----------|
| Any | `passthrough` | emit token.raw | `initial` |
| Any | `special` | emit mapped symbol | `initial` |
| `initial` | `vowel` | emit standalone vowel | `after_vowel` |
| `initial` | `consonant` | emit consonant | `after_consonant` |
| `after_consonant` | `vowel` (`o`) | inherent — emit nothing | `after_vowel` |
| `after_consonant` | `vowel` (other) | emit mātrā | `after_vowel` |
| `after_consonant` | `consonant` | emit HALANT + consonant | `after_consonant` |
| `after_vowel` | `vowel` | emit standalone vowel | `after_vowel` |
| `after_vowel` | `consonant` | emit consonant | `after_consonant` |
| Any | `ng`/`M` + next=vowel | emit ANUSVARA + GA + mātrā, skip next | `after_vowel` |
| Any | `ng`/`M` + next≠vowel | emit ANUSVARA | `after_vowel` |

---

## 8.4 Token Processing — Case by Case

### Case 1: Special Token

```typescript
if (token.kind === 'special') {
  out += SPECIAL_MAPPINGS[token.raw].output;
  state = 'initial';
}
```

Special tokens always reset state and emit their symbol unchanged.

---

### Case 2: Passthrough Token

```typescript
if (token.kind === 'passthrough') {
  out += token.raw;
  state = 'initial';
}
```

---

### Case 3: Consonant Token

```typescript
if (isConsonantToken(token)) {
  const cChar = consonantCharFor(token.raw);
  if (state === 'after_consonant') {
    out += U.HALANT + cChar;  // conjunct formation
  } else {
    out += cChar;
  }
  state = 'after_consonant';
}
```

The key point: if already `after_consonant`, the **previous** consonant
already sits in `out`.  We only append halant + new consonant.

---

### Case 4: ng / M Token (Special Vowel Rule)

```typescript
if (token.kind === 'vowel' && (token.raw === 'ng' || token.raw === 'M')) {
  const expansion = expandNg(tokens[i + 1]);
  out += expansion.anusvara + expansion.gaWithMatra;
  if (expansion.consumeNext) i++;  // skip the consumed vowel token
  state = 'after_vowel';
}
```

`expandNg()` performs one token of lookahead.  If the next token is a vowel,
it returns anusvara + GA + that vowel's mātrā and sets `consumeNext = true`.

---

### Case 5: Vowel Token (after consonant)

```typescript
if (isVowelToken(token) && state === 'after_consonant') {
  const matra = matraFor(token.raw);
  if (matra !== '') {
    out += matra;  // AA mātrā, I mātrā, O mātrā, etc.
  }
  // matra === '' means inherent vowel ('o' key) — emit nothing
  state = 'after_vowel';
}
```

---

### Case 6: Vowel Token (initial or after vowel)

```typescript
if (isVowelToken(token) && state !== 'after_consonant') {
  out += standaloneVowelFor(token.raw);
  state = 'after_vowel';
}
```

---

## 8.5 Complete Trace — `"bwdw"` (Bodo word for "Bodo" बोदो)

```
Input:   b  w  d  w
Tokens:  b(C) w(V) d(C) w(V)

i=0  token={raw:'b', kind:'consonant'}
     state=initial → emit BA='ब'        out='ब'    state=after_consonant

i=1  token={raw:'w', kind:'vowel'}
     state=after_consonant → mātrā for 'w' = 'ो'
     emit 'ो'                            out='बो'   state=after_vowel

i=2  token={raw:'d', kind:'consonant'}
     state=after_vowel → emit DA='द'   out='बोद'  state=after_consonant

i=3  token={raw:'w', kind:'vowel'}
     state=after_consonant → mātrā 'ो'
     emit 'ो'                            out='बोदो' state=after_vowel

Result: बोदो  ✓
```

---

## 8.6 Complete Trace — `"gonga"` (गंगा)

```
Input:   g  o  n  g  a
Tokens:  g(C) o(V) ng(V) g(C) a(V)
                ↑ note: tokenizer gives 'ng' not 'n'+'g'

i=0  token={raw:'g', kind:'consonant'}
     state=initial → emit GA='ग'         out='ग'     state=after_consonant

i=1  token={raw:'o', kind:'vowel'}
     state=after_consonant, mātrā for 'o' = '' (inherent)
     emit nothing                          out='ग'     state=after_vowel

i=2  token={raw:'ng', kind:'vowel'}  ← ng rule fires
     lookahead = tokens[3] = {raw:'g', kind:'consonant'} (NOT a vowel)
     expansion = { anusvara:'ं', gaWithMatra:'', consumeNext:false }
     emit 'ं'                             out='गं'    state=after_vowel

i=3  token={raw:'g', kind:'consonant'}
     state=after_vowel → emit GA='ग'     out='गंग'   state=after_consonant

i=4  token={raw:'a', kind:'vowel'}
     state=after_consonant, mātrā='ा'
     emit 'ा'                             out='गंगा'  state=after_vowel

Result: गंगा  ✓
```

---

## 8.7 Complete Trace — `"stra"` (Cluster)

```
Tokens: s(C) th(C)  ← 'th' is a 2-char consonant token
Wait — 'str': s · t · r · a, but 'th'(len 2) would match 't'+'h'
Actually: 'stra' tokenises as s(C) · t(C) · r(C) · a(V)
because 'th' requires h: input[1:3]='tr' ≠ 'th'.

i=0  s(C) → emit SA='स',   state=after_consonant
i=1  t(C) → state=after_consonant → emit HALANT+'थ'  out='स्थ',  state=after_consonant
i=2  r(C) → state=after_consonant → emit HALANT+'र'  out='स्थ्र', state=after_consonant
i=3  a(V) → state=after_consonant → emit 'ा'          out='स्थ्रा' state=after_vowel

Result: स्थ्रा
```

---

## 8.8 cursor mapping — mapCursorPosition()

```typescript
export function mapCursorPosition(roman: string, romanCursor: number): number {
  return transliterate(roman.slice(0, romanCursor)).length;
}
```

This transliterates the prefix up to the Roman cursor and measures the
Unicode output length.  It is correct but O(n²) — re-transliterating for
every cursor position.  For typical IME input (short words), this is fine.

A O(n) implementation would walk the token list and accumulate output length
in parallel, but the simple version is clearer and fast enough in practice.

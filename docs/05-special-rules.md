# Chapter 5 — Special Rules

## 5.1 The ng / Anusvara Rule (DOCUMENTED)

This is the most important context-sensitive rule in the Bodo engine.

**Source:** Explicitly stated on pramukhime.com/help/bodo-typing-help:

> *"The character 'ng' produces 'ं' unless followed by a vowel sign,
> then producing 'ंग'."*

### Rule Definition

```
ng + {end / consonant}  →  ं   (anusvara only)
ng + {vowel}            →  ंग + {mātrā of that vowel}
```

### Case-by-Case Trace

**Case 1: `ng` at end of word**
```
Input:  sang
Tokens: s · a · ng
                   └── no token follows ng
Output: स  + ा  + ं
       (SA)  (AA mātrā)  (anusvara)
Result: सां
```

**Case 2: `ng` before consonant**
```
Input:  ngk
Tokens: ng · k
               └── consonant follows
Output: ं  +  ख
       (anusvara)  (KHA)
Result: ंख
```

**Case 3: `ng` before vowel (`a`)**
```
Input:  nga
Tokens: ng · a
               └── vowel follows
Output: ं  +  ग  +  ा
       (anusvara) (GA) (AA mātrā applied to GA)
Result: ंगा
```

**Case 4: Full context — gonga**
```
Input:  gonga
Tokens: g · o · ng · g · a

Step 1: g     → state=initial → emit GA → state=after_consonant
Step 2: o     → state=after_consonant → mātrā='' (inherent) → state=after_vowel
Step 3: ng    → lookahead = g (consonant) → emit anusvara ं → state=after_vowel
Step 4: g     → state=after_vowel → emit GA → state=after_consonant
Step 5: a     → state=after_consonant → emit AA mātrā ा → state=after_vowel

Concatenated: ग + ं + ग + ा
Result: गंगा  ✓  (the word "Ganga")
```

### Why the Rule Exists

Bodo (and Assamese) distinguishes:
- **बं** /bəŋ/ — "bee" (anusvara on ब, no following consonant)
- **बंग** /bəŋgə/ — "Bengal" (anusvara + ग with inherent vowel)
- **बंगा** /bəŋgaː/ — "Bonga" place name (anusvara + ग + ā)

The single key sequence `ng` covers all three cases through lookahead.

### Implementation: expandNg()

```typescript
// src/engine/rules.ts
export function expandNg(nextToken: Token | undefined): NgExpansion {
  if (nextToken && isVowelToken(nextToken)) {
    const m = matraFor(nextToken.raw);
    return {
      anusvara: U.ANUSVARA,          // always emit anusvara
      gaWithMatra: U.GA + (m || ''), // then GA + mātrā of following vowel
      consumeNext: true,             // skip the consumed vowel token
    };
  }
  return { anusvara: U.ANUSVARA, gaWithMatra: '', consumeNext: false };
}
```

---

## 5.2 The Inherent Vowel Rule ('o' Key)

**Source:** Documented — "अ = o"

### What It Means

Every Devanagari consonant carries an **inherent vowel** /a/ (the schwa).
The consonant ख alone represents the syllable /kha/, not the isolated
phoneme /kh/.

In Pramukh Bodo IME, the inherent vowel is accessed by the `o` key.
Typing `o` after a consonant does NOT add a visible mātrā — it simply
*confirms* the consonant's inherent vowel and closes that syllable.

### Contrast

```
k + a  →  ख + ा  =  खा   (AA mātrā — the long /a/ vowel)
k + o  →  ख       =  ख    (inherent vowel — the short /a/, no sign)
```

Both represent ख as the base consonant, but with different vowel lengths.

### At Word Start or After Vowel

When `o` is typed at initial position or after another vowel, it produces the
**standalone** अ (short-a independent vowel):

```
o         →  अ     (standalone)
o + k     →  अ + ख  =  अख
o + k + a →  अ + खा  =  अखा
```

### Implementation Detail

```typescript
// In transliterator.ts, vowel branch:
if (state === 'after_consonant') {
  const matra = matraFor(token.raw);  // 'o' → matraFor('o') === ''
  if (matra === '') {
    // inherent vowel: nothing appended, consonant stays as-is
  } else {
    out += matra;
  }
  state = 'after_vowel';
}
```

---

## 5.3 Halant / Conjunct Formation

**Source:** Derived from Devanagari orthographic convention.

### Rule

When two consonant tokens appear consecutively with no vowel between them,
a **halant** (U+094D, ्) is inserted between them in the output.

```
k + t  →  ख + ् + थ  =  ख्थ   (conjunct KH-TH)
s + k  →  स + ् + ख  =  स्ख
n + t  →  न + ् + थ  =  न्थ
```

### Multi-consonant Clusters

The halant is inserted before each new consonant in an unbroken run:

```
s + t + r + a  →  स + ् + थ + ् + र + ा  =  स्थ्रा
```

Step by step:
1. `s` → emit स, state=after_consonant
2. `t` → state=after_consonant, so emit HALANT + थ → स्थ, state=after_consonant
3. `r` → state=after_consonant, emit HALANT + र → स्थ्र, state=after_consonant
4. `a` → state=after_consonant, emit AA mātrā ा → स्थ्रा ✓

### Breaking a Conjunct

To prevent halant insertion (e.g., to get ख + ह rather than conjunct ख्ह),
type a separator between them.  The space character is the simplest:

```
k + h  →  ख    (single token 'kh' = aspirated KH)
k + (space) + h  →  ख + space + ह
```

Within the same word, a `-` or another passthrough character can serve as
a separator without adding visible content.

---

## 5.4 Case Sensitivity

**Source:** Documented — "Typing remains case-sensitive. Caps Lock should remain OFF."

The engine treats uppercase and lowercase as distinct keys:

| Lowercase | Maps to | Uppercase | Maps to |
|-----------|---------|-----------|---------|
| `k` | ख | `K` | *(undefined — passthrough)* |
| `s` | स | `S` | श |
| `n` | न | `N` | ण |
| `t` | थ | `T` | ट |
| `d` | द | `D` | ड |
| `b` | ब | `B` | भ |
| `c` | च | `C` | छ |
| `j` | ज | `J` | झ |
| `i` | इ / ि | `I` | य |
| `o` | अ / (inherent) | `O` | व |
| `u` | उ / ु | `U` | ऊ / ू |
| `g` + `n` | ग + ् + न | `N` + `G` = `NG` | ङ |

**Practical implication:** The engine is sensitive to CapsLock state.
All user-facing documentation should instruct users to keep CapsLock OFF.

---

## 5.5 The oM vs ong Ambiguity

Two documented key sequences produce the same result (अं):

```
oM   →  अ + ं  (using M = anusvara token)
ong  →  अ + ं  (using o = standalone अ, ng = anusvara)
```

**Why `ong` cannot be a single token:**

If `ong` were an atomic 3-char token, the word `gonga` would tokenise as:

```
g + [ong] + a  →  ग + ं + आ  =  गंआ  ✗  (wrong!)
```

Because `ong` (length 3) at position 1 in "gonga" would greedily consume
`o`, `n`, and `g` before the final `g` and `a` could form गा.

**Decision:** `ong` is NOT an atomic token.  It is handled as two separate
tokens: `o` (standalone अ) + `ng` (anusvara).  The result is identical but
the tokenisation is unambiguous.

Use `oM` explicitly when typing standalone अं to avoid any tokenisation
surprises in longer sequences.

---

## 5.6 The F9 Toggle

**Source:** Documented — "Press F9 to switch between languages."

The `BodoInput` component intercepts the F9 key to toggle the IME on/off:
- **IME ON:** All keystroke handling is intercepted; English input is transliterated.
- **IME OFF:** The textarea behaves as a standard English textarea.

This mirrors the Pramukh IME desktop behaviour exactly.

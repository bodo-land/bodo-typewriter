# Chapter 6 — Architecture & Design

## 6.1 Directory Layout

```
src/
├── engine/                   Pure TypeScript — no React dependency
│   ├── unicode.ts            Named constants for every Devanagari codepoint
│   ├── mappings.ts           Key → Unicode mapping tables
│   ├── tokenizer.ts          Longest-match tokeniser
│   ├── rules.ts              Context-sensitive composition rules
│   └── transliterator.ts     Main transliterate() function + cursor mapping
│
├── hooks/
│   └── useBodoIME.ts         React hook — manages committed + Roman buffer state
│
├── components/
│   └── BodoInput.tsx         <textarea> with IME, toggle, paste support
│
├── utils/
│   └── cursor.ts             Grapheme cluster utilities for cursor mapping
│
└── __tests__/
    └── transliterator.test.ts  90 unit tests
```

---

## 6.2 Module Responsibilities

### engine/unicode.ts

**Purpose:** Single source of truth for every Devanagari Unicode codepoint.

**Why it exists:** Without named constants, the rest of the codebase would
be full of magic strings like `'ख'` or copy-pasted characters that
look identical on screen but might differ in encoding.

**What it exports:**
```typescript
export const U = {
  KHA: 'ख',  // U+0916
  HALANT: '्', // U+094D
  ANUSVARA: 'ं', // U+0902
  // ... all vowels, vowel signs, consonants, diacritics, symbols
}
```

Every other module imports from `unicode.ts`; no Unicode literals appear
anywhere else.

---

### engine/mappings.ts

**Purpose:** Defines all three mapping tables and their metadata.

**What it exports:**

| Export | Type | Content |
|--------|------|---------|
| `VOWEL_MAPPINGS` | `Record<string, VowelEntry>` | Key → `{ standalone, matra, source }` |
| `CONSONANT_MAPPINGS` | `Record<string, ConsonantEntry>` | Key → `{ char, source }` |
| `SPECIAL_MAPPINGS` | `Record<string, SpecialEntry>` | Key → `{ output, source }` |
| `UNASPIRATED_BASES` | `Record<string, string>` | `'ko' → 'क'` etc. (reference only) |

**Key design decisions:**
- `VowelEntry` has two fields (`standalone` and `matra`) because the same
  key produces different Unicode depending on whether it follows a consonant.
- Every entry carries a `source` tag so the provenance can be surfaced in
  documentation or UI.
- `UNASPIRATED_BASES` is exported for documentation but **not used by the
  tokeniser** to avoid the `kou` ambiguity (see Chapter 5.5).

---

### engine/tokenizer.ts

**Purpose:** Break a Roman input string into typed tokens using longest-match.

**What it exports:**
```typescript
type TokenKind = 'vowel' | 'consonant' | 'special' | 'passthrough';
type Token = { raw: string; kind: TokenKind };
function tokenize(input: string): Token[];
```

**Algorithm:**
1. Build `ALL_ENTRIES` = all keys from all tables merged into one array.
2. Sort `ALL_ENTRIES` by key length **descending**.  For equal lengths,
   category priority: special > consonant > vowel.
3. At each position `i`, scan `ALL_ENTRIES` in order; first match wins.
4. Unmatched characters become `passthrough` tokens.

**Why a single sorted list:** Category-based sequential checks (first
consonants, then vowels) would cause 1-char consonant `n` to beat 2-char
vowel modifier `ng`.  Merging by length prevents this.

---

### engine/rules.ts

**Purpose:** Pure functions for context-sensitive token interpretation.

**What it exports:**

| Function | Signature | Purpose |
|----------|-----------|---------|
| `isVowelToken` | `(t: Token) → boolean` | True if token is in VOWEL_MAPPINGS |
| `isConsonantToken` | `(t: Token) → boolean` | True if token is a consonant |
| `matraFor` | `(raw: string) → string` | Returns mātrā form of a vowel key |
| `standaloneVowelFor` | `(raw: string) → string` | Returns standalone vowel |
| `consonantCharFor` | `(raw: string) → string` | Returns consonant Unicode char |
| `expandNg` | `(nextToken?) → NgExpansion` | Implements the ng rule with lookahead |

**No state:** `rules.ts` is purely functional.  State is managed in
`transliterator.ts`.

---

### engine/transliterator.ts

**Purpose:** The main state machine that converts a Roman string to Devanagari.

**What it exports:**
```typescript
function transliterate(input: string): string;
function transliterateSegment(segment: string): string;
function mapCursorPosition(roman: string, romanCursor: number): number;
```

**State machine:**
```
       consonant
INITIAL ──────────► AFTER_CONSONANT
   ▲                    │  │  │
   │   passthrough/      │  │  └─ vowel → AFTER_VOWEL
   │   special           │  └──── consonant (halant + new) → stays
   └────────────────────┘
                    AFTER_VOWEL
                         │
                         └─ consonant → AFTER_CONSONANT
                         └─ vowel → stays AFTER_VOWEL (standalone)
```

**`mapCursorPosition`:** Transliterates prefixes of increasing length and
returns the output length at the Roman cursor position.  Used to preserve
cursor placement after transliteration.

---

### hooks/useBodoIME.ts

**Purpose:** React state manager for the IME composition model.

**State:**
```typescript
const [committedUnicode, setCommitted] = useState('');
const [romanBuffer, setRomanBuffer]    = useState('');
```

**Visible value:** `committedUnicode + transliterate(romanBuffer)`

**Key logic:**

| Event | Action |
|-------|--------|
| Printable key | Append to `romanBuffer`, re-transliterate |
| Space/Enter/Tab | Commit: `committed += transliterate(roman) + boundaryChar`, `roman = ''` |
| Backspace (buffer non-empty) | `roman = roman.slice(0, -1)` |
| Backspace (buffer empty) | `committed = committed.slice(0, -1)` |
| F9 | Toggle IME active/inactive |

---

### components/BodoInput.tsx

**Purpose:** Drop-in React component wrapping a `<textarea>` with the IME.

**Props:**
```typescript
type BodoInputProps = {
  placeholder?: string;
  defaultValue?: string;
  value?: string;           // controlled mode
  onChange?: (v: string) => void;
  className?: string;
  textareaClassName?: string;
  rows?: number;
  autoFocus?: boolean;
};
```

**Features beyond the hook:**
- F9 toggle button and status bar showing Roman buffer
- Paste handler: intercepts clipboard text and runs `transliterate()` on it
- Noto Sans Devanagari font stack
- `Clear` button
- `autoCapitalize="off"` and `autoCorrect="off"` for mobile

---

### utils/cursor.ts

**Purpose:** Unicode-safe cursor utilities.

**Why needed:** A Devanagari string like `सां` contains 3 UTF-16 code units but
represents 3 user-perceived characters (or 2 grapheme clusters: `सा` + `ं`).
`string.length` in JavaScript counts UTF-16 code units, not grapheme clusters.

`graphemeLength()` uses `Intl.Segmenter` when available, falling back to
`string.length`.  Used for cursor position correction after transliteration.

---

## 6.3 Data Flow Diagram

```
User keyboard event
        │
        ▼
  useBodoIME.handleKeyDown
        │
        ├─ Backspace? → trim romanBuffer
        ├─ Space/Enter? → commit: transliterate(roman) → committedUnicode
        └─ Printable? → append to romanBuffer
                              │
                              ▼
                    transliterate(romanBuffer)
                              │
                     tokenize(roman)  ←── mappings.ts ALL_ENTRIES (sorted)
                              │
                     Token stream [ {raw,kind}, ... ]
                              │
                     state machine loop
                       │        │
                   isVowel?  isConsonant?
                       │        │
                   matraFor  consonantCharFor
                    /rules.ts\  /rules.ts\
                              │
                       Unicode output string
                              │
                              ▼
                BodoInput renders <textarea value={...} />
```

---

## 6.4 Design Principles

**1. Engine is framework-free.**
`src/engine/` has zero React imports.  It can be used in Node, a Web Worker,
or any framework.

**2. Provenance is explicit.**
Every mapping carries a `source: 'documented' | 'inferred'` tag.  No magic.

**3. No mutation.**
The tokeniser and transliterator are pure functions.  Given the same input
string, they always produce the same output.

**4. Fail-safe passthrough.**
Any character not recognised by the tokeniser becomes a `passthrough` token
and is emitted unchanged.  The engine never silently drops input.

**5. Tests are the specification.**
The 90 unit tests in `__tests__/transliterator.test.ts` are labelled `[D]`
or `[I]` and serve as the authoritative specification for both documented
and inferred behaviour.

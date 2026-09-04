# Engine Improvements

Improvements to `src/engine/` — the tokenizer, transliterator, rules, and
mapping tables.  These do not require UI changes unless noted.

Difficulty: **Low** (< half day) · **Medium** (1–2 days) · **High** (3+ days)

---

## ENG-001 — Missing mapping: unaspirated stops (ক/ক্ক equivalents) · Medium

### Problem

Bodo phonology has both aspirated and unaspirated consonants, but the current
mapping table only exposes the **aspirated form** for the dental/labial series:

| Key | Current output | Missing |
|-----|---------------|---------|
| `k` | ख (aspirated) | क (unaspirated) |
| `t` | थ (aspirated) | त (unaspirated) |
| `p` | फ (aspirated) | प (unaspirated) |

The Pramukh help page documents the aspirated-default paradigm but does not
show keys for unaspirated stops.  Comparing the Assamese Pramukh chart (where
`q` → ক) suggests a possible mapping, but this is not documented for Bodo.

### Proposed solution

Add a configurable secondary mapping as an opt-in "extended mode":

```typescript
// src/engine/mappings.ts
export const EXTENDED_CONSONANT_MAPPINGS: Record<string, ConsonantEntry> = {
  'q':  { char: U.KA,  source: 'inferred' }, // q → क (unaspirated ka)
  'tt': { char: U.TA,  source: 'inferred' }, // tt → त (doubled = unaspirated)
  'pp': { char: U.PA,  source: 'inferred' }, // pp → प
};
```

The doubled-key convention (`tt` → त) is used by several Indic IMEs and
avoids conflicting with existing 1-char mappings.

### Affected files

- `src/engine/mappings.ts` — add `EXTENDED_CONSONANT_MAPPINGS`
- `src/engine/tokenizer.ts` — include extended mappings only when extended
  mode is active (pass a flag to `buildTrie` or maintain two tries)
- `src/App.tsx` — add a toggle to enable extended mode

---

## ENG-002 — Ra-special forms (reph and subscript ra) · Medium

### Problem

Devanagari has two special Ra forms used in conjuncts:

| Form | Unicode | When used | Example |
|------|---------|-----------|---------|
| **Reph** (ऱ) | consonant + ् + RA → RA above | Ra precedes the following consonant | र्क → र्क |
| **Subscript Ra** | consonant + ् + RA | Ra follows the preceding consonant | क्र → क्र |

The current engine produces the correct Unicode sequence for both (the trie
emits `RA U+094D` in a conjunct), but some Devanagari fonts render these
forms incorrectly if the codepoint order is wrong.

### Required sequence

```
Reph:        base consonant  + U+094D (halant) + RA
Sub-ra:      RA + U+094D (halant) + following consonant
```

The current transliterator always emits `halant + second_consonant`, which
is correct for sub-ra but produces the wrong visual for reph in some fonts.

### Proposed fix

Detect `RA + halant + consonant` vs `consonant + halant + RA` and emit the
canonical Unicode sequence:

```typescript
// In transliterator.ts, after emitting a consonant:
if (prevConsonant === U.RA && state === 'after_consonant') {
  // Replace the RA we already emitted with reph form
  out = out.slice(0, -U.RA.length) + U.RA + U.HALANT;
}
```

This is visually transparent in fonts that follow OpenType Devanagari shaping
rules (e.g., Noto Sans Devanagari), but important for cross-font compatibility.

---

## ENG-003 — Nukta characters for loan words · Low

### Problem

Bodo uses several borrowed sounds (from Sanskrit and Assamese) that require
nukta (U+093C ़) — a dot below a consonant:

| English key | Expected | Unicode |
|-----------|----------|---------|
| `q` or `qa` | क़ | U+0915 + U+093C |
| `fa` | फ़ | U+092B + U+093C |
| `za` | ज़ | U+091C + U+093C |

Currently `f` maps to `फ` (aspirated pa, no nukta), which is phonetically
close but not the same as the nukta form `फ़` used in Arabic/Persian loanwords.

### Proposed solution

Add nukta-form entries to `CONSONANT_MAPPINGS`:

```typescript
'z':  { char: U.JA + U.NUKTA,  source: 'inferred' }, // ज़
'qa': { char: U.KA + U.NUKTA,  source: 'inferred' }, // क़
```

And add the `NUKTA` constant to `unicode.ts`:
```typescript
NUKTA: '़', // U+093C DEVANAGARI SIGN NUKTA
```

### Priority

Low — nukta forms are rare in everyday Bodo text and are absent from the
Pramukh documentation.  Add as an extended-mode feature (see ENG-001).

---

## ENG-004 — Avagraha rule is incomplete · Low

### Problem

The current mapping:
```typescript
'.a': { output: U.AVAGRAHA, source: 'documented' }  // ऽ
```

Avagraha (ऽ, U+093D) represents elision of a short `a` in Sanskrit loanwords.
It should only appear after a vowel — after a consonant it makes no phonetic
sense.  The engine emits it unconditionally.

### Proposed fix

In `transliterator.ts`, guard avagraha emission:

```typescript
if (token.kind === 'special' && token.raw === '.a') {
  if (state === 'after_vowel') {
    out += U.AVAGRAHA;
  }
  // Silently ignore .a after consonant or at start
  state = 'initial';
  continue;
}
```

---

## ENG-005 — Long English input causes layout jank in the composing hint · 🟢 Low

### Problem

If the user types a very long English string without a word boundary (e.g., a
long proper noun with no spaces), `englishBuffer` can grow to 30+ characters.
The composing hint (`Composing: <kbd>bwdwlandkhwn…</kbd>`) overflows its
container and pushes the layout.

### Proposed fix

Truncate the displayed buffer in the UI hint, not the actual buffer:

```typescript
const displayBuffer = ime.englishBuffer.length > 20
  ? '…' + ime.englishBuffer.slice(-20)
  : ime.englishBuffer;
```

This is a UI change only; `englishBuffer` in the hook remains full-length.

---

## ENG-006 — `transliterateSegment` is an alias — consider removing · 🟢 Low

### Problem

`src/engine/transliterator.ts` exports `transliterateSegment`:

```typescript
export function transliterateSegment(segment: string): string {
  return transliterate(segment);
}
```

This is a pure alias.  It adds a name to the public API without adding
behaviour, and no existing code calls it.

### Proposed fix

Remove `transliterateSegment`.  If segment-level transliteration needs
different semantics in the future (e.g., no NFC, no state carry-over),
it can be re-added then with a clear contract.

```typescript
// Delete these lines from transliterator.ts:
export function transliterateSegment(segment: string): string {
  return transliterate(segment);
}
```

Check no tests or components import it before deleting:
```bash
grep -r 'transliterateSegment' src/
```

---

## ENG-007 — `mapCursorPosition` is exported but unused · 🟢 Low

### Problem

`transliterator.ts` exports `mapCursorPosition` for mapping an English cursor
offset to a Unicode cursor offset.  This function exists to support BUG-003
(cursor tracking in `useBodoIME`), but cursor tracking has not been
implemented yet.

The function is correct and well-designed; it just has no caller.

### Action

Keep the function — it will be needed when BUG-003 is fixed.  Add a `// used
by cursor tracking — see docs/fixes_improvements/01-bug-tracker.md#BUG-003`
comment so it does not get pruned as dead code.

---

## ENG-008 — Trie `buildTrie` runs at module load with no error handling · 🟢 Low

### Problem

`tokenizer.ts` builds the trie at module load:
```typescript
const ROOT = buildTrie(ALL_ENTRIES);
```

If a duplicate key exists in `ALL_ENTRIES` (e.g., from a future copy-paste
error in the mapping tables), the trie silently overwrites the earlier entry's
`kind`.  The bug would be invisible — wrong tokens would be produced for the
conflicting key.

### Proposed fix

Add a duplicate-key assertion in `buildTrie` (runs only in development):

```typescript
function buildTrie(entries: Entry[]): TrieNode {
  if (import.meta.env.DEV) {
    const keys = entries.map(e => e.key);
    const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
    if (dupes.length > 0) {
      throw new Error(`Duplicate trie keys: ${dupes.join(', ')}`);
    }
  }
  // ... rest of buildTrie
}
```

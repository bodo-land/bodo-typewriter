# Bug Tracker

Each entry follows the same format:

```
ID       — short identifier, referenced from git commits
Severity — 🔴 data-destroying / 🟡 degraded / 🟢 cosmetic
Status   — Open / Fixed / Won't-Fix
```

---

## BUG-001 — Backspace deletes a UTF-16 code unit, not a grapheme 🟡 Open

### Reproduction

1. Type a word that ends with a Devanagari character followed by a combining
   diacritic — for example `kng` → `खं` (ख U+0916 + anusvara U+0902).
2. Press Backspace once.

### Expected behaviour

The anusvara diacritic (ं) is removed, leaving `ख`.

### Actual behaviour

`String.prototype.slice(0, -1)` removes the last UTF-16 code unit.  For
characters in the BMP (U+0000–U+FFFF) that is equivalent to one codepoint,
so `खं` → `ख` happens to work here.  But when the committed string contains
supplementary-plane characters (U+10000+), emoji, or ZWJ sequences, one
`slice(-1)` removes half a surrogate pair and produces a broken string.

### Root cause

`useBodoIME.ts`, line 68:
```typescript
setCommitted(c => c.slice(0, -1)); // removes last UTF-16 code unit
```

The comment even acknowledges this is not grapheme-aware.

### Fix

Use the `Intl.Segmenter` API (available in all modern browsers and Node ≥ 16)
to split into grapheme clusters and remove the last one:

```typescript
function dropLastGrapheme(s: string): string {
  if (!s) return s;
  const seg = new Intl.Segmenter();
  const clusters = [...seg.segment(s)];
  return clusters.slice(0, -1).map(c => c.segment).join('');
}
```

Replace the offending line in `useBodoIME.ts`:
```typescript
// Before
setCommitted(c => c.slice(0, -1));

// After
setCommitted(c => dropLastGrapheme(c));
```

### Notes

- Bodo Devanagari typically pairs a base consonant with a mātrā (both BMP).
  This bug only surfaces for supplementary characters, but it is still
  incorrect by spec.
- Add a test: commit a string containing `OM` (ॐ, U+0950, BMP, safe), then
  test with an emoji appended via passthrough to confirm grapheme deletion.

---

## BUG-002 — Paste into English input silently loses IME state 🔴 Open

### Reproduction

1. With IME on, type `bwdw` into the English textarea (englishBuffer = `"bwdw"`).
2. Select all, then paste `namw` from the clipboard.

### Expected behaviour

The pasted English text `namw` replaces the buffer and is immediately
transliterated to `नामो`.

### Actual behaviour

Because the textarea is in a controlled React mode when IME is off (and
uncontrolled when IME is on), the `onChange` handler is never called for
the paste.  The visible textarea shows the pasted text, but `englishBuffer`
in the hook still holds the old value.  On the next keypress the buffer
de-syncs and produces garbled output.

### Root cause

`App.tsx` passes `value={imeActive ? ime.englishBuffer : ime.value}` to the
textarea.  In IME-on mode the textarea's `onChange` is not wired, so clipboard
paste events bypass the state machine entirely.

### Fix

Add an `onPaste` handler that reads the pasted text, strips any non-English
characters, and commits it through `ime.setEnglish`:

```typescript
const handlePaste = useCallback(
  (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!imeActive) return;          // native paste is fine when IME is off
    e.preventDefault();
    const pasted = e.clipboardData.getData('text/plain');
    // Commit whatever is already in the buffer
    ime.setEnglish('');
    // Feed pasted text as new english buffer
    ime.setEnglish(pasted);
  },
  [ime, imeActive],
);

// Attach to textarea:
<textarea onPaste={handlePaste} ... />
```

For multi-word paste the better approach is to run `transliterate(pasted)`
and append the result directly to `committedUnicode`, bypassing the buffer:

```typescript
const handlePaste = useCallback(
  (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!imeActive) return;
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    // Commit current buffer + full transliteration of pasted text
    setCommitted(c => c + transliterate(ime.englishBuffer) + transliterate(text));
    setEnglishBuffer('');
  },
  [ime, imeActive],
);
```

This requires exposing `setCommitted` from the hook, or moving paste logic
into `useBodoIME` as a `handlePaste` callback.

---

## BUG-003 — Arrow keys and cursor movement not handled 🟡 Open

### Reproduction

1. Type `bwdwland` → `बोदोलान्ड`.
2. Press the Left arrow key to move the cursor into the middle of the word.
3. Type another character.

### Expected behaviour

The character is inserted at the cursor position.

### Actual behaviour

The IME ignores cursor position entirely.  All new keystrokes are appended
to the end of `englishBuffer` regardless of where the cursor sits.  The
`mapCursorPosition` helper in `transliterator.ts` exists precisely to support
this, but it is not wired to the textarea.

### Root cause

`useBodoIME.ts` has no concept of a cursor offset.  `handleKeyDown` always
appends to the tail of `englishBuffer`.

### Fix

This requires a significant extension to the hook's state model:

```typescript
type IMEState = {
  value: string;
  englishBuffer: string;
  cursorEnglish: number;     // cursor position within englishBuffer
  handleKeyDown: ...;
  handleSelect: (start: number, end: number) => void;  // new
};
```

On `onSelect` (textarea selection-change event):
1. Map the textarea's Unicode cursor position back to an English offset using
   the inverse of `mapCursorPosition`.
2. Store `cursorEnglish`.

On keypress:
1. Insert the new character at `englishBuffer[cursorEnglish]` rather than at
   the end.
2. Re-transliterate the full buffer.
3. Advance `cursorEnglish` by the key length.

This is non-trivial because one English character may expand to multiple
Unicode codepoints (e.g. `ng` + vowel → anusvara + ग + mātrā = 3 chars).
The English-to-Unicode cursor mapping must account for variable-length output.

**Estimated effort:** High (2–3 days).  Needs new tests for cursor invariants.

---

## BUG-004 — `Delete` key is silently ignored 🟢 Open

### Reproduction

Position the cursor in the middle of committed text, then press Delete.

### Expected behaviour

The character after the cursor is deleted.

### Actual behaviour

`useBodoIME.ts` line 74–77 explicitly ignores `Delete`:
```typescript
if (key === 'Delete') {
  // Not supported in composition mode — ignore or handle separately
  return;
}
```

### Fix

Until cursor-position tracking (BUG-003) is implemented, Delete can be made
to work at least for the simple case of "cursor at end of committed text,
buffer empty":

```typescript
if (key === 'Delete') {
  e.preventDefault();
  if (englishBuffer.length === 0) {
    // Nothing after cursor in this model — nothing to delete.
    // Once cursor tracking lands, this becomes: delete char after cursor.
  }
  return;
}
```

Full fix depends on BUG-003.

---

## BUG-005 — `commitChar` for Tab inserts a literal `\t` into Unicode output 🟢 Open

### Reproduction

While composing a word, press Tab.

### Expected behaviour

Tab commits the current word and moves focus to the next focusable element
(standard browser behaviour).

### Actual behaviour

`useBodoIME.ts` line 82:
```typescript
const commitChar = key === 'Enter' ? '\n' : key === 'Tab' ? '\t' : key;
```

The `\t` is appended to `committedUnicode`, which appears as a literal tab
character in the output box.  Tab does not move focus.

### Fix

Remove Tab from `COMMIT_CHARS` and let the browser handle it natively:

```typescript
const COMMIT_CHARS = new Set([' ', 'Enter', '\n', '\r']); // Tab removed
```

If Tab-to-commit is desired (some IMEs use it), it should commit but also
call `e.target.blur()` and let the browser's focus ring move forward.

---

## BUG-006 — NFC normalisation only applies to `transliterate()`, not to committed Unicode 🟡 Open

### Reproduction

1. Paste NFD-normalised Devanagari text into the output area (only possible
   when IME is off, via BUG-002 path).
2. Compare the stored string with a freshly transliterated equivalent.

### Expected behaviour

All stored Unicode is NFC regardless of source.

### Actual behaviour

`transliterate()` now returns NFC output (fixed in the perf commit), but
`committedUnicode` is set by direct string concatenation in `useBodoIME`:

```typescript
setCommitted(c => c + transliterate(englishBuffer) + commitChar);
```

`commitChar` (space, newline) is always NFC-safe.  However if `committedUnicode`
is ever seeded with external text (e.g. `initialValue` prop or future paste
support), that text bypasses normalisation.

### Fix

Normalise `initialValue` on hook initialisation and normalise any externally
provided string before storing:

```typescript
export function useBodoIME(initialValue = ''): IMEState {
  const [committedUnicode, setCommitted] = useState(
    () => initialValue.normalize('NFC')
  );
  ...
}
```

And in the paste handler (once BUG-002 is fixed):
```typescript
setCommitted(c => (c + externalText).normalize('NFC'));
```

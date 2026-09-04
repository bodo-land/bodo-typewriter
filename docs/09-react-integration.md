# Chapter 9 — React Integration

## 9.1 Architecture Decision: Two-Layer Model

The React integration is split into two layers:

```
useBodoIME (hook)          — state management, pure logic
     │
BodoInput (component)      — DOM, accessibility, UX
```

This separation means the engine can be used with any UI framework or
even in a headless context (server-side generation, tests) without
touching React components.

---

## 9.2 useBodoIME Hook

### State Model

```typescript
const [committedUnicode, setCommitted] = useState(initialValue);
const [englishBuffer, setEnglishBuffer]    = useState('');
```

The **visible value** is a computed concatenation:

```
value = committedUnicode + transliterate(englishBuffer)
```

This is re-computed on every render — `transliterate()` is fast enough
(microseconds for typical word lengths) that memoisation is not needed.

### Composition Lifecycle

```
                   ┌─ user types 'b'
englishBuffer='b'    │    value = '' + transliterate('b') = 'ब'
                   │
                   ├─ user types 'w'
englishBuffer='bw'   │    value = '' + transliterate('bw') = 'बो'
                   │
                   ├─ user types 'd'
englishBuffer='bwd'  │    value = '' + transliterate('bwd') = 'बोद'
                   │
                   ├─ user types 'w'
englishBuffer='bwdw' │    value = '' + transliterate('bwdw') = 'बोदो'
                   │
                   ├─ user presses SPACE
committedUnicode   │    = 'बोदो '
englishBuffer=''     │    value = 'बोदो ' + '' = 'बोदो '
```

### Backspace Behaviour

Smart backspace operates on the English buffer first:

```
englishBuffer='bwdw'  → Backspace → englishBuffer='bwd'
                                   transliterate('bwd') = 'बोद'
                                   value = '' + 'बोद' = 'बोद'
```

This is correct IME behaviour: backing up through English keystrokes
rather than Unicode characters.  Without this, deleting `'बो'` (2 code units)
would require 2 Backspaces even though only one English keystroke (`'w'`) caused it.

When the buffer is empty:

```
englishBuffer=''  → Backspace → committedUnicode = committedUnicode.slice(0, -1)
```

This removes the last UTF-16 code unit from committed text.  For multi-unit
characters (rare in Devanagari, all Devanagari is in BMP), this could split
a surrogate pair.  A production fix would use `Intl.Segmenter` to remove the
last grapheme cluster instead.

### Word Boundaries

Space, Enter, and Tab all trigger a commit:

```typescript
if (COMMIT_CHARS.has(key)) {
  const commitChar = key === 'Enter' ? '\n' : key === 'Tab' ? '\t' : key;
  setCommitted(c => c + transliterate(englishBuffer) + commitChar);
  setEnglishBuffer('');
}
```

The commit character is appended to the committed text.  This means spaces
and newlines are preserved correctly in multi-line or multi-word text.

---

## 9.3 BodoInput Component

### Props

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `placeholder` | string | `'Type in Bodo...'` | Empty-state hint |
| `defaultValue` | string | `''` | Seed the committed text |
| `value` | string? | — | Controlled mode value |
| `onChange` | `(v:string)→void`? | — | Called after every change |
| `className` | string | `''` | Wrapper div class |
| `textareaClassName` | string | `''` | Textarea class |
| `rows` | number | `4` | Textarea row count |
| `autoFocus` | boolean | `false` | Focus on mount |

### Uncontrolled Mode (default)

```tsx
<BodoInput onChange={v => console.log(v)} />
```

The component manages its own state via `useBodoIME`.  `onChange` is
called as an observer, not a controller.

### Controlled Mode (advanced)

```tsx
const [text, setText] = useState('');
<BodoInput value={text} onChange={setText} />
```

In controlled mode the parent provides the value.  The hook's internal
committed state is kept for English-buffer composition, but the displayed
value is the prop.  Full two-way controlled mode (where the parent can
externally modify text mid-composition) requires additional engineering
not currently implemented.

### Paste Handling

When the user pastes text, `onPaste` intercepts and transliterates:

```typescript
const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
  e.preventDefault();
  const pastedEnglish = e.clipboardData.getData('text/plain');
  const unicode = transliterate(pastedEnglish);
  // insert `unicode` at current cursor position via native setter
};
```

The native value setter + synthetic `input` event trick is required because
React's controlled textarea won't accept direct DOM manipulation without
triggering a re-render.

### Status Bar

Below the textarea, a status bar shows:

```
✦ Bodo IME active (F9 to toggle) — composing: bwd_
```

The `composing: bwd_` part shows the current English buffer — useful for
debugging and for users learning the key mappings.

---

## 9.4 Cursor Preservation

After every transliteration update, the hook moves the cursor to the end
of the textarea.  This is a simplification: a full implementation would
map the cursor position through `mapCursorPosition()`.

Current behaviour:

```typescript
useEffect(() => {
  const el = ref.current;
  const end = el.value.length;
  if (el.selectionStart === el.selectionEnd && el.selectionEnd >= end - 3) {
    el.setSelectionRange(end, end);
  }
}, [value]);
```

The `>= end - 3` guard prevents the cursor from jumping if the user has
manually moved it back into committed text.

A production-quality cursor mapper would:
1. Record the English cursor position before each update.
2. Call `mapCursorPosition(english, englishCursor)` to get the Unicode position.
3. Set `setSelectionRange(uniPos, uniPos)`.

---

## 9.5 Mobile Support

Mobile keyboards fire `onChange` events via composition rather than
individual `keydown` events.  The current implementation does not fully
support mobile soft keyboards — `keydown` events may not fire for all
characters.

For production mobile support, use `onCompositionEnd` + `onChange`:

```typescript
const onCompositionEnd = (e: React.CompositionEvent<HTMLTextAreaElement>) => {
  const data = e.data; // the composed string from the soft keyboard
  setEnglishBuffer(prev => prev + data);
};
```

The current `onPaste` path handles copy-paste from mobile correctly.

---

## 9.6 Usage Examples

### Minimal

```tsx
import { BodoInput } from './components/BodoInput';

function App() {
  return <BodoInput />;
}
```

### With controlled state

```tsx
import { useState } from 'react';
import { BodoInput } from './components/BodoInput';

function Editor() {
  const [bodo, setBodo] = useState('');
  return (
    <>
      <BodoInput onChange={setBodo} rows={10} />
      <pre>{bodo}</pre>
    </>
  );
}
```

### Using the hook directly (custom UI)

```tsx
import { useBodoIME } from './hooks/useBodoIME';

function CustomEditor() {
  const { value, englishBuffer, handleKeyDown } = useBodoIME();
  return (
    <div>
      <input
        value={value}
        onChange={() => {}}
        onKeyDown={handleKeyDown}
      />
      <small>Buffer: {englishBuffer}</small>
    </div>
  );
}
```

### Using the engine outside React

```typescript
import { transliterate } from './engine/transliterator';

const unicode = transliterate('bwdw namoskaar');
console.log(unicode); // बोदो नामोस्कार
```

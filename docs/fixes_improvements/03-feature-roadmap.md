# Feature Roadmap

New capabilities that go beyond fixing existing behaviour.  Each entry
includes a user story, effort estimate, and implementation sketch.

Effort: **S** (< 1 day) · **M** (2–3 days) · **L** (1–2 weeks) · **XL** (month+)

---

## FEAT-001 — Dictionary-assisted word suggestions · L

### User story

> As a Bodo typist, while I am typing a word I would like to see a ranked
> list of matching Bodo words so I can select one without typing it fully.

### Architecture

```
romanBuffer: "bwdw"
    │
    ▼ transliterate()
candidate prefix: "बोदो"
    │
    ▼ prefix lookup in word trie
suggestions: [ "बोदो", "बोदोलान्ड", "बोदोफा", ... ]
    │
    ▼ rank by frequency
top-5 shown in suggestion bar
```

### Data requirements

A Bodo word list with frequency counts, Unicode-NFC normalised.  Possible
sources:

1. **Bodo Wikipedia dump** — ~5,000 articles, extractable with `wikimedia-dump-parser`.
2. **CLDR Bodo locale** — small but curated; covers digits, months, weekdays.
3. **Bodo Sahitya Sabha publications** — richest source but requires permission.

Target: 30,000–50,000 unique word forms.

### Storage format

A prefix-compressed JSON trie (~2–5 MB uncompressed, ~600 KB gzipped):

```json
{
  "ब": {
    "ो": {
      "द": {
        "ो": { "$": 9821 },
        "ो": {
          "ल": { "ा": { "न": { "्": { "ड": { "$": 441 } } } } }
        }
      }
    }
  }
}
```

`"$"` is the frequency count for a terminal node.

### UI integration

Add a `<SuggestionBar>` component between the Roman textarea and the
Devanagari output:

```tsx
{suggestions.length > 0 && (
  <div style={suggestionBarStyle}>
    {suggestions.map((s, i) => (
      <button key={i} onClick={() => commitSuggestion(s)}>
        {s}
      </button>
    ))}
  </div>
)}
```

`commitSuggestion(word)` appends `word` to `committedUnicode` and clears
`romanBuffer`.

### Loading strategy

Load the dictionary lazily on first keystroke using dynamic import:

```typescript
let dictPromise: Promise<WordTrie> | null = null;

function getDict(): Promise<WordTrie> {
  if (!dictPromise) dictPromise = import('../data/bodo-dict.json');
  return dictPromise;
}
```

---

## FEAT-002 — Undo / redo stack · M

### User story

> As a typist, I want to undo multiple edits with Ctrl+Z, not just one
> character at a time via Backspace.

### Current limitation

`useBodoIME` has no history.  Backspace undoes one Roman keystroke at a time
within the current `romanBuffer`, but once a word is committed there is no
way to undo the commit.

### Design

Maintain a bounded history stack of `(committedUnicode, romanBuffer)` snapshots:

```typescript
type Snapshot = { committed: string; roman: string };
const [history, setHistory] = useState<Snapshot[]>([]);
const [future,  setFuture]  = useState<Snapshot[]>([]);
```

On every commit (space, enter):
```typescript
setHistory(h => [...h.slice(-49), { committed: committedUnicode, roman: romanBuffer }]);
setFuture([]);
```

On `Ctrl+Z`:
```typescript
if (history.length > 0) {
  const prev = history[history.length - 1];
  setFuture(f => [{ committed: committedUnicode, roman: romanBuffer }, ...f]);
  setHistory(h => h.slice(0, -1));
  setCommitted(prev.committed);
  setRomanBuffer(prev.roman);
}
```

On `Ctrl+Y` / `Ctrl+Shift+Z` (redo):
```typescript
if (future.length > 0) {
  const next = future[0];
  setHistory(h => [...h, { committed: committedUnicode, roman: romanBuffer }]);
  setFuture(f => f.slice(1));
  setCommitted(next.committed);
  setRomanBuffer(next.roman);
}
```

Cap history at 50 snapshots to avoid unbounded memory growth.

### Keyboard handling

Add to `handleKeyDown` in `useBodoIME`:
```typescript
if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
  e.preventDefault();
  undo();
  return;
}
if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
  e.preventDefault();
  redo();
  return;
}
```

---

## FEAT-003 — Export in multiple formats · S

### User story

> As a developer, I want to copy the Devanagari output in different formats
> (plain Unicode, HTML entity, escaped JSON) so I can use it in my project.

### Formats to support

| Format | Example for `बोदो` | Use case |
|--------|-------------------|----------|
| Plain Unicode | `बोदो` | Paste into any app |
| HTML entities | `&#x092C;&#x094B;&#x926;&#x094B;` | Safe HTML embedding |
| JSON escape | `बोदो` | JavaScript string literals |
| URI encoded | `%E0%A4%AC%E0%A5%8B%E0%A4%A6%E0%A5%8B` | URL parameters |

### Implementation

```typescript
function toHtmlEntities(s: string): string {
  return [...s].map(ch =>
    `&#x${ch.codePointAt(0)!.toString(16).toUpperCase()};`
  ).join('');
}

function toJsonEscape(s: string): string {
  return [...s].map(ch => {
    const cp = ch.codePointAt(0)!;
    if (cp > 0xFFFF) {
      // Surrogate pair for supplementary plane
      const hi = 0xD800 + ((cp - 0x10000) >> 10);
      const lo = 0xDC00 + ((cp - 0x10000) & 0x3FF);
      return `\\u${hi.toString(16).padStart(4,'0')}\\u${lo.toString(16).padStart(4,'0')}`;
    }
    return `\\u${cp.toString(16).padStart(4,'0')}`;
  }).join('');
}
```

### UI

Add an Export dropdown button next to the Copy button in the output panel:

```
[ Copy ]  [ Export ▾ ]
              ├─ Plain Unicode
              ├─ HTML entities
              ├─ JSON escape
              └─ URI encoded
```

---

## FEAT-004 — Mobile soft-keyboard support · L

### Problem

`keydown` events are unreliable on mobile soft keyboards — some Android IMEs
suppress them entirely and only fire `input` / `compositionend` events.
The current hook misses keystrokes on mobile.

### Solution architecture

Use a **hidden input** to capture raw Roman keystrokes on mobile, and the
`InputEvent.inputType` field to detect insertions vs deletions:

```typescript
function useMobileCapture(onInsert: (text: string) => void, onDelete: () => void) {
  const ref = useRef<HTMLInputElement>(null);

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const ev = e.nativeEvent as InputEvent;
    if (ev.inputType === 'insertText' && ev.data) {
      onInsert(ev.data);
    } else if (ev.inputType === 'deleteContentBackward') {
      onDelete();
    }
    // Reset the hidden input so it never accumulates content
    (e.target as HTMLInputElement).value = '';
  };

  return { ref, handleInput };
}
```

```tsx
{/* Hidden input for mobile capture */}
<input
  ref={hiddenInputRef}
  style={{ position: 'absolute', opacity: 0, width: 1, height: 1, pointerEvents: 'none' }}
  autoComplete="off"
  autoCorrect="off"
  autoCapitalize="off"
  spellCheck={false}
  onInput={handleInput}
/>
{/* Visible Devanagari display (readOnly on mobile) */}
<div
  role="textbox"
  aria-multiline="true"
  onClick={() => hiddenInputRef.current?.focus()}
>
  {ime.value}
</div>
```

### Detection

Use `navigator.maxTouchPoints > 0` or a CSS media query `(pointer: coarse)`
to switch between desktop (keydown) and mobile (input event) mode.

---

## FEAT-005 — Light / dark theme toggle · S

### User story

> As a user working in bright conditions, I want a light theme option.

### Design tokens required

Define a second token set mirroring the existing `GH` object:

```typescript
const GH_LIGHT = {
  canvasDefault: '#ffffff',
  canvasSubtle:  '#f6f8fa',
  canvasInset:   '#eaeef2',
  borderDefault: '#d0d7de',
  borderMuted:   '#d8dee4',
  fgDefault:     '#1f2328',
  fgMuted:       '#636c76',
  fgSubtle:      '#6e7781',
  accentFg:      '#0969da',
  accentEmphasis:'#0550ae',
  accentSubtle:  '#ddf4ff',
  successFg:     '#1a7f37',
  successSubtle: '#dafbe1',
  attentionFg:   '#9a6700',
  dangerFg:      '#d1242f',
  dangerSubtle:  '#FFEBE9',
} as const;
```

### Implementation

Thread a `theme: 'dark' | 'light'` prop (or React context) through the
component tree and swap the token object:

```typescript
const GH = theme === 'dark' ? GH_DARK : GH_LIGHT;
```

Add a sun/moon toggle button to the header.

Persist the choice in `localStorage`:
```typescript
const [theme, setTheme] = useState<'dark'|'light'>(
  () => (localStorage.getItem('bodo-theme') as 'dark'|'light') ?? 'dark'
);
```

---

## FEAT-006 — On-screen virtual keyboard · L

### User story

> As a new user who does not know the Roman key mappings, I want a clickable
> on-screen keyboard that shows Bodo Devanagari on each key.

### Layout

Model the virtual keyboard on the Bodo quick-reference layout from
`docs/12-quick-reference.md`:

```
Row 1: q  w→ओ  e→ए  r→र  t→थ  y→य  u→उ  i→इ  o→अ  p→फ
Row 2: a→आ  s→स  d→द  f→फ  g→ग  h→ह  j→ज  k→ख  l→ल
Row 3: z  x→ष  c→च  v→व  b→ब  n→न  m→म
```

Each key shows its Roman letter (small) and Devanagari output (large).
Clicking a key fires the same path as `handleKeyDown` with that key.

### Shift / Caps handling

A Shift toggle button modifies the displayed layout to show the shifted
outputs (e.g., `k` → ख becomes `K` → no mapping, `S` → श).

### Integration

```tsx
<VirtualKeyboard
  onKey={(key: string) => {
    const syntheticEvent = { key, preventDefault: () => {} } as React.KeyboardEvent;
    ime.handleKeyDown(syntheticEvent);
  }}
/>
```

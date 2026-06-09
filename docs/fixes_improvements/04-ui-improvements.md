# UI & UX Improvements

Improvements to `src/App.tsx` and the overall interface.  Engine changes are
not required unless noted.

---

## UI-001 — Responsive layout breaks below 768 px · 🔴 High

### Problem

The main two-column grid uses:

```typescript
gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)',
```

On viewport widths below ~768 px (most phones) both columns are squeezed to
~180 px each, making the reference table and the textarea unusably narrow.
There is no mobile breakpoint.

### Fix

Use CSS `@media` or an inline JS breakpoint hook to collapse to a single
column on narrow viewports:

```typescript
function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return mobile;
}
```

```typescript
// In App root:
const isMobile = useIsMobile();

<div style={{
  gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.1fr) minmax(0, 0.9fr)',
  ...
}}>
```

On mobile the Reference panel moves below the Transliterator panel, and the
tabs become a horizontally scrollable strip.

---

## UI-002 — No keyboard focus ring on interactive elements · 🟡 Medium

### Problem

All buttons and tab controls use inline style objects.  None define a
`:focus-visible` CSS rule, so keyboard-only users get no visual indication
of which control is focused.  This fails WCAG 2.1 SC 2.4.7.

### Fix

Add `outline` to the inline style on focus.  Because inline styles cannot
express `:focus-visible` pseudo-class, the cleanest solution is to replace
inline button styles with a CSS class:

```css
/* In App.css */
.gh-btn:focus-visible {
  outline: 2px solid #2f81f7;
  outline-offset: 2px;
}
.gh-btn:focus:not(:focus-visible) {
  outline: none;
}
```

Alternatively, use a `useRef` + `onFocus`/`onBlur` pair in the `Btn`
component to toggle an `outline` style programmatically:

```typescript
const [focused, setFocused] = useState(false);

<button
  style={{
    ...base,
    outline: focused ? `2px solid ${GH.accentFg}` : 'none',
    outlineOffset: '2px',
  }}
  onFocus={() => setFocused(true)}
  onBlur={() => setFocused(false)}
>
```

---

## UI-003 — Reference panel max-height is hardcoded · 🟡 Medium

### Problem

```typescript
<div style={{ overflowY: 'auto', maxHeight: '520px' }}>
```

On tall screens (1440p monitors) the reference panel shows only half the
available space and scrolls unnecessarily.  On short screens (768 px height,
laptop) the panel overflows below the fold.

### Fix

Calculate the available height dynamically using `calc`:

```typescript
maxHeight: 'calc(100vh - 280px)',
```

280 px accounts for the header (48 px), card padding (40 px), tab bar
(40 px), and section heading row (~40 px), with ~112 px of safety margin.

For an exact solution, measure the parent with a `ResizeObserver` and set
maxHeight to `parentHeight - fixedChildrenHeight`.

---

## UI-004 — Composing hint shows the entire value, not just the in-progress part · 🟡 Medium

### Problem

In `App.tsx`, the composing hint slice calculation:

```typescript
ime.value.slice(ime.value.length - ime.romanBuffer.length >= 0
  ? ime.value.length - ime.romanBuffer.length : 0)
```

This is incorrect.  `romanBuffer.length` is the number of Roman characters,
but `ime.value.length` is the number of Unicode code units.  Because
Devanagari mātrā sequences expand one Roman char to 2+ Unicode chars, the
slice start position is often wrong, showing too much or too little of the
in-progress transliteration.

### Fix

The in-progress transliteration is simply `transliterate(ime.romanBuffer)`.
Use that directly:

```typescript
import { transliterate } from '../engine/transliterator';

// In the composing hint:
<span style={{ ... }}>
  {transliterate(ime.romanBuffer)}
</span>
```

This is always accurate because `ime.value = committedUnicode + transliterate(romanBuffer)`,
so the live preview is exactly `transliterate(romanBuffer)`.

---

## UI-005 — No character count for Devanagari grapheme clusters · 🟢 Low

### Problem

The status bar shows `charCount`:

```typescript
const charCount = [...ime.value].length;
```

This counts Unicode codepoints.  A Devanagari syllable like `बो` is two
codepoints (ब U+092C + ो U+094B), so the count reads 2, not 1.  For a
typist, counting grapheme clusters (visible characters) is more meaningful.

### Fix

```typescript
const graphemeCount = ime.value
  ? [...new Intl.Segmenter().segment(ime.value)].length
  : 0;
```

Show both if desired:
```
12 syllables  ·  18 codepoints  ·  3 lines
```

---

## UI-006 — Tab labels in the reference panel have no accessible roles · 🟢 Low

### Problem

The `<Tabs>` component renders `<button>` elements styled to look like tabs,
but does not apply ARIA tab semantics.  Screen readers announce them as
generic buttons with no indication that they control a panel.

### Fix

Apply the ARIA tab pattern:

```tsx
<div role="tablist" aria-label="Reference categories">
  {tabs.map(tab => (
    <button
      key={tab.id}
      role="tab"
      id={`tab-${tab.id}`}
      aria-selected={tab.id === active}
      aria-controls={`panel-${tab.id}`}
      onClick={() => onChange(tab.id)}
    >
      {tab.label}
    </button>
  ))}
</div>

<div
  role="tabpanel"
  id={`panel-${active}`}
  aria-labelledby={`tab-${active}`}
>
  {/* tab content */}
</div>
```

---

## UI-007 — The IME on/off toggle in the header is disconnected from `EditorPanel` · 🟡 Medium

### Problem

`App` holds `imeActive` state and passes it to `Header` (for the status dot)
and to `EditorPanel` (for the keyboard handler).  However, `EditorPanel`
also maintains its own local `imeOn` state used to toggle via F9:

```typescript
// In EditorPanel
const [imeOn, setImeOn] = useState(true);

const handleKeyDown = useCallback(
  (e) => {
    if (e.key === 'F9') { e.preventDefault(); setImeOn(v => !v); return; }
    ...
  }
)
```

Pressing F9 changes `imeOn` (local) but not `imeActive` (in `App`), so the
header status dot stays green even after IME is disabled via F9.

### Fix

Remove the local `imeOn` state from `EditorPanel`.  Lift it entirely to `App`
and pass `imeActive` + `onToggleIme` down:

```typescript
// App.tsx
const [imeActive, setImeActive] = useState(true);
<EditorPanel imeActive={imeActive} onToggleIme={() => setImeActive(v => !v)} />
<Header imeActive={imeActive} onToggleIme={() => setImeActive(v => !v)} />

// EditorPanel
function EditorPanel({ imeActive, onToggleIme }: { imeActive: boolean; onToggleIme: () => void }) {
  const handleKeyDown = (e) => {
    if (e.key === 'F9') { e.preventDefault(); onToggleIme(); return; }
    if (imeActive) ime.handleKeyDown(e);
  };
}
```

This makes F9, the header toggle button, and the status dot all point to the
same source of truth.

---

## UI-008 — Shortcuts bar wraps awkwardly on medium-width screens · 🟢 Low

### Problem

On ~1024 px wide viewports the shortcuts bar items wrap mid-row, breaking the
visual rhythm.  Because there are 6 items at ~120 px each the total is ~720 px
plus label, which fits on 1200 px but overflows at 1024 px.

### Fix

Hide lower-priority shortcuts behind a "More" disclosure on narrow viewports,
or reduce the item count from 6 to 4:

```typescript
// Show only the 4 most important shortcuts unconditionally
const PRIMARY = ['F9', 'Space', 'Backspace', '|'];
// Show the rest in a tooltip or collapsed section
const SECONDARY = ['ng', 'NG'];
```

# Chapter 11 — Performance & Future Work

## 11.1 Current Performance Profile

The existing engine is fast enough for interactive IME use:

| Operation | Typical input | Time |
|-----------|-------------|------|
| `tokenize("bwdw")` | 4 Roman chars | ~2 µs |
| `transliterate("bwdw")` | 4 Roman chars | ~5 µs |
| `transliterate(1000 chars)` | Long paragraph | ~1 ms |

For IME use, input is typically 1–20 characters (a single word being typed).
The current implementation is well within the 16ms frame budget.

---

## 11.2 Improvement 1 — Trie-Based Tokenizer

### Current approach

Linear scan through 61 tokens per input position.  O(n × m) where n = input
length, m = token count (61).

### Trie approach

Build a **prefix trie** from all token keys at startup.  At each input
position, walk the trie one character at a time.  The deepest node that
marks a valid token end is the longest match.

```
Trie node:
  children: Map<char, TrieNode>
  tokenKind: TokenKind | null
  output: string | null
```

**Complexity:** O(n × k) where k = max key length (3).  In practice O(n).

**Tradeoff:**
- ~30% faster tokenisation for long strings
- Trie construction cost at module load (~100 µs, amortised)
- More code; harder to read than the sorted-array approach
- Worth it if transliterating long documents; overkill for word-by-word IME

**Implementation sketch:**

```typescript
class TrieNode {
  children = new Map<string, TrieNode>();
  tokenKind: TokenKind | null = null;
}

function buildTrie(entries: Entry[]): TrieNode {
  const root = new TrieNode();
  for (const { key, kind } of entries) {
    let node = root;
    for (const ch of key) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch)!;
    }
    node.tokenKind = kind;
  }
  return root;
}
```

---

## 11.3 Improvement 2 — Finite-State Transducer (FST)

An FST encodes both tokenisation and the state-machine transitions in a
single compact automaton.  The entire transliterator becomes a single-pass
O(n) process with no dynamic allocation.

**How it would work:**

Each FST state corresponds to a `(tokenizer_state, ime_state)` pair.
Transitions are labelled with input characters; outputs are Devanagari
Unicode strings emitted on each transition.

```
State (initial, initial):
  'k' → emit 'ख', go to (after_aspirated_k, after_consonant)
  'g' → emit 'ग', go to (*, after_consonant)
  'o' → emit 'अ', go to (*, after_vowel)
  ...
State (after_aspirated_k, after_consonant):
  'h' → emit '' (overwrite? or merge ख+ह into खह?), go to ...
  'a' → emit 'ा', go to (*, after_vowel)
  ...
```

**Advantages:**
- Near-O(1) per character
- No memory allocation during transliteration
- Serialisable to a compact binary format

**Disadvantages:**
- FST construction is complex
- The ng rule (lookahead) requires additional states
- Changes to mappings require rebuilding the FST

**Recommendation:** Implement as an optimisation pass over the existing
tokenizer+transliterator output.  The current rule-based engine serves
as the reference implementation.

---

## 11.4 Improvement 3 — Web Worker

Move the entire `src/engine/` to a Web Worker, keeping the main thread free
for rendering.

```
Main thread                       Worker thread
     │                                  │
  keydown event                         │
     │  postMessage({type:'key', key})  │
     └─────────────────────────────────►│
                                        │  tokenize() + transliterate()
     ◄─────────────────────────────────┤
     │  postMessage({type:'result', v}) │
  setState(v)
  re-render
```

**Latency:** ~1ms round-trip via `postMessage`.  Unnoticeable at typing speed.

**React integration:**

```typescript
const workerRef = useRef<Worker>();
useEffect(() => {
  workerRef.current = new Worker(new URL('./engine.worker.ts', import.meta.url));
  workerRef.current.onmessage = (e) => setValue(e.data.value);
  return () => workerRef.current?.terminate();
}, []);
```

**Recommendation:** Not needed for this use case.  The transliterator is
fast enough on the main thread.  Worth implementing if the dictionary
suggestion feature (see below) is added.

---

## 11.5 Improvement 4 — WASM Compilation

Compile the tokenizer and state machine to WebAssembly via AssemblyScript
or Rust/wasm-bindgen.

**Typical speedup:** 5–10× for pure computation.
**Main bottleneck shift:** After WASM, the bottleneck moves to JS↔WASM
boundary calls, not the algorithm.

**Recommendation:** Not recommended for this engine.  The pure-JS
implementation is already fast enough, and WASM adds significant build
complexity with marginal benefit for an IME.

---

## 11.6 Improvement 5 — Dictionary-Assisted Suggestions

Add a Bodo word frequency dictionary to show ranked completion suggestions
as the user types.

```
User types: "namoskaar"
Engine shows suggestions:
  1. नमस्कार   (standard greeting)   freq=9821
  2. नमो        (short form)          freq=2341
```

**Architecture:**

```
transliterate(roman) → candidate Unicode prefix
        │
   PrefixLookup(prefix, dict)
        │
   [ (word, frequency), ... ]  sorted by frequency
        │
   Display top-5 in suggestion bar
```

**Data requirements:**
- A Bodo word list with frequency counts
- Unicode-normalised entries (NFC)
- Index: Devanagari prefix → list of (word, freq) pairs

**Where to get data:**
- Bodo Wikipedia corpus (relatively small: ~5,000 articles)
- Bodo news sites (Bodo Sahitya Sabha publications)
- CLDR Bodo locale data

**Storage:** A prefix-compressed trie of 50,000 words ≈ 2–5 MB in memory.
Can be stored as JSON and loaded lazily.

---

## 11.7 Improvement 6 — Full Mobile IME

Current limitation: `keydown` events are unreliable on mobile soft keyboards.

**Solution:**

1. Use a **hidden input** to capture raw mobile keyboard events
2. On `compositionend` or `input` event, read the raw value
3. Detect what was added/removed since last event
4. Feed the delta through the transliterator

```typescript
// Hidden input captures raw Roman
<input
  ref={hiddenRef}
  style={{ position: 'absolute', opacity: 0, width: 1 }}
  onInput={handleMobileInput}
/>
// Visible textarea shows Devanagari
<textarea value={devanagari} readOnly />
```

**Alternatively:** Use the [InputEvent API](https://developer.mozilla.org/en-US/docs/Web/API/InputEvent) with `inputType` field to detect character insertions on mobile.

---

## 11.8 Improvement 7 — Normalisation & NFC

Devanagari text should be stored in **Unicode NFC** (Canonical Decomposition,
followed by Canonical Composition) form.  Most Devanagari strings produced
by this engine are already NFC because they use pre-composed characters
from the Devanagari block.

Add a normalisation step as a postcondition:

```typescript
export function transliterate(input: string): string {
  return processTokens(tokenize(input)).normalize('NFC');
}
```

This prevents invisible differences when comparing strings from different
sources (e.g., text pasted from another app may be NFD-normalised).

---

## 11.9 Summary Table

| Improvement | Complexity | Speedup | Priority |
|-------------|-----------|---------|----------|
| Trie tokenizer | Medium | 30% | Low |
| FST | High | 10× | Research |
| Web Worker | Low | N/A (UX) | Low |
| WASM | High | 5–10× | Not recommended |
| Dictionary suggestions | Medium | — | High (UX) |
| Mobile IME | Medium | — | High (reach) |
| NFC normalisation | Trivial | — | Do now |

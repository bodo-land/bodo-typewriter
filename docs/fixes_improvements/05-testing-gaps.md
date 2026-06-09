# Testing Gaps

The current test suite (`src/__tests__/transliterator.test.ts`) has 90 tests
covering the engine's happy paths.  This document lists the coverage gaps that
would catch real bugs before they reach users.

Run the suite with:
```bash
npx vitest run            # one-shot
npx vitest               # watch mode
npx vitest --coverage    # line coverage report
```

---

## TST-001 — No tests for `useBodoIME` hook · High

### Gap

The hook (`src/hooks/useBodoIME.ts`) has zero test coverage.  Every interaction
path — backspace, commit on space, IME toggle, reset — is only tested manually.

### Tests to add

Use `@testing-library/react` to render the hook in a test component:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useBodoIME } from '../hooks/useBodoIME';

describe('useBodoIME', () => {
  function key(k: string, opts: Partial<React.KeyboardEvent> = {}) {
    return { key: k, preventDefault: () => {}, ctrlKey: false,
             metaKey: false, altKey: false, ...opts } as React.KeyboardEvent<HTMLElement>;
  }

  it('builds romanBuffer from keypresses', () => {
    const { result } = renderHook(() => useBodoIME());
    act(() => result.current.handleKeyDown(key('b')));
    act(() => result.current.handleKeyDown(key('w')));
    expect(result.current.romanBuffer).toBe('bw');
    expect(result.current.value).toBe('बो');
  });

  it('commits on space', () => {
    const { result } = renderHook(() => useBodoIME());
    act(() => result.current.handleKeyDown(key('b')));
    act(() => result.current.handleKeyDown(key('w')));
    act(() => result.current.handleKeyDown(key(' ')));
    expect(result.current.romanBuffer).toBe('');
    expect(result.current.value).toBe('बो ');
  });

  it('backspace removes last roman char from buffer', () => {
    const { result } = renderHook(() => useBodoIME());
    act(() => result.current.handleKeyDown(key('k')));
    act(() => result.current.handleKeyDown(key('h')));
    expect(result.current.value).toBe('ख');
    act(() => result.current.handleKeyDown(key('Backspace')));
    expect(result.current.romanBuffer).toBe('k');
    expect(result.current.value).toBe('ख');
  });

  it('backspace into committed text removes last committed codepoint', () => {
    const { result } = renderHook(() => useBodoIME());
    act(() => result.current.handleKeyDown(key('b')));
    act(() => result.current.handleKeyDown(key('w')));
    act(() => result.current.handleKeyDown(key(' ')));  // commit "बो "
    act(() => result.current.handleKeyDown(key('Backspace'))); // remove space
    act(() => result.current.handleKeyDown(key('Backspace'))); // remove ो (matra)
    expect(result.current.value).toBe('ब');
  });

  it('reset clears everything', () => {
    const { result } = renderHook(() => useBodoIME());
    act(() => result.current.handleKeyDown(key('b')));
    act(() => result.current.handleKeyDown(key('w')));
    act(() => result.current.reset());
    expect(result.current.value).toBe('');
    expect(result.current.romanBuffer).toBe('');
  });

  it('ctrl+Z is passed through to browser', () => {
    const { result } = renderHook(() => useBodoIME());
    const preventDefaultSpy = vi.fn();
    act(() =>
      result.current.handleKeyDown(
        key('z', { ctrlKey: true, preventDefault: preventDefaultSpy })
      )
    );
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });
});
```

---

## TST-002 — No boundary tests for the ng rule · High

### Gap

The ng rule has 5 tests in the existing suite but they do not cover:

- `ng` at the very start of input (no preceding consonant)
- `ng` followed by another `ng` (`ngng`)
- `M` (capital M) behaving identically to `ng` in all positions
- `oM` (documented special case) vs `o` + `M` producing different output

### Tests to add

```typescript
describe('ng / M rule edge cases', () => {
  it('ng at start of input emits standalone anusvara', () => {
    expect(transliterate('ng')).toBe('ं');
  });

  it('ngng emits anusvara then anusvara+ga (second ng before end)', () => {
    // First ng: no following vowel → anusvara
    // Second ng: no following vowel → anusvara
    expect(transliterate('ngng')).toBe('ंं');
  });

  it('M is identical to ng in all positions', () => {
    expect(transliterate('saM')).toBe(transliterate('sang'));
    expect(transliterate('Mga')).toBe(transliterate('nga'));
  });

  it('oM emits अं not अ + anusvara separately', () => {
    // oM is a single 3-char token; o+M would be two tokens
    expect(transliterate('oM')).toBe('अं');
    // Verify o+M route also works (romanBuffer split across commits is impossible
    // but the engine should handle o then M correctly)
  });

  it('ng followed by ng-starting vowel like nga correctly', () => {
    expect(transliterate('nga')).toBe('ंगा');
    expect(transliterate('ngi')).toBe('ंगि');
    expect(transliterate('ngo')).toBe('ंग');  // 'o' = inherent vowel, no matra
  });
});
```

---

## TST-003 — No tests for NFC output normalisation · Medium

### Gap

The `transliterate()` NFC fix (added in the perf commit) has no test.  If
someone removes the `.normalize('NFC')` call, no test fails.

### Tests to add

```typescript
describe('NFC normalisation', () => {
  it('output is always NFC', () => {
    const cases = ['bwdw', 'gonga', 'kng', 'oM', 'OM', 'bwdwland'];
    for (const input of cases) {
      const out = transliterate(input);
      expect(out).toBe(out.normalize('NFC'));
    }
  });

  it('output does not contain isolated combining marks', () => {
    // NFD would put the matra before the base in some edge cases
    const out = transliterate('kng'); // ख + anusvara
    expect(out.normalize('NFD')).toBe(out.normalize('NFC')); // Devanagari BMP = same
  });
});
```

---

## TST-004 — No tests for `mapCursorPosition` · Medium

### Gap

`transliterator.ts` exports `mapCursorPosition` but it has no tests.

### Tests to add

```typescript
describe('mapCursorPosition', () => {
  it('cursor at 0 maps to 0', () => {
    expect(mapCursorPosition('bwdw', 0)).toBe(0);
  });

  it('cursor after first roman char maps correctly', () => {
    // 'b' → ब (1 codepoint)
    expect(mapCursorPosition('bwdw', 1)).toBe(1);
  });

  it('cursor after 2-char token maps to end of multi-codepoint output', () => {
    // 'kh' → ख (1 codepoint) — cursor at 2 roman = 1 unicode
    expect(mapCursorPosition('kha', 2)).toBe(1);
    // 'kha' → खा (2 codepoints) — cursor at 3 roman = 2 unicode
    expect(mapCursorPosition('kha', 3)).toBe(2);
  });

  it('cursor at end maps to full output length', () => {
    const roman = 'bwdw';
    const unicode = transliterate(roman);
    expect(mapCursorPosition(roman, roman.length)).toBe(unicode.length);
  });
});
```

---

## TST-005 — No tests for trie-specific behaviour · Medium

### Gap

The trie was added as a performance improvement with the claim that semantics
are identical to the old sorted-array scan.  There is no test that explicitly
verifies the trie produces the same output as the reference implementation for
all known tokens.

### Tests to add

```typescript
import { tokenize } from '../engine/tokenizer';
import { ALL_ENTRIES } from '../engine/tokenizer'; // export for testing only

describe('trie tokenizer — completeness', () => {
  it('every mapping key tokenizes to itself with correct kind', () => {
    for (const { key, kind } of ALL_ENTRIES) {
      const tokens = tokenize(key);
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toEqual({ raw: key, kind });
    }
  });

  it('longer key wins over prefix', () => {
    // 'kh' must win over 'k' + 'h'
    const tokens = tokenize('kh');
    expect(tokens).toHaveLength(1);
    expect(tokens[0].raw).toBe('kh');
  });

  it('ng wins over n + g', () => {
    const tokens = tokenize('ng');
    expect(tokens).toHaveLength(1);
    expect(tokens[0].raw).toBe('ng');
  });
});
```

Note: `ALL_ENTRIES` is currently not exported.  Add `export` to the
`const ALL_ENTRIES` declaration to enable this test.

---

## TST-006 — Property-based / fuzz testing · Low (but high value)

### Gap

All current tests are example-based.  A property-based test would generate
random Roman strings and assert structural invariants, finding edge cases that
example tests miss.

### Invariants to test

1. `transliterate(s)` never throws for any string `s`.
2. `transliterate(s).normalize('NFC') === transliterate(s)` for all `s`.
3. `tokenize(s).map(t => t.raw).join('') === s` for all `s` (tokens cover input exactly).
4. `transliterate('')` returns `''`.
5. `transliterate(s + ' ' + t) === transliterate(s) + ' ' + transliterate(t)` — space is always a boundary.

### Setup with `fast-check`

```bash
npm install --save-dev fast-check
```

```typescript
import * as fc from 'fast-check';

describe('property tests', () => {
  it('transliterate never throws', () => {
    fc.assert(fc.property(fc.string(), s => {
      expect(() => transliterate(s)).not.toThrow();
    }));
  });

  it('transliterate output is always NFC', () => {
    fc.assert(fc.property(fc.string(), s => {
      const out = transliterate(s);
      expect(out).toBe(out.normalize('NFC'));
    }));
  });

  it('tokenize covers the entire input', () => {
    fc.assert(fc.property(fc.string(), s => {
      const tokens = tokenize(s);
      expect(tokens.map(t => t.raw).join('')).toBe(s);
    }));
  });
});
```

Run with increased number of test cases for thoroughness:
```typescript
fc.assert(fc.property(...), { numRuns: 10_000 });
```

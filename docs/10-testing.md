# Chapter 10 — Testing Guide

## 10.1 Running Tests

```bash
npx vitest run          # single run, all tests
npx vitest              # watch mode (re-runs on file save)
npx vitest run --reporter=verbose   # detailed output per test
```

All tests live in `src/__tests__/transliterator.test.ts`.

---

## 10.2 Test Taxonomy

Tests are grouped into `describe` blocks:

| Block | What it covers |
|-------|---------------|
| `tokenizer — longest-match` | Token splitting, category, length priority |
| `standalone vowels` | All vowel keys in initial / after-vowel position |
| `consonants — documented` | Every consonant from the help page |
| `consonants — inferred` | Inferred consonants from Assamese chart |
| `consonant + vowel (mātrā)` | All vowel signs after a consonant |
| `consonant clusters` | Halant insertion, multi-consonant conjuncts |
| `special mappings` | Danda, danda, avagraha, rupee, OM |
| `ng special rule` | Four sub-cases of the ng rule |
| `full word transliterations` | End-to-end word examples |
| `edge cases` | Empty string, spaces, double consonant, I as ya |

Every test is labelled `[D]` (documented) or `[I]` (inferred).

---

## 10.3 Test Style

Tests use the smallest possible input that exercises one rule:

```typescript
// Good — minimal, labelled
it('[D] ka → खा', () => expect(transliterate('ka')).toBe('खा'));

// Good — traces the full ng rule
it('[D] gonga → गंगा', () => expect(transliterate('gonga')).toBe('गंगा'));

// Avoid — too many things at once, hard to diagnose failures
it('transliterates a paragraph correctly', () => ...);
```

Tokeniser tests use `toMatchObject` to check only relevant fields:

```typescript
it('ng is a vowel token', () => {
  expect(tokenize('ng')[0]).toMatchObject({ raw: 'ng', kind: 'vowel' });
});
```

---

## 10.4 Adding New Tests

### For a new consonant mapping

If you add `'q'` → ??? to CONSONANT_MAPPINGS, add:

```typescript
it('[I] q → ???', () => expect(transliterate('q')).toBe('???'));
it('[I] qa → ???ा', () => expect(transliterate('qa')).toBe('???ा'));
it('[I] qk → ???्ख', () => expect(transliterate('qk')).toBe('???्ख'));
```

Three tests:
1. Consonant alone (inherent vowel)
2. Consonant + AA mātrā
3. Consonant cluster (halant)

### For a new vowel mapping

```typescript
it('[I] newVowelKey standalone → NewChar', () =>
  expect(transliterate('newKey')).toBe('NewChar'));

it('[I] k + newVowelKey → ख + NewMatra', () =>
  expect(transliterate('k' + 'newKey')).toBe('ख' + 'NewMatra'));
```

### For a new special mapping

```typescript
it('[I] specialKey → SpecialChar', () =>
  expect(transliterate('specialKey')).toBe('SpecialChar'));

// Verify it resets state
it('[I] k + specialKey + a → ख + SpecialChar + आ', () =>
  expect(transliterate('k' + 'specialKey' + 'a')).toBe('ख' + 'SpecialChar' + 'आ'));
```

---

## 10.5 Current Test Coverage (90 tests)

```
tokenizer — longest-match    9 tests
standalone vowels           17 tests
consonants — documented     21 tests
consonants — inferred       10 tests
consonant + vowel            10 tests
consonant clusters           4 tests
special mappings             5 tests
ng special rule              5 tests
full word transliterations   5 tests
edge cases                   4 tests
```

---

## 10.6 What Is NOT Tested

The following are known gaps:

| Gap | Reason | How to test |
|-----|--------|-------------|
| React hook (useBodoIME) | Needs `@testing-library/react` | `renderHook`, simulate keydown events |
| BodoInput component | Needs DOM | RTL integration test |
| Cursor position mapping | Needs DOM selection API | JSDOM + `setSelectionRange` |
| Mobile composition | Needs soft keyboard | Playwright/Cypress device emulation |
| Paste handler | Needs ClipboardEvent | RTL fireEvent.paste |

For the React tests, install `@testing-library/react`:

```bash
npm install --save-dev @testing-library/react @testing-library/user-event
```

Example hook test:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useBodoIME } from '../hooks/useBodoIME';

it('handles backspace into roman buffer', () => {
  const { result } = renderHook(() => useBodoIME());

  act(() => {
    // simulate typing 'bw'
    result.current.setRoman('bw');
  });
  expect(result.current.value).toBe('बो');

  act(() => {
    result.current.setRoman('b');
  });
  expect(result.current.value).toBe('ब');
});
```

---

## 10.7 CI Configuration

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

For coverage, install `@vitest/coverage-v8`:

```bash
npm install --save-dev @vitest/coverage-v8
npx vitest run --coverage
```

Coverage target: 100% of `src/engine/` (pure logic).  Components and
hooks are harder to achieve 100% on without DOM tests.

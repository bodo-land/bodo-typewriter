# बोदो Typewriter — Documentation

A complete reverse-engineering of the Pramukh IME Bodo typing engine and an
open-source reimplementation in TypeScript + React.

---

## Table of Contents

| # | Document | What you will learn |
|---|----------|---------------------|
| 1 | [Bodo Language & Script](01-bodo-language.md) | Who speaks Bodo, which script is used, Unicode blocks |
| 2 | [How Transliteration IMEs Work](02-how-imes-work.md) | IME taxonomy, pipeline stages, state machines |
| 3 | [Reverse Engineering the Pramukh Engine](03-reverse-engineering.md) | Source documentation, chart analysis, inference methodology |
| 4 | [Complete Mapping Tables](04-mapping-tables.md) | Every vowel, consonant, matra, and special character |
| 5 | [The ng Rule & Other Special Cases](05-special-rules.md) | The ng/anusvara rule, inherent vowel, conjuncts |
| 6 | [Architecture & Design](06-architecture.md) | File layout, module responsibilities, data-flow diagram |
| 7 | [The Tokenizer](07-tokenizer.md) | Longest-match algorithm, why order matters, edge cases |
| 8 | [The Transliterator State Machine](08-transliterator.md) | States, transitions, token processing |
| 9 | [React Integration](09-react-integration.md) | useBodoIME hook, BodoInput component, cursor handling |
| 10 | [Testing Guide](10-testing.md) | Test taxonomy, running tests, adding new cases |
| 11 | [Performance & Future Work](11-performance.md) | Trie, FST, WASM, dictionary suggestions |
| 12 | [Typing Quick-Reference](12-quick-reference.md) | Full cheat-sheet for end users |
| 13 | [Key & Unicode Reference](13-key-and-unicode-reference.md) | Every key → Unicode code point, generated straight from mappings.ts/unicode.ts, with known discrepancies flagged |
| — | [Fixes & Improvements](fixes_improvements/00-index.md) | Bug tracker, engine gaps, feature roadmap, UI issues, testing gaps |

---

## Quick Start

```bash
npm install
npm run dev          # development server
npx vitest run       # run tests
npm run build        # production build
```

---

## Source Provenance

Every rule in this codebase is tagged with one of three source labels:

| Label | Meaning |
|-------|---------|
| **DOCUMENTED** | Explicitly stated on `pramukhime.com/help/bodo-typing-help` |
| **INFERRED** | Derived from the Assamese Pramukh chart (`pramukhindic-assamese.png`), standard Devanagari conventions, or Bodo phonology |
| *(derived)* | Computed from other rules at runtime (e.g. halant insertion) |

These labels appear as comments in every source file.

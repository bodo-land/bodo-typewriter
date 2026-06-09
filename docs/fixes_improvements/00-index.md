# Fixes & Improvements — Index

This subdirectory documents known issues, planned improvements, and feature
gaps discovered during development and post-launch review.

Documents are numbered in priority order.  Each entry describes the **current
behaviour**, the **desired behaviour**, the **root cause**, and a
**concrete implementation plan** with code sketches where relevant.

---

## Documents

| # | Document | Topic |
|---|----------|-------|
| 01 | [Bug Tracker](01-bug-tracker.md) | Known bugs with root-cause analysis and fixes |
| 02 | [Engine Improvements](02-engine-improvements.md) | Transliterator and tokenizer gaps |
| 03 | [Feature Roadmap](03-feature-roadmap.md) | New capabilities: dictionary, undo, export |
| 04 | [UI & UX Improvements](04-ui-improvements.md) | Interface gaps: mobile, accessibility, themes |
| 05 | [Testing Gaps](05-testing-gaps.md) | Missing test coverage and property tests |

---

## How to Use These Documents

- **Bug Tracker** — Check here before opening an issue.  Each bug has a
  reproduction recipe, a root-cause explanation, and a ready-to-apply fix.
- **Engine Improvements** — These require changes inside `src/engine/`.
  Difficulty is rated Low / Medium / High.
- **Feature Roadmap** — Product-level additions.  Each entry includes an
  effort estimate and the data or API dependencies needed.
- **UI & UX** — Frontend and accessibility improvements.  Most are
  self-contained in `src/App.tsx` or `src/components/`.
- **Testing Gaps** — Add these tests before shipping any engine change to
  avoid regressions.

---

## Severity Key

| Icon | Meaning |
|------|---------|
| 🔴 | Incorrect output — data loss or wrong Unicode |
| 🟡 | Degraded experience — confusing but not data-destroying |
| 🟢 | Nice-to-have — polish, performance, or accessibility |

# Chapter 2 — How Transliteration IMEs Work

## 2.1 IME Taxonomy

An **Input Method Editor (IME)** is a software layer between the keyboard and
an application that allows characters not present on the keyboard to be entered.

For Indian languages, four main IME types exist:

| Type | How it works | Example |
|------|-------------|---------|
| **Phonetic transliteration** | Roman keystrokes map to phonetically equivalent script characters | Pramukh IME, Google Input |
| **InScript / keyboard remapping** | Each physical key maps to a fixed script key (standardised by Government of India) | InScript Devanagari |
| **Handwriting recognition** | User draws characters; ML model recognises them | Google Handwriting |
| **Dictionary-assisted** | Phonetic input + word frequency model disambiguates homophones | Google Transliterate, Microsoft IME |

**Pramukh IME** is a pure phonetic transliteration IME — no dictionary,
no machine learning.  Every output is deterministically derived from the
input keystroke sequence via a static rule table.

## 2.2 Pipeline Overview

```
User keystroke(s)
        │
        ▼
┌───────────────────┐
│   Input Buffer    │  Accumulates raw Roman keystrokes for the current
│  (Roman string)   │  word/composition unit.
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│    Tokenizer      │  Longest-match scan: breaks Roman string into typed
│  (longest-match)  │  tokens: vowel | consonant | special | passthrough
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  State Machine /  │  Processes token stream left-to-right.
│  Rule Engine      │  Decides: standalone vowel vs. mātrā, halant insertion,
│                   │  ng expansion, inherent-vowel handling.
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Unicode Output   │  Devanagari Unicode string ready for insertion into
│   (Devanagari)    │  the host text field.
└───────────────────┘
```

## 2.3 The Three Problems Every Transliteration IME Must Solve

### Problem 1 — Tokenisation Ambiguity

Roman key sequences are ambiguous without a defined parsing strategy.
Consider:

```
Input:  "sang"
Could be:  s + a + ng  →  स + ा + ं  =  सां   ✓ (Bodo word)
Could be:  s + a + n + g  →  स + ा + न + ग  =  सानग  ✗
```

**Solution:** Longest-match tokenisation.  Always match the longest known token
at each position.  Since `ng` (length 2) is a defined token and `n` (length 1)
is also a token, longest-match picks `ng` and `n` never gets a chance to match
before `ng`.

Failure mode: if the tokeniser processes categories in the wrong order
(e.g., consonants before vowels), a 1-char consonant `n` can beat a 2-char
vowel modifier `ng`.  **This engine avoids the failure by merging all tokens
into one list sorted by length descending.**

### Problem 2 — Vowel Context Sensitivity

The same key produces different Unicode depending on position:

```
"a" at word start  →  standalone  आ  (U+0906)
"a" after consonant  →  mātrā  ा  (U+093E)
```

**Solution:** A simple state machine with three states:
- `initial` — at input start or after a passthrough character
- `after_consonant` — a consonant was just emitted; next vowel becomes a mātrā
- `after_vowel` — a vowel was emitted; next vowel is standalone

### Problem 3 — Conjunct Consonant Formation

When two consonants appear with no vowel between them, Devanagari uses a
**halant** (virama, U+094D, written as ्) to suppress the inherent vowel of
the first consonant, causing the two consonants to form a visual conjunct.

```
k + t  →  ख + ् + थ  =  ख्थ
```

**Solution:** The state machine, when in `after_consonant` state and receiving
another consonant token, prepends halant before writing the new consonant.

## 2.4 Composition vs. Committed Text

A well-designed IME separates text into two regions:

```
[committed Unicode text] | [composition (in-progress Roman buffer)]
     "नमस्"               |          "kar"
```

- **Committed text** is final and cannot be altered by the IME (only by
  native editing commands like Backspace in the committed region).
- **Composition buffer** is the current Roman input being built into
  the next Devanagari akṣara or word.

When the user presses **Space**, **Enter**, or reaches a word boundary,
the composition is *committed*: the Roman buffer is transliterated to
Unicode and appended to the committed region.

**Smart backspace** operates on the composition buffer first — each
Backspace removes one Roman character and re-transliterates.  Only when
the buffer is empty does Backspace delete from the committed region.

## 2.5 Devanagari Aksara Model

A Devanagari *akṣara* (syllabic unit) is composed of:

```
[pre-base consonants with halant] + [base consonant] + [vowel sign]
                                                      + [anusvara / visarga]
```

Examples:

```
ख     =  consonant alone (with inherent vowel /a/)
खा    =  ख + ा (AA mātrā)
खि    =  ख + ि (I mātrā)
खन्   =  ख + न + ् (kh + n + halant = conjunct, no trailing vowel)
खन्त  =  ख + न + ् + थ (three-consonant conjunct + inherent vowel)
सां   =  स + ा + ं (SA + AA mātrā + anusvara)
```

The engine constructs these sequences token by token using the state machine.

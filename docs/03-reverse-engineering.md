# Chapter 3 — Reverse Engineering the Pramukh Engine

## 3.1 What We Had to Work With

Pramukh IME does not publish source code.  The reverse-engineering used
three primary sources:

### Source A — pramukhime.com/help/bodo-typing-help (DOCUMENTED)

The official help page for the Bodo typing tool.  It provides:

- A partial vowel table with key sequences
- A partial consonant list
- Vowel sign (mātrā) table
- Special character mappings
- The `ng` rule stated in prose
- A note on case sensitivity and F9 toggle

**Limitation:** The consonant table is incomplete.  Only 17 out of ~35
possible consonants are listed.

### Source B — pramukhindic-assamese.png (INFERRED basis)

A chart image linked from a related help page showing the complete mapping
for the Assamese variant of Pramukh IME.

Assamese uses the Bengali/Assamese script (not Devanagari) and has some
phonemic differences from Bodo, but the **key assignment philosophy is
identical** — both engines were designed by the same person (Vishal Monpara).

The chart provided:
- Complete consonant assignments including retroflexes, palatals, sibilants
- The vowel combination grid (consonant + each vowel sign)
- The `oM` vs `ong` distinction
- Examples at the bottom: `bonkim`, `gonga`, `doorghoTona`, etc.

### Source C — tributes.in/pramukhindic-bodo.html (404 — UNAVAILABLE)

A third-party mirror of Pramukh's Bodo help was attempted but returned
HTTP 404.  No data was retrieved from this source.

---

## 3.2 Inference Methodology

For every consonant not listed on the Bodo help page, the following
reasoning chain was applied:

```
1. Check if the Assamese chart has a mapping for the equivalent character.
2. Verify the key assignment does not conflict with a DOCUMENTED Bodo mapping.
3. Adapt the Assamese script character to its Devanagari equivalent.
4. Label result as [INFERRED].
```

**Example — श (SHA):**

1. Assamese chart shows: শ = `xh` or `X`
2. Bodo help page does not assign `xh` or `S` to anything.
3. Devanagari equivalent of শ is श.
4. INFERRED: `S`, `sh`, `xh` → श

**Example — ख vs क conflict:**

The Assamese chart shows ক (unaspirated ka) = `ko` (consonant + inherent vowel key).
The Bodo help page says `k` → ख (aspirated).

Reconciliation:
- Bodo uses ख as the primary 'k' sound (aspirated default).
- Unaspirated क accessed via `ko` is an INFERRED extension following the
  Assamese pattern, but is **not used in the tokenizer** because it would
  break the documented `kou` → खौ mapping (greedy ambiguity).

---

## 3.3 Key Discoveries from the Assamese Chart

### Discovery 1 — Aspirated-default paradigm

Bodo (and Assamese Pramukh) assigns the aspirated stop to the **simpler** key:

```
k  → ख (aspirated, /kʰ/)   — not क (/k/)
t  → थ (aspirated, /tʰ/)   — not त (/t/)
p  → फ (aspirated, /pʰ/)   — not प (/p/)
```

This is the **inverse** of standard Hindi phonetic keyboards.  It reflects
the phonological reality that aspirated stops are more frequent in Bodo
and Assamese native vocabulary.

### Discovery 2 — Capital letters as distinct keys

The Pramukh engine is fully case-sensitive and uses capital letters to
encode characters that would otherwise require multi-key sequences:

| Capital key | Character | Reasoning |
|-------------|-----------|-----------|
| `NG` | ङ (nga) | Two capitals = distinct consonant |
| `NY` | ञ (nya) | Two capitals |
| `I` | य (ya) | Capital I = semivowel |
| `O` | व (va) | Capital O = semivowel/labial approximant |
| `T` | ट (retroflex ta) | Capital = retroflex series |
| `D` | ड (retroflex da) | Capital = retroflex series |
| `N` | ण (retroflex na) | Capital = retroflex na |
| `S` | श (sha) | Capital = palatal sibilant |
| `B` | भ (bha) | Capital = aspirated labial |
| `C` | छ (cha) | Capital = aspirated palatal |
| `J` | झ (jha) | Capital = aspirated palatal |

### Discovery 3 — The 'w' key family for /o/ vowels

Standard keyboards don't have a convenient key for the Devanagari ओ sound.
Pramukh assigns:

```
w   → ओ (standalone) / ो (mātrā)   — the /o/ vowel
wo  → औ (standalone) / ौ (mātrā)   — the /au/ diphthong
wi  → ऐ (standalone) / ै (mātrā)   — the /ai/ diphthong (alternate: ai)
```

This clusters all back-rounded vowels under the `w` key, which is phonetically
motivated (the IPA semivowel /w/ = labial-velar approximant, related to /o/).

### Discovery 4 — The ng rule (DOCUMENTED)

From the Bodo help page, verbatim:

> "The character 'ng' produces 'ं' unless followed by a vowel sign,
> then producing 'ंग'."

This means:
```
sang   →  स + ा + ं       =  सां   (ng before end-of-input = anusvara)
ngk    →  ं + ख           =  ंख    (ng before consonant = anusvara)
nga    →  ं + ग + ा       =  ंगा   (ng before vowel = anusvara + ग + mātrā)
gonga  →  ग + ं + ग + ा   =  गंगा  (full context)
```

The rule exists because in Bodo (and Assamese), nasal clusters before a
following vowel are phonologically distinct from the anusvara: "बंग" (bong)
is different from "बंगा" (bonga, a place name), and the typing system needs
to handle both from the same `ng` key.

### Discovery 5 — 'ong' token must NOT exist

The most subtle finding: including `ong` as a 3-character vowel token breaks
the word "gonga":

```
Without 'ong' token:  g + o + ng + g + a  →  गंगा   ✓
With 'ong' token:     g + [ong] + a        →  ग + ं + आ  =  गंआ  ✗
```

The engine deliberately **excludes** `ong` as an atomic token.  Instead,
`o` (standalone अ) followed by `ng` (anusvara) produces अं naturally.
The result is identical but the tokenisation is correct.

---

## 3.4 What We Could Not Determine

The following are genuinely unknown without access to the Pramukh source:

1. **Exact behaviour of `ʼ` (apostrophe modifier)** — whether it marks tone,
   glottal stop, or is purely orthographic.
2. **Chandrabindu (ँ)** — the Assamese chart shows `-` as its key, but this
   conflicts with potential minus signs in text.  Not confirmed for Bodo.
3. **Whether unaspirated bases (ko, to, po) are officially supported** in
   Pramukh Bodo mode — they are present in Assamese mode but not documented
   for Bodo.
4. **Zero-width joiner / non-joiner handling** — the Assamese chart references
   `ZWJ` and `ZWNJ` for conjunct control; Bodo behaviour is unknown.
5. **Nukta (़) usage** — for Perso-Arabic loanwords; not documented.

# Key → Unicode Reference

Generated directly from [`src/engine/unicode.ts`](../src/engine/unicode.ts) and
[`src/engine/mappings.ts`](../src/engine/mappings.ts) — this is what the code
actually does, not a phonetic chart (see [`bodo_deva.md`](../bodo_deva.md) for
that). Legend: **[D]** = documented on pramukhime.com, **[I]** = inferred.

⚠️ Two rows below are flagged **BROKEN** — defined in the source but not
actually reachable when you type, discovered by testing `transliterate()`
directly. They're included here so the table matches what the code *says*,
with a note on what actually happens.

---

## 1. Vowels (`VOWEL_MAPPINGS`)

"Standalone" = used at the start of a word or after another vowel.
"Matra" = the sign attached after a consonant; *(none)* = inherent vowel, no visible mark.

| Key | Standalone | Matra | Source |
|---|---|---|---|
| `oM` | अं (U+0905 U+0902) | ं (U+0902) | **[D]** |
| `oo` | ऊ (U+090A) | ू (U+0942) | **[I]** |
| `ou` | औ (U+0914) | ौ (U+094C) | **[D]** |
| `wo` | औ (U+0914) | ौ (U+094C) | **[D]** |
| `wi` | ऐ (U+0910) | ै (U+0948) | **[D]** |
| `ai` | ऐ (U+0910) | ै (U+0948) | **[D]** |
| `ee` | ई (U+0908) | ी (U+0940) | **[I]** |
| `Ri` | ऋ (U+090B) | ृ (U+0943) | **[I]** |
| `RI` | ॠ (U+0960) | ॄ (U+0944) | **[I]** |
| `ng` | ं (U+0902) | ं (U+0902) | **[D]** — context rule, see §5 |
| `a` | आ (U+0906) | ा (U+093E) | **[D]** |
| `A` | आ (U+0906) | ा (U+093E) | **[D]** |
| `i` | इ (U+0907) | ि (U+093F) | **[D]** |
| `u` | उ (U+0909) | ु (U+0941) | **[D]** |
| `U` | ऊ (U+090A) | ू (U+0942) | **[I]** |
| `e` | ए (U+090F) | े (U+0947) | **[D]** |
| `w` | ओ (U+0913) | ो (U+094B) | **[D]** |
| `o` | अ (U+0905) | *(none — inherent vowel)* | **[D]** |
| `M` | ं (U+0902) | ं (U+0902) | **[D]** |

Note: `'I'` (capital I) is **not** a vowel key — it's documented as the
consonant य (see §2). Use `ee` for ई.

---

## 2. Consonants (`CONSONANT_MAPPINGS`)

| Key | Character | Code point(s) | Source |
|---|---|---|---|
| `khy` | ख्ष | U+0916 U+094D U+0937 | **[I]** — comment says "conjunct kṣ" (क्ष), but the code builds it from `KHA` (ख) not `KA` (क). **This produces ख्ष, not क्ष.** Likely a bug (`U.KHA` should be `U.KA`). |
| `NYo` | ञ | U+091E | **[I]** — redundant with `NY` below; harmless |
| `wao` | वाव | U+0935 U+093E U+0935 | **[I]** |
| `yao` | याव | U+092F U+093E U+0935 | **[I]** |
| `NG` | ङ | U+0919 | **[D]** |
| `NY` | ञ | U+091E | **[I]** |
| `kh` | ख | U+0916 | **[D]** |
| `gh` | घ | U+0918 | **[I]** |
| `ch` | छ | U+091B | **[I]** |
| `jh` | झ | U+091D | **[I]** |
| `Th` | ठ | U+0920 | **[I]** |
| `Dh` | ढ | U+0922 | **[I]** |
| `th` | थ | U+0925 | **[D]** |
| `dh` | ध | U+0927 | **[D]** |
| `ph` | फ | U+092B | **[D]** |
| `bh` | भ | U+092D | **[I]** |
| `sh` | श | U+0936 | **[I]** |
| `xh` | श | U+0936 | **[I]** |
| `Xh` | ष | U+0937 | **[I]** |
| `k` | ख | U+0916 | **[D]** — Bodo's aspirated-default 'k' sound |
| `g` | ग | U+0917 | **[D]** |
| `c` | च | U+091A | **[I]** |
| `C` | छ | U+091B | **[I]** |
| `j` | ज | U+091C | **[D]** |
| `J` | झ | U+091D | **[I]** |
| `T` | ट | U+091F | **[I]** |
| `D` | ड | U+0921 | **[I]** |
| `N` | ण | U+0923 | **[I]** |
| `t` | थ | U+0925 | **[D]** — aspirated-default 't' sound |
| `d` | द | U+0926 | **[D]** |
| `n` | न | U+0928 | **[D]** |
| `p` | फ | U+092B | **[D]** — aspirated-default 'p' sound |
| `f` | फ | U+092B | **[D]** |
| `b` | ब | U+092C | **[D]** |
| `B` | भ | U+092D | **[I]** |
| `m` | म | U+092E | **[D]** |
| `y` | य | U+092F | **[D]** |
| `I` | य | U+092F | **[D]** — capital I = य |
| `r` | र | U+0930 | **[D]** |
| `l` | ल | U+0932 | **[D]** |
| `L` | ऴ | U+0934 | **[I]** — source comment says "ळ" (U+0933, Marathi LLA), but the actual character used is U+0934 (LLLA). Whichever was intended, the comment and the code disagree. |
| `O` | व | U+0935 | **[D]** — capital O |
| `v` | व | U+0935 | **[I]** |
| `S` | श | U+0936 | **[I]** |
| `x` | ष | U+0937 | **[I]** |
| `s` | स | U+0938 | **[D]** |
| `h` | ह | U+0939 | **[D]** |

---

## 3. Unaspirated bases (`UNASPIRATED_BASES`) — ⚠️ BROKEN, unreachable

Defined to let you type the *unaspirated* counterpart of an aspirated-default
consonant (Assamese-chart convention: ক = `ko`, ত = `to`, প = `po`).

| Key | Intended character | Code point |
|---|---|---|
| `ko` | क | U+0915 |
| `to` | त | U+0924 |
| `po` | प | U+092A |

**This table is never consulted.** The tokenizer's trie doesn't include
these 2-character sequences at all, so each one is actually tokenized as
its single-char consonant key + `o` (inherent vowel, no mark):

- `ko` → `k` (→ क, since `k` is itself unaspirated — see §2) + `o` → **क**.
  This happens to match the intended result, but only by coincidence: it's
  `CONSONANT_MAPPINGS['k']` doing the work, not this table.
- `to` → `t` (→ थ, still aspirated-default) + `o` → **थ**, not त.
- `po` → `p` (→ फ, still aspirated-default) + `o` → **फ**, not प.

There is currently no way to type unaspirated त or प in this app.

---

## 4. Special characters (`SPECIAL_MAPPINGS`)

| Key | Output | Code point(s) | Source |
|---|---|---|---|
| `\|\|` | ॥ | U+0965 | **[D]** |
| `+-` | 卍 | U+534D | **[D]** — this is the CJK ideograph "卍", not a Unicode swastika symbol proper |
| `.a` | ऽ | U+093D | **[D]** |
| `Rs` | ₹ | U+20B9 | **[D]** |
| `OM` | ॐ | U+0950 | **[D]** |
| `\|` | । | U+0964 | **[D]** |
| `'` | ʼ | U+02BC | **[D]** |
| `H` | ः | U+0903 | **[I]** |

---

## 5. Rules that aren't table-driven

Handled directly in [`transliterator.ts`](../src/engine/transliterator.ts),
not by a lookup table:

- **Halant insertion** — U+094D (्) is inserted automatically between two
  consecutive consonants with no vowel typed between them.
- **`ng` context rule** — before a vowel: anusvara + ग + that vowel's mātrā;
  before a consonant or at the end of input: anusvara (ं) alone.
- **`_` underscore** — a silent word-boundary marker. It's consumed and
  emits nothing, but resets the state machine so it still acts as a
  boundary (prevents an unwanted conjunct/halant across it).
- **Avagraha (`.a`)** — only emitted after a vowel has already been output;
  typing it after a consonant or at the very start of input is silently
  discarded.

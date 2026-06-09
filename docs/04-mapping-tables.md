# Chapter 4 — Complete Mapping Tables

Legend: **[D]** = Documented · **[I]** = Inferred

---

## 4.1 Independent Vowels (Standalone Form)

These are produced when a vowel key is typed at the start of input or
immediately after another vowel.

| Key sequence | Unicode | Character | Pronunciation | Source |
|-------------|---------|-----------|---------------|--------|
| `o` | U+0905 | अ | /ə/ short a | **[D]** |
| `a` | U+0906 | आ | /aː/ long a | **[D]** |
| `A` | U+0906 | आ | /aː/ (shift-a alias) | **[D]** |
| `i` | U+0907 | इ | /i/ short i | **[D]** |
| `ee` | U+0908 | ई | /iː/ long i | **[I]** |
| `u` | U+0909 | उ | /u/ short u | **[D]** |
| `oo` | U+090A | ऊ | /uː/ long u | **[I]** |
| `U` | U+090A | ऊ | /uː/ (shift-u alias) | **[I]** |
| `Ri` | U+090B | ऋ | /ri/ vocalic r | **[I]** |
| `RI` | U+0960 | ॠ | /riː/ long vocalic r | **[I]** |
| `e` | U+090F | ए | /e/ | **[D]** |
| `wi` | U+0910 | ऐ | /əi/ diphthong | **[D]** |
| `ai` | U+0910 | ऐ | /əi/ (alternate) | **[D]** |
| `w` | U+0913 | ओ | /o/ | **[D]** |
| `wo` | U+0914 | औ | /əu/ diphthong | **[D]** |
| `ou` | U+0914 | औ | /əu/ (alternate) | **[D]** |
| `M` | U+0902 | ं | anusvara (nasal) | **[D]** |
| `oM` | U+0905 + U+0902 | अं | nasal a | **[D]** |
| `o` + `ng` | U+0905 + U+0902 | अं | same as oM (two tokens) | **[D]** |

---

## 4.2 Vowel Signs (Mātrās — After-Consonant Form)

These are produced when a vowel key is typed immediately after a consonant.

| Key sequence | Unicode | Sign | Applied to example ख | Source |
|-------------|---------|------|----------------------|--------|
| `a` | U+093E | ा | खा | **[D]** |
| `A` | U+093E | ा | खा | **[D]** |
| `i` | U+093F | ि | खि | **[D]** |
| `ee` | U+0940 | ी | खी | **[I]** |
| `u` | U+0941 | ु | खु | **[D]** |
| `oo` | U+0942 | ू | खू | **[I]** |
| `U` | U+0942 | ू | खू | **[I]** |
| `Ri` | U+0943 | ृ | खृ | **[I]** |
| `RI` | U+0944 | ॄ | खॄ | **[I]** |
| `e` | U+0947 | े | खे | **[D]** |
| `wi` | U+0948 | ै | खै | **[D]** |
| `ai` | U+0948 | ै | खै | **[D]** |
| `w` | U+094B | ो | खो | **[D]** |
| `wo` | U+094C | ौ | खौ | **[D]** |
| `ou` | U+094C | ौ | खौ | **[D]** |
| `ng` | U+0902 | ं | खं | **[D]** |
| `M` | U+0902 | ं | खं | **[D]** |
| `o` | *(none)* | — | ख (inherent vowel) | **[D]** |

> **Note on `o` as mātrā:** The 'o' key after a consonant signals the
> *inherent vowel* — the consonant is committed without any visible sign.
> In Devanagari, every consonant already carries the inherent /a/ sound;
> typing 'o' simply confirms it explicitly and advances the state.

---

## 4.3 Consonants

### 4.3.1 Velar Series

| Key | Unicode | Character | IPA | Source |
|-----|---------|-----------|-----|--------|
| `k` | U+0916 | ख | /kʰ/ | **[D]** — aspirated default |
| `kh` | U+0916 | ख | /kʰ/ | **[D]** — explicit aspirated |
| `g` | U+0917 | ग | /g/ | **[D]** |
| `gh` | U+0918 | घ | /gʱ/ | **[I]** |
| `NG` | U+0919 | ङ | /ŋ/ | **[D]** |

### 4.3.2 Palatal Series

| Key | Unicode | Character | IPA | Source |
|-----|---------|-----------|-----|--------|
| `c` | U+091A | च | /tɕ/ | **[I]** |
| `C` | U+091B | छ | /tɕʰ/ | **[I]** |
| `ch` | U+091B | छ | /tɕʰ/ | **[I]** |
| `j` | U+091C | ज | /dʑ/ | **[D]** |
| `jh` | U+091D | झ | /dʑʱ/ | **[I]** |
| `J` | U+091D | झ | /dʑʱ/ | **[I]** |
| `NY` | U+091E | ञ | /ɲ/ | **[I]** |

### 4.3.3 Retroflex Series

| Key | Unicode | Character | IPA | Source |
|-----|---------|-----------|-----|--------|
| `T` | U+091F | ट | /ʈ/ | **[I]** |
| `Th` | U+0920 | ठ | /ʈʰ/ | **[I]** |
| `D` | U+0921 | ड | /ɖ/ | **[I]** |
| `Dh` | U+0922 | ढ | /ɖʱ/ | **[I]** |
| `N` | U+0923 | ण | /ɳ/ | **[I]** |

### 4.3.4 Dental Series

| Key | Unicode | Character | IPA | Source |
|-----|---------|-----------|-----|--------|
| `t` | U+0925 | थ | /tʰ/ | **[D]** — aspirated default |
| `th` | U+0925 | थ | /tʰ/ | **[D]** — explicit aspirated |
| `d` | U+0926 | द | /d/ | **[D]** |
| `dh` | U+0927 | ध | /dʱ/ | **[D]** |
| `n` | U+0928 | न | /n/ | **[D]** |

### 4.3.5 Labial Series

| Key | Unicode | Character | IPA | Source |
|-----|---------|-----------|-----|--------|
| `p` | U+092B | फ | /pʰ/ | **[D]** — aspirated default |
| `ph` | U+092B | फ | /pʰ/ | **[D]** — explicit aspirated |
| `f` | U+092B | फ | /pʰ/ | **[D]** — f-sound alias |
| `b` | U+092C | ब | /b/ | **[D]** |
| `bh` | U+092D | भ | /bʱ/ | **[I]** |
| `B` | U+092D | भ | /bʱ/ | **[I]** |
| `m` | U+092E | म | /m/ | **[D]** |

### 4.3.6 Semivowels, Liquids, Sibilants, Aspirate

| Key | Unicode | Character | IPA | Source |
|-----|---------|-----------|-----|--------|
| `y` | U+092F | य | /j/ | **[D]** |
| `I` | U+092F | य | /j/ | **[D]** — capital-I alias |
| `r` | U+0930 | र | /r/ | **[D]** |
| `l` | U+0932 | ल | /l/ | **[D]** |
| `L` | U+0934 | ळ | /ɭ/ | **[I]** |
| `O` | U+0935 | व | /w/ or /v/ | **[D]** — capital-O |
| `v` | U+0935 | व | /v/ | **[I]** |
| `S` | U+0936 | श | /ɕ/ | **[I]** |
| `sh` | U+0936 | श | /ɕ/ | **[I]** |
| `xh` | U+0936 | श | /ɕ/ | **[I]** |
| `x` | U+0937 | ष | /ʂ/ | **[I]** |
| `Xh` | U+0937 | ष | /ʂ/ | **[I]** |
| `s` | U+0938 | स | /s/ | **[D]** |
| `h` | U+0939 | ह | /ɦ/ | **[D]** |

---

## 4.4 Special Characters & Symbols

| Key | Unicode | Character | Name | Source |
|-----|---------|-----------|------|--------|
| `\|` | U+0964 | । | Devanagari Danda | **[D]** |
| `\|\|` | U+0965 | ॥ | Devanagari Double Danda | **[D]** |
| `.a` | U+093D | ऽ | Avagraha | **[D]** |
| `'` | U+02BC | ʼ | Modifier Letter Apostrophe (glottal marker) | **[D]** |
| `Rs` | U+20B9 | ₹ | Indian Rupee Sign | **[D]** |
| `OM` | U+0950 | ॐ | Devanagari Om | **[D]** |
| `+-` | U+534D | 卍 | Swastika (traditional symbol) | **[D]** |
| `H` | U+0903 | ः | Devanagari Sign Visarga | **[I]** |

---

## 4.5 Derived / Implicit Tokens

These are not typed directly but are inserted by the rule engine:

| Situation | Inserted | Unicode | Source |
|-----------|----------|---------|--------|
| Two consecutive consonants | ् (halant) | U+094D | *derived* |
| `ng` before vowel | ं + ग (anusvara + GA) | U+0902 + U+0917 | **[D]** |
| `o` after consonant | *(nothing)* | — | **[D]** inherent vowel |

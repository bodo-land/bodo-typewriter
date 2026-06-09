# Chapter 1 — Bodo Language & Script

## 1.1 Who Speaks Bodo?

Bodo (also written *Boro*) is a Tibeto-Burman language spoken primarily in
Assam, India, with smaller communities in West Bengal, Nagaland, Nepal, and
Bhutan.  It is the primary language of the Bodo people and one of the 22
scheduled languages of India under the Eighth Schedule of the Constitution.

**Speaker count:** Approximately 1.4–1.5 million (2011 Census of India).

**Language family:**
```
Sino-Tibetan
  └─ Tibeto-Burman
       └─ Brahmaputran / Bodo-Koch
            └─ Bodo (Boro)
```

**Closely related languages:** Dimasa, Kokborok, Rabha, Garo (all Bodo-Koch).
Bodo is **not** related to the Indo-Aryan languages of Assam (Assamese, Bengali),
though centuries of contact have introduced extensive loanwords.

## 1.2 Script History

Bodo has used several scripts over time:

| Period | Script | Status |
|--------|--------|--------|
| Pre-colonial | Deodhai / folk scripts | Largely undocumented |
| Colonial–1970s | Latin (Roman) alphabet | Missionary and educational use |
| 1963 | Assamese script (Bengali variant) | Official use in Assam |
| **1975 onwards** | **Devanagari** | **Current official script** |

Since 1975, Devanagari is the official script for Bodo.  The Bodo Sahitya Sabha
(Bodo Literary Society) standardised this choice to align with national Hindi
literacy and to distinguish Bodo writing from Assamese.

## 1.3 Devanagari for Bodo — Subset Used

Bodo does not use all 36 consonants of Sanskrit Devanagari.  Pramukh IME
exposes only the subset needed for native Bodo phonemes plus common loanword
phonemes.

### Vowels used in Bodo

| Devanagari | IPA | Bodo romanisation | Notes |
|-----------|-----|-------------------|-------|
| अ | /ə/ or /a/ | a (short) | Inherent vowel, very common |
| आ | /aː/ | aa | Open long vowel |
| इ | /i/ | i | Short close front |
| ई | /iː/ | ii / ee | Long close front |
| उ | /u/ | u | Short close back |
| ऊ | /uː/ | uu | Long close back |
| ए | /e/ | e | Close-mid front |
| ऐ | /ɛ/ or /əi/ | ai | Open-mid front or diphthong |
| ओ | /o/ | o | Close-mid back |
| औ | /əu/ | au | Diphthong |

### Consonants most frequently used in Bodo

| Devanagari | IPA | Pramukh key |
|-----------|-----|-------------|
| ख | /kʰ/ | k / kh |
| ग | /g/ | g |
| ङ | /ŋ/ | NG |
| ज | /dʒ/ | j |
| थ | /tʰ/ | t / th |
| द | /d/ | d |
| ध | /dʱ/ | dh |
| न | /n/ | n |
| फ | /pʰ/ | p / ph / f |
| ब | /b/ | b |
| म | /m/ | m |
| य | /j/ | y / I |
| र | /r/ | r |
| ल | /l/ | l |
| व | /w/ or /v/ | O (capital) |
| स | /s/ | s |
| ह | /ɦ/ | h |

**Notable phonological feature:** Bodo is a tonal language.  Tones (high, low,
rising) are phonemic.  However, standard Devanagari orthography does not mark
tones; the apostrophe modifier `ʼ` (Unicode U+02BC, Pramukh key `'`) is used
in some writing conventions to indicate a glottal or checked tone.

## 1.4 Why Aspirated Consonants Are the Default

In standard Hindi/Sanskrit Devanagari typing (e.g. InScript, Phonetic),
the unaspirated stop is the default:  `k` → क (/k/), and the aspirated form
requires an extra key: `kh` → ख (/kʰ/).

**In Bodo Pramukh IME the mapping is inverted:**

- `k` → **ख** (/kʰ/) — aspirated is the single-key default
- `kh` → **ख** — same character (aspirated)

This reflects Bodo phonology: the aspirated stops /kʰ, tʰ, pʰ/ are more
frequent in native Bodo vocabulary than their unaspirated counterparts.  The
Pramukh designers chose ergonomics for the most-typed sounds.

The unaspirated stops (क, त, प) appear mainly in Sanskrit/Hindi loanwords
and, following the Assamese chart convention, are accessed by appending the
inherent-vowel key `o`: `ko` → क, `to` → त, `po` → प.

## 1.5 Unicode Blocks for Bodo

Bodo Devanagari text sits entirely within the standard Devanagari Unicode block:

```
U+0900–U+097F   Devanagari
```

Key codepoints relevant to this engine:

| Codepoint | Character | Name |
|-----------|-----------|------|
| U+0902 | ं | Devanagari Sign Anusvara |
| U+0903 | ः | Devanagari Sign Visarga |
| U+0905 | अ | Devanagari Letter A |
| U+0906 | आ | Devanagari Letter AA |
| U+0915–U+0939 | क–ह | Consonants |
| U+093E | ा | Devanagari Vowel Sign AA |
| U+093F | ि | Devanagari Vowel Sign I |
| U+0941–U+0948 | ु–ै | Vowel signs U through AI |
| U+094B | ो | Devanagari Vowel Sign O |
| U+094C | ौ | Devanagari Vowel Sign AU |
| U+094D | ् | Devanagari Sign Virama (halant) |
| U+093D | ऽ | Devanagari Sign Avagraha |
| U+0950 | ॐ | Devanagari Om |
| U+0964 | । | Devanagari Danda |
| U+0965 | ॥ | Devanagari Double Danda |
| U+02BC | ʼ | Modifier Letter Apostrophe (glottal marker) |

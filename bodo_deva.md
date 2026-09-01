# Bodo Devanagari — Reference Chart

Transcribed from [`bodo_deva.gif`](bodo_deva.gif): independent vowels, their
dependent diacritic (mātrā) forms, consonants, and numerals, each with a
Roman transliteration key and IPA pronunciation.

## Vowels & diacritics

| Independent | Diacritic | Roman | IPA |
|:-:|:-:|:-:|:-:|
| अ | *(none — inherent vowel)* | ô | [o] |
| आ | ा | a | [a] |
| इ | ि | i | [i] |
| ई | ी | ī | [i] |
| उ | ु | u | [u] |
| ऊ | ू | ū | [u] |
| ऋ | ृ | ri | [ri] |
| ए | े | e | [e] |
| ऐ | ै | ŵi | [oi/ɯi] |
| ओ | ो | ŵ | [ɯ] |
| औ | ौ | ŵu | [ɯu] |

### Diacritic-only marks

| Mark | Roman | IPA |
|:-:|:-:|:-:|
| ं (anusvara) | ṅg | [ŋ] |
| ः (visarga) | ah | [h] |
| ँ (candrabindu) | ṅ | [ ̃ ] |

## Consonants

| Letter | Roman | IPA | | Letter | Roman | IPA |
|:-:|:-:|:-:|---|:-:|:-:|:-:|
| क | kô | [kɔ] | | द | dô | [dɔ] |
| ख | khô | [kʰɔ] | | ध | dhô | [dɦɔ] |
| ग | gô | [gɔ] | | न | nô | [nɔ] |
| घ | ghô | [gɦɔ] | | प | pô | [pɔ] |
| ङ | ṅgô | [ŋɔ] | | फ | phô | [pʰɔ] |
| च | cô | [sɔ] | | ब | bô | [bɔ] |
| छ | chô | [sʰɔ] | | भ | bhô | [bɦɔ] |
| ज | zô | [zɔ] | | म | mô | [mɔ] |
| ट | ṭô | [ʈɔ] | | य | yô | [jɔ] |
| ठ | ṭhô | [ʈʰɔ] | | र | rô | [rɔ] |
| ड | ḍô | [ɖɔ] | | ल | lô | [lɔ] |
| त | tô | [tɔ] | | व | wô | [wɔ] |
| थ | thô | [tʰɔ] | | श | shô | [sɔ] |
|  |  |  | | स | sô | [sɔ] |
|  |  |  | | ह | hô | [ɦɔ] |

### Additional / conjunct forms

| Letter | Roman | IPA |
|:-:|:-:|:-:|
| त् | half t | [t] |
| ड़ | ṛô | [ɽɔ] |
| ढ़ | ṛhô | [ɽʰɔ] |
| क्ष | khyô | [kʰjɔ] |

## Numerals

| Digit | Bodo | Word | Roman |
|:-:|:-:|:-:|:-:|
| 0 | ० | लातिख' | lāthikho |
| 1 | १ | से | se |
| 2 | २ | नै | nwi |
| 3 | ३ | थाम | tham |
| 4 | ४ | ब्रै | brwi |
| 5 | ५ | बा | bā |
| 6 | ६ | द' | do |
| 7 | ७ | स्नि | sni |
| 8 | ८ | दाइन | dāin |
| 9 | ९ | गु | gu |
| 10 | १० | जि | zi |

---

**Note on scope:** this chart's Roman "keys" (`kô`, `dô`, `lāthikho`, …) are
a phonetic transcription scheme, not this app's transliteration input
scheme. They don't map 1:1 onto [`src/engine/mappings.ts`](src/engine/mappings.ts)
— e.g. this chart's numerals aren't handled by the transliterator at all
today (digits currently pass through unchanged; see
[`src/engine/transliterator.ts`](src/engine/transliterator.ts)).

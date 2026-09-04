/**
 * Unit tests for the Bodo transliteration engine.
 *
 * Labels:
 *   [D] = rule DOCUMENTED on pramukhime.com/help/bodo-typing-help
 *   [I] = rule INFERRED from Assamese chart / Devanagari conventions
 *
 * Run with: npx vitest run
 */

import { describe, it, expect } from 'vitest';
import { transliterate } from '../engine/transliterator';
import { tokenize } from '../engine/tokenizer';

// ── Tokenizer ────────────────────────────────────────────────────────────────

describe('tokenizer — longest-match', () => {
  it('kh (len 2) beats k (len 1)', () => {
    const t = tokenize('khan');
    expect(t.map(x => x.raw)).toEqual(['kh', 'a', 'n']);
    expect(t.map(x => x.kind)).toEqual(['consonant', 'vowel', 'consonant']);
  });

  it('ng (len 2) beats n (len 1)', () => {
    const t = tokenize('sang');
    expect(t.map(x => x.raw)).toEqual(['s', 'a', 'ng']);
  });

  it('ng is a vowel token; NG is a consonant token', () => {
    expect(tokenize('NG')[0]).toMatchObject({ raw: 'NG', kind: 'consonant' });
    expect(tokenize('ng')[0]).toMatchObject({ raw: 'ng', kind: 'vowel' });
  });

  it('ou (len 2) beats o (len 1) at position 1 of "kou"', () => {
    const t = tokenize('kou');
    expect(t.map(x => x.raw)).toEqual(['k', 'ou']);
  });

  it('wo (len 2) beats w (len 1)', () => {
    expect(tokenize('wo')[0].raw).toBe('wo');
  });

  it('wi (len 2) beats w (len 1)', () => {
    expect(tokenize('wi')[0].raw).toBe('wi');
  });

  it('|| (len 2) beats | (len 1)', () => {
    expect(tokenize('||')[0]).toMatchObject({ raw: '||', kind: 'special' });
  });

  it('oo (len 2) beats o (len 1)', () => {
    expect(tokenize('oo')[0].raw).toBe('oo');
  });

  it('digits and spaces pass through', () => {
    const t = tokenize('a 1');
    expect(t[1]).toMatchObject({ kind: 'passthrough' }); // space
    expect(t[2]).toMatchObject({ kind: 'passthrough' }); // digit
  });
});

// ── Standalone vowels ─────────────────────────────────────────────────────────

describe('standalone vowels', () => {
  it('[D] o  → अ',  () => expect(transliterate('o')).toBe('अ'));
  it('[D] a  → आ', () => expect(transliterate('a')).toBe('आ'));
  it('[D] A  → आ', () => expect(transliterate('A')).toBe('आ'));
  it('[D] i  → इ',  () => expect(transliterate('i')).toBe('इ'));
  it('[I] ee → ई', () => expect(transliterate('ee')).toBe('ई'));
  it('[D] u  → उ',  () => expect(transliterate('u')).toBe('उ'));
  it('[I] oo → ऊ', () => expect(transliterate('oo')).toBe('ऊ'));
  it('[D] e  → ए',  () => expect(transliterate('e')).toBe('ए'));
  it('[D] wi → ऐ', () => expect(transliterate('wi')).toBe('ऐ'));
  it('[D] ai → ऐ', () => expect(transliterate('ai')).toBe('ऐ'));
  it('[D] w  → ओ',  () => expect(transliterate('w')).toBe('ओ'));
  it('[D] wo → औ', () => expect(transliterate('wo')).toBe('औ'));
  it('[D] ou → औ', () => expect(transliterate('ou')).toBe('औ'));

  it('[D] oM → अं (o standalone + anusvara)',  () =>
    expect(transliterate('oM')).toBe('अं'));

  it('[D] o+ng → अं (two-token, same as oM)',  () =>
    // 'o' = standalone अ, then 'ng' = anusvara at initial state
    expect(transliterate('ong')).toBe('अं'));
});

// ── Consonants (documented) ───────────────────────────────────────────────────

describe('consonants — documented', () => {
  it('[D] k  → क', () => expect(transliterate('k')).toBe('क'));
  it('[D] kh → ख', () => expect(transliterate('kh')).toBe('ख'));
  it('[D] g  → ग', () => expect(transliterate('g')).toBe('ग'));
  it('[D] NG → ङ', () => expect(transliterate('NG')).toBe('ङ'));
  it('[D] j  → ज', () => expect(transliterate('j')).toBe('ज'));
  it('[D] t  → त', () => expect(transliterate('t')).toBe('त'));
  it('[D] th → थ', () => expect(transliterate('th')).toBe('थ'));
  it('[D] d  → द', () => expect(transliterate('d')).toBe('द'));
  it('[D] dh → ध', () => expect(transliterate('dh')).toBe('ध'));
  it('[D] n  → न', () => expect(transliterate('n')).toBe('न'));
  it('[D] p  → प', () => expect(transliterate('p')).toBe('प'));
  it('[D] ph → फ', () => expect(transliterate('ph')).toBe('फ'));
  it('[D] f  → फ', () => expect(transliterate('f')).toBe('फ'));
  it('[D] b  → ब', () => expect(transliterate('b')).toBe('ब'));
  it('[D] m  → म', () => expect(transliterate('m')).toBe('म'));
  it('[D] y  → य', () => expect(transliterate('y')).toBe('य'));
  it('[D] I  → य (capital I, documented alias for य)', () =>
    expect(transliterate('I')).toBe('य'));
  it('[D] r  → र', () => expect(transliterate('r')).toBe('र'));
  it('[D] l  → ल', () => expect(transliterate('l')).toBe('ल'));
  it('[D] s  → स', () => expect(transliterate('s')).toBe('स'));
  it('[D] h  → ह', () => expect(transliterate('h')).toBe('ह'));
  it('[D] O  → व (capital O)',  () => expect(transliterate('O')).toBe('व'));
});

describe('consonants — inferred', () => {
  it('[I] gh → घ', () => expect(transliterate('gh')).toBe('घ'));
  it('[I] jh → झ', () => expect(transliterate('jh')).toBe('झ'));
  it('[I] bh → भ', () => expect(transliterate('bh')).toBe('भ'));
  it('[I] sh → श', () => expect(transliterate('sh')).toBe('श'));
  it('[I] S  → श', () => expect(transliterate('S')).toBe('श'));
  it('[I] T  → ट', () => expect(transliterate('T')).toBe('ट'));
  it('[I] D  → ड', () => expect(transliterate('D')).toBe('ड'));
  it('[I] Th → ठ', () => expect(transliterate('Th')).toBe('ठ'));
  it('[I] Dh → ढ', () => expect(transliterate('Dh')).toBe('ढ'));
  it('[I] N  → ण', () => expect(transliterate('N')).toBe('ण'));
});

// ── Consonant + Vowel combinations ────────────────────────────────────────────

describe('consonant + vowel (mātrā) combinations', () => {
  it('[D] ka  → का', () => expect(transliterate('ka')).toBe('का'));
  it('[D] ki  → कि', () => expect(transliterate('ki')).toBe('कि'));
  it('[D] ku  → कु', () => expect(transliterate('ku')).toBe('कु'));
  it('[D] ke  → के', () => expect(transliterate('ke')).toBe('के'));
  it('[D] kwi → कै', () => expect(transliterate('kwi')).toBe('कै'));
  it('[D] kai → कै', () => expect(transliterate('kai')).toBe('कै'));
  it('[D] kw  → को', () => expect(transliterate('kw')).toBe('को'));
  it('[D] kwo → कौ', () => expect(transliterate('kwo')).toBe('कौ'));
  it('[D] kou → कौ', () => expect(transliterate('kou')).toBe('कौ'));

  // 'o' after consonant = inherent vowel (no matra added)
  it('[D] ko  → क (k with inherent vowel, no visible matra)', () =>
    expect(transliterate('ko')).toBe('क'));
});

// ── Consonant clusters (halant) ───────────────────────────────────────────────

describe('consonant clusters', () => {
  it('[I] kt → क्त (halant inserted between two consonants)', () =>
    expect(transliterate('kt')).toBe('क्त'));

  it('[I] sth → स्थ (s + th conjunct)', () =>
    expect(transliterate('sth')).toBe('स्थ'));

  it('[I] ndo → न्द (n + d + inherent vowel)', () =>
    expect(transliterate('ndo')).toBe('न्द'));

  // kh + w + n = ख + ो(matra) + न
  it('[D] khwn → खोन (Bodo word for "ear")', () =>
    expect(transliterate('khwn')).toBe('खोन'));
});

// ── Special / symbol mappings ─────────────────────────────────────────────────

describe('special mappings', () => {
  it('[D] |  → ।',  () => expect(transliterate('|')).toBe('।'));
  it('[D] || → ॥', () => expect(transliterate('||')).toBe('॥'));
  it('[D] .a → ऽ', () => expect(transliterate('.a')).toBe('ऽ'));
  it('[D] Rs → ₹', () => expect(transliterate('Rs')).toBe('₹'));
  it('[D] OM → ॐ', () => expect(transliterate('OM')).toBe('ॐ'));
});

// ── ng special rule (DOCUMENTED) ─────────────────────────────────────────────

describe('ng special rule', () => {
  it('[D] ng at end → anusvara ं appended to previous', () => {
    // s + a + ng  →  स + ा + ं  =  सां
    expect(transliterate('sang')).toBe('सां');
  });

  it('[D] ng before consonant → anusvara only (no ग)', () => {
    // ng + k  →  ं + क
    expect(transliterate('ngk')).toBe('ंक');
  });

  it('[D] ng before vowel → anusvara + ग + mātrā', () => {
    // ng + a  →  ं + ग + ा  =  ंगा
    expect(transliterate('nga')).toBe('ंगा');
  });

  it('[D] gonga → गंगा (the ng rule in full context)', () => {
    // g(ग) + o(inherent) + ng(anusvara, before 'g' consonant) + g(ग) + a(ा)
    expect(transliterate('gonga')).toBe('गंगा');
  });

  it('[D] M as anusvara alias', () => {
    // s + a + M  →  सां
    expect(transliterate('saM')).toBe('सां');
  });
});

// ── Full word examples ────────────────────────────────────────────────────────

describe('full word transliterations', () => {
  it('[D] bwdw → बोदो (the word "Bodo")', () =>
    // b + w + d + w
    expect(transliterate('bwdw')).toBe('बोदो'));

  it('[D] khwn → खोन (ear)', () =>
    expect(transliterate('khwn')).toBe('खोन'));

  it('space passes through', () =>
    // k+a = का, space, b+a = बा
    expect(transliterate('ka ba')).toBe('का बा'));

  it('digits pass through', () =>
    expect(transliterate('k1a')).toBe('क1आ'));

  it('multiple consecutive vowels at start', () =>
    // ou = औ (standalone), then k + a = का
    expect(transliterate('ouka')).toBe('औका'));
});

// ── Edge cases ────────────────────────────────────────────────────────────────

describe('edge cases', () => {
  it('empty string → empty string', () =>
    expect(transliterate('')).toBe(''));

  it('only spaces', () =>
    expect(transliterate('   ')).toBe('   '));

  it('consonant at end of input (no vowel following)', () =>
    // consonant alone = consonant with inherent vowel
    expect(transliterate('k')).toBe('क'));

  it('double consonant (no vowel between) → halant conjunct', () =>
    expect(transliterate('kk')).toBe('क्क'));

  it('I (cap) after consonant acts as ya-consonant', () => {
    // k + I → क + halant + य (conjunct kya)
    expect(transliterate('kI')).toBe('क्य');
  });
});

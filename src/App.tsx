import { useState } from 'react';
import { BodoInput } from './components/BodoInput';
import { transliterate } from './engine/transliterator';
import './App.css';

const EXAMPLES = [
  { roman: 'bwdw',       label: 'बोदो (Bodo)' },
  { roman: 'khwn',       label: 'खोन (ear)' },
  { roman: 'gonga',      label: 'गंगा (Ganga — ng rule)' },
  { roman: 'namoNgkaar', label: 'नमोणकार (namaste)' },
  { roman: 'sang',       label: 'सां (with anusvara)' },
  { roman: 'nga',        label: 'ंगा (ng + vowel → anusvara+ग)' },
  { roman: 'OM',         label: 'ॐ (Om)' },
  { roman: '||',         label: '॥ (double danda)' },
];

export default function App() {
  const [bodoValue, setBodoValue] = useState('');

  return (
    <div style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: 4 }}>बोदो Typewriter</h1>
      <p style={{ color: '#555', marginTop: 0, marginBottom: '1.5rem' }}>
        Roman-to-Bodo Devanagari transliteration engine (Pramukh IME compatible)
      </p>

      <BodoInput
        rows={6}
        onChange={setBodoValue}
        autoFocus
      />

      {bodoValue && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f5f5f5', borderRadius: 6, wordBreak: 'break-all' }}>
          <strong>Unicode output:</strong>
          <pre style={{ margin: '0.25rem 0 0', fontFamily: '"Noto Sans Devanagari", serif', fontSize: '1.1rem' }}>
            {bodoValue}
          </pre>
        </div>
      )}

      <hr style={{ margin: '2rem 0' }} />

      <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Quick reference examples</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ padding: '6px 10px', textAlign: 'left' }}>Roman input</th>
            <th style={{ padding: '6px 10px', textAlign: 'left' }}>Output</th>
            <th style={{ padding: '6px 10px', textAlign: 'left' }}>Label</th>
          </tr>
        </thead>
        <tbody>
          {EXAMPLES.map(({ roman, label }) => (
            <tr key={roman} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '6px 10px', fontFamily: 'monospace' }}>{roman}</td>
              <td style={{ padding: '6px 10px', fontFamily: '"Noto Sans Devanagari", serif', fontSize: '1.1rem' }}>
                {transliterate(roman)}
              </td>
              <td style={{ padding: '6px 10px', color: '#555' }}>{label}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr style={{ margin: '2rem 0' }} />

      <details>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Key reference chart</summary>
        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '0.9rem', margin: '0 0 0.5rem' }}>Vowels [D = documented]</h3>
            <table style={{ fontSize: '0.8rem', borderCollapse: 'collapse' }}>
              <thead><tr><th>Key</th><th>Standalone</th><th>Mātrā</th></tr></thead>
              <tbody>
                {[
                  ['o', 'अ', '—', 'D'], ['a/A', 'आ', 'ा', 'D'],
                  ['i', 'इ', 'ि', 'D'], ['ee/I', 'ई', 'ी', 'I'],
                  ['u', 'उ', 'ु', 'D'], ['oo/U', 'ऊ', 'ू', 'I'],
                  ['e', 'ए', 'े', 'D'], ['wi/ai', 'ऐ', 'ै', 'D'],
                  ['w', 'ओ', 'ो', 'D'], ['wo/ou', 'औ', 'ौ', 'D'],
                  ['ng/M', 'ं', 'ं', 'D'], ['ong/oM', 'अं', 'ं', 'D'],
                ].map(([k, s, m, src]) => (
                  <tr key={k} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '3px 6px', fontFamily: 'monospace' }}>{k}</td>
                    <td style={{ padding: '3px 6px', fontFamily: '"Noto Sans Devanagari", serif' }}>{s}</td>
                    <td style={{ padding: '3px 6px', fontFamily: '"Noto Sans Devanagari", serif' }}>{m}</td>
                    <td style={{ padding: '3px 6px', color: src === 'I' ? '#e07000' : '#1a73e8', fontSize: '0.7rem' }}>[{src}]</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3 style={{ fontSize: '0.9rem', margin: '0 0 0.5rem' }}>Consonants [D = documented, I = inferred]</h3>
            <table style={{ fontSize: '0.8rem', borderCollapse: 'collapse' }}>
              <thead><tr><th>Key</th><th>Char</th><th>Src</th></tr></thead>
              <tbody>
                {[
                  ['k/kh','ख','D'],['g','ग','D'],['gh','घ','I'],['NG','ङ','D'],
                  ['c','च','I'],['C/ch','छ','I'],['j','ज','D'],['jh','झ','I'],
                  ['T','ट','I'],['Th','ठ','I'],['D','ड','I'],['Dh','ढ','I'],['N','ण','I'],
                  ['t/th','थ','D'],['d','द','D'],['dh','ध','D'],['n','न','D'],
                  ['p/ph/f','फ','D'],['b','ब','D'],['bh','भ','I'],['m','म','D'],
                  ['y/I(c)','य','D'],['r','र','D'],['l','ल','D'],
                  ['O(cap)','व','D'],['S/sh','श','I'],['x','ष','I'],['s','स','D'],['h','ह','D'],
                ].map(([k, c, src]) => (
                  <tr key={k} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '3px 6px', fontFamily: 'monospace' }}>{k}</td>
                    <td style={{ padding: '3px 6px', fontFamily: '"Noto Sans Devanagari", serif', fontSize: '1.1rem' }}>{c}</td>
                    <td style={{ padding: '3px 6px', color: src === 'I' ? '#e07000' : '#1a73e8', fontSize: '0.7rem' }}>[{src}]</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </div>
  );
}

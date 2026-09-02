import { useState } from 'react';
import { GH, s } from '../styles/theme';
import { Tabs } from './Tabs';
import { RefTable } from './RefTable';
import { ChartTable } from './ChartTable';
import { Key } from './Key';
import { IcoBook, IcoKeyboard, IcoLightning, IcoCheck } from './icons';
import { VOWEL_REF, CONSONANT_REF, SPECIAL_REF, EXAMPLES } from '../data/referenceData';

export function ReferencePanel() {
  const [tab, setTab] = useState('vowels');

  const tabs = [
    { id: 'vowels',     label: 'Vowels',     icon: <IcoBook /> },
    { id: 'consonants', label: 'Consonants', icon: <IcoKeyboard /> },
    { id: 'special',    label: 'Special',    icon: <IcoLightning /> },
    { id: 'examples',   label: 'Examples',   icon: <IcoCheck /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ flexShrink: 0 }}>
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {tab === 'vowels' && (
          <>
            <p style={{ margin: '10px 0 8px', fontSize: 'var(--fs-14)', color: GH.fgMuted }}>
              Bodo Devanagari vowels — independent form, dependent diacritic (mātrā) form,
              and Roman transcription.
            </p>
            <ChartTable rows={VOWEL_REF} showDiacritic />
          </>
        )}
        {tab === 'consonants' && (
          <>
            <p style={{ margin: '10px 0 8px', fontSize: 'var(--fs-14)', color: GH.fgMuted }}>
              Bodo Devanagari consonants — with Roman transcription.
            </p>
            <ChartTable rows={CONSONANT_REF} />
          </>
        )}
        {tab === 'special' && (
          <>
            <p style={{ margin: '10px 0 8px', fontSize: 'var(--fs-14)', color: GH.fgMuted }}>
              Special characters and the <strong style={{ color: GH.fgDefault }}>ng rule</strong>:{' '}
              <Key k="ng" /> before a vowel → anusvara + ग + mātrā; before consonant/end → anusvara only.
              Two consonants with no vowel automatically insert halant (् ).
            </p>
            <RefTable rows={SPECIAL_REF} />
          </>
        )}
        {tab === 'examples' && (
          <div style={{ paddingTop: '8px' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Type</th>
                  <th style={s.th}>Output</th>
                  <th style={s.th}>Meaning</th>
                </tr>
              </thead>
              <tbody>
                {EXAMPLES.map((ex, i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 1 ? GH.rowStripe : 'transparent' }}>
                    <td style={s.td}><Key k={ex.roman} /></td>
                    <td style={{
                      ...s.td,
                      fontFamily: "'Noto Sans Devanagari', 'Mangal', serif",
                      fontSize: 'var(--fs-18)',
                      color: GH.accentFg,
                    }}>
                      {ex.devanagari}
                    </td>
                    <td style={{ ...s.td, color: GH.fgMuted }}>{ex.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

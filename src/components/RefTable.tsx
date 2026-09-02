import { GH, s } from '../styles/theme';
import { Key } from './Key';
import type { RefRow } from '../data/referenceData';

export function RefTable({ rows }: { rows: RefRow[] }) {
  return (
    <table style={s.table}>
      <thead>
        <tr>
          <th style={s.th}>Keys</th>
          <th style={s.th}>Output</th>
          <th style={s.th}>Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ backgroundColor: i % 2 === 1 ? GH.rowStripe : 'transparent' }}>
            <td style={s.td}>
              <span style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {row.keys.map(k => <Key key={k} k={k} />)}
              </span>
            </td>
            <td style={{
              ...s.td,
              fontFamily: "'Noto Sans Devanagari', 'Mangal', serif",
              fontSize: 'var(--fs-18)',
              color: GH.accentFg,
            }}>
              {row.output}
            </td>
            <td style={{ ...s.td, color: GH.fgMuted }}>{row.label}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

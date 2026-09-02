import { GH, s } from '../styles/theme';
import type { ChartRow } from '../data/referenceData';

// Pure phonetic-chart table (bodo_deva.md): Devanagari, optional dependent
// diacritic form, Roman transcription. No typing keys here.
export function ChartTable({
  rows,
  showDiacritic = false,
}: {
  rows: ChartRow[];
  showDiacritic?: boolean;
}) {
  return (
    <table style={s.table}>
      <thead>
        <tr>
          <th style={s.th}>Devanagari</th>
          {showDiacritic && <th style={s.th}>Diacritic</th>}
          <th style={s.th}>Roman</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ backgroundColor: i % 2 === 1 ? GH.rowStripe : 'transparent' }}>
            <td style={{
              ...s.td,
              fontFamily: "'Noto Sans Devanagari', 'Mangal', serif",
              fontSize: 'var(--fs-20)',
              color: GH.accentFg,
            }}>
              {row.output}
            </td>
            {showDiacritic && (
              <td style={{
                ...s.td,
                fontFamily: "'Noto Sans Devanagari', 'Mangal', serif",
                fontSize: 'var(--fs-20)',
                color: GH.fgMuted,
              }}>
                {row.diacritic}
              </td>
            )}
            <td style={{ ...s.td, color: GH.fgDefault, fontStyle: 'italic' }}>{row.roman}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

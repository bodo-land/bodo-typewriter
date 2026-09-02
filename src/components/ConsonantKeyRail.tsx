import { useState } from 'react';
import { GH } from '../styles/theme';
import { CONSONANT_KEYS } from '../data/consonantKeys';

const PREVIEW_COUNT = 20;

/**
 * "Which key types this letter?" cheat sheet — one tab inside
 * ReferencePanel (see ReferencePanel.tsx), not a standalone card. Bare
 * content only; sizing/border/visibility all belong to the parent tab.
 */
export function ConsonantKeyRail() {
  const [expanded, setExpanded] = useState(false);
  const rows = expanded ? CONSONANT_KEYS : CONSONANT_KEYS.slice(0, PREVIEW_COUNT);

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px' }}>
      {rows.map(({ devanagari, key }) => (
        <div
          key={devanagari}
          title={key ? `Type "${key}" for ${devanagari}` : `${devanagari} has no direct key in this engine`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '6px',
            padding: '2px 6px',
            borderRadius: '4px',
            opacity: key ? 1 : 0.4,
          }}
        >
          <span style={{
            fontFamily: "'Noto Sans Devanagari', 'Mangal', serif",
            fontSize: 'var(--fs-16)',
            color: GH.fgDefault,
          }}>
            {devanagari}
          </span>
          <kbd style={{
            fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace',
            fontSize: 'var(--fs-11)',
            color: key ? GH.accentFg : GH.fgSubtle,
          }}>
            {key ?? '—'}
          </kbd>
        </div>
      ))}

      {CONSONANT_KEYS.length > PREVIEW_COUNT && (
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            alignSelf: 'flex-start',
            marginTop: '4px',
            border: 'none',
            background: 'none',
            color: GH.accentFg,
            fontSize: 'var(--fs-13)',
            cursor: 'pointer',
            padding: '2px 6px',
          }}
        >
          {expanded ? '‹ view less' : '… view more'}
        </button>
      )}
    </div>
  );
}

import { useState } from 'react';
import { GH } from '../styles/theme';
import type { Session } from '../utils/sessionStorage';
import { timeAgo } from '../utils/timeAgo';

/** One row in the session-history dropdown: relative time + a text preview. */
export function HistoryItem({ session, onSelect }: { session: Session; onSelect: () => void }) {
  const [hover, setHover] = useState(false);
  const preview = (session.paragraph || session.romanParagraph || '(empty session)').trim().slice(0, 60);

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '8px 10px',
        borderRadius: '4px',
        border: 'none',
        background: hover ? GH.hoverBg : 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'background-color 80ms',
      }}
    >
      <div style={{ fontSize: 'var(--fs-11)', color: GH.fgSubtle, marginBottom: '2px' }}>
        {timeAgo(session.savedAt)}
      </div>
      <div style={{
        fontFamily: "'Noto Sans Devanagari', 'Mangal', serif",
        fontSize: 'var(--fs-14)',
        color: GH.fgDefault,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {preview}
      </div>
    </button>
  );
}

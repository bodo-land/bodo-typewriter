import { useState } from 'react';
import { GH } from '../styles/theme';
import type { Session } from '../utils/sessionStorage';
import { timeAgo } from '../utils/timeAgo';
import { IcoTrash } from './icons';

/**
 * One row in the sidebar's session list: relative time, a Roman preview
 * line, and the Devanagari preview. Not a real <button> (it has a nested
 * delete button, and two interactive elements can't nest in valid HTML) —
 * a div with button semantics instead, clickable and keyboard-operable.
 */
export function HistoryItem({
  session,
  onSelect,
  onDelete,
}: {
  session: Session;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [hover, setHover] = useState(false);
  const roman = session.romanParagraph.trim();
  const devanagari = session.paragraph.trim();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); }
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '4px',
        width: '100%',
        padding: '8px 6px 8px 10px',
        borderRadius: '4px',
        background: hover ? GH.hoverBg : 'none',
        cursor: 'pointer',
        transition: 'background-color 80ms',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'var(--fs-11)', color: GH.fgSubtle, marginBottom: '2px' }}>
          {timeAgo(session.savedAt)}
        </div>
        {roman && (
          <div style={{
            fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace',
            fontSize: 'var(--fs-11)',
            color: GH.fgSubtle,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {roman}
          </div>
        )}
        <div style={{
          fontFamily: "'Noto Sans Devanagari', 'Mangal', serif",
          fontSize: 'var(--fs-14)',
          color: GH.fgDefault,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {devanagari || '(empty session)'}
        </div>
      </div>

      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        title="Delete this session"
        aria-label="Delete this session"
        style={{
          flexShrink: 0,
          border: 'none',
          background: 'none',
          color: GH.fgSubtle,
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '3px',
          opacity: hover ? 1 : 0,
          transition: 'opacity 80ms, color 80ms',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = GH.dangerFg; }}
        onMouseLeave={e => { e.currentTarget.style.color = GH.fgSubtle; }}
      >
        <IcoTrash />
      </button>
    </div>
  );
}

import { useState } from 'react';
import { GH } from '../styles/theme';
import type { Session } from '../utils/sessionStorage';
import { timeAgo } from '../utils/timeAgo';
import { RenameInput } from './RenameInput';
import { IcoTrash, IcoPencil } from './icons';

/**
 * One row in the sidebar's session list: relative time, an optional custom
 * title, an English preview line, and the Devanagari preview. Not a real
 * <button> (it has nested delete/rename buttons, and interactive elements
 * can't nest in valid HTML) — a div with button semantics instead,
 * clickable and keyboard-operable.
 */
export function HistoryItem({
  session,
  onSelect,
  onDelete,
  onRename,
}: {
  session: Session;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
}) {
  const [hover, setHover] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const english = session.englishParagraph.trim();
  const devanagari = session.paragraph.trim();

  return (
    <div
      role={renaming ? undefined : 'button'}
      tabIndex={renaming ? undefined : 0}
      onClick={renaming ? undefined : onSelect}
      onKeyDown={e => {
        if (!renaming && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect(); }
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
        cursor: renaming ? 'default' : 'pointer',
        transition: 'background-color 80ms',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'var(--fs-11)', color: GH.fgSubtle, marginBottom: '2px' }}>
          {timeAgo(session.savedAt)}
        </div>

        {renaming ? (
          <RenameInput
            initialValue={session.title ?? ''}
            placeholder="Untitled session"
            onCommit={title => { onRename(title); setRenaming(false); }}
            onCancel={() => setRenaming(false)}
          />
        ) : (
          <>
            {session.title && (
              <div style={{
                fontSize: 'var(--fs-14)',
                fontWeight: 600,
                color: GH.fgDefault,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {session.title}
              </div>
            )}
            {english && (
              <div style={{
                fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace',
                fontSize: 'var(--fs-11)',
                color: GH.fgSubtle,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {english}
              </div>
            )}
            <div style={{
              fontFamily: "'Noto Sans Devanagari', 'Mangal', serif",
              fontSize: 'var(--fs-14)',
              color: session.title ? GH.fgSubtle : GH.fgDefault,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {devanagari || '(empty session)'}
            </div>
          </>
        )}
      </div>

      {!renaming && (
        <div style={{ display: 'flex', flexShrink: 0, opacity: hover ? 1 : 0, transition: 'opacity 80ms' }}>
          <button
            onClick={e => { e.stopPropagation(); setRenaming(true); }}
            title="Rename this session"
            aria-label="Rename this session"
            style={{
              border: 'none',
              background: 'none',
              color: GH.fgSubtle,
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '3px',
              transition: 'color 80ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = GH.accentFg; }}
            onMouseLeave={e => { e.currentTarget.style.color = GH.fgSubtle; }}
          >
            <IcoPencil />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            title="Delete this session"
            aria-label="Delete this session"
            style={{
              border: 'none',
              background: 'none',
              color: GH.fgSubtle,
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '3px',
              transition: 'color 80ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = GH.dangerFg; }}
            onMouseLeave={e => { e.currentTarget.style.color = GH.fgSubtle; }}
          >
            <IcoTrash />
          </button>
        </div>
      )}
    </div>
  );
}

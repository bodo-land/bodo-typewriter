import { useState } from 'react';
import { GH } from '../styles/theme';
import { Btn } from './Btn';
import { HistoryItem } from './HistoryItem';
import { RenameInput } from './RenameInput';
import { IcoBook, IcoPlus, IcoTrash, IcoPencil } from './icons';
import { MAX_HISTORY, type Session } from '../utils/sessionStorage';

/**
 * A persistent, VS Code Explorer-style left panel: instead of a file tree,
 * it lists saved sessions, with the live session pinned at the top like an
 * active/open file. Click a history entry to swap it in (restoreSession
 * parks whatever's current back into history, so nothing is lost); the
 * trash icon on hover deletes one outright, and a pencil icon opens an
 * inline rename. The pinned "Current" entry gets the same hover
 * treatment, but deleting it wipes the live session directly — unlike
 * history deletes, there's no copy to lose since it was never archived.
 *
 * On narrow screens (see index.css) this renders as a dismissible overlay
 * with a backdrop instead of an inline column — `onClose` is only used
 * there (the backdrop is invisible and un-clickable on wide screens).
 */
const CURRENT_TIMESTAMP_FORMAT = new Intl.DateTimeFormat(undefined, {
  month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
});

export function Sidebar({
  history,
  currentRoman,
  currentDevanagari,
  currentTitle,
  currentSavedAt,
  onRenameCurrent,
  onNewSession,
  onRestore,
  onDelete,
  onRename,
  onDeleteCurrent,
  onClose,
}: {
  history: Session[];
  currentRoman: string;
  currentDevanagari: string;
  currentTitle: string;
  currentSavedAt: number;
  onRenameCurrent: (title: string) => void;
  onNewSession: () => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDeleteCurrent: () => void;
  onClose: () => void;
}) {
  const [currentHover, setCurrentHover] = useState(false);
  const [renamingCurrent, setRenamingCurrent] = useState(false);
  const currentIsEmpty = !currentRoman.trim() && !currentDevanagari.trim();

  return (
    <>
      <div className="sidebar-backdrop" onClick={onClose} />
      <aside className="sidebar" style={{
        // Weight 20 alongside main-grid (65) and ConsonantKeyRail (15) in
        // the shared contentRow flex row — a 20/65/15 split.
        flex: '20 1 0%',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        border: `1px solid ${GH.borderDefault}`,
        borderRadius: '6px',
        overflow: 'hidden',
        backgroundColor: GH.canvasSubtle,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 10px 10px 14px',
          flexShrink: 0,
          borderBottom: `1px solid ${GH.borderMuted}`,
        }}>
          <IcoBook />
          <span style={{
            fontSize: 'var(--fs-11)',
            fontWeight: 700,
            color: GH.fgMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            flex: 1,
          }}>
            Session History
          </span>
          <span style={{ fontSize: 'var(--fs-11)', color: GH.fgSubtle }}>
            {history.length}/{MAX_HISTORY}
          </span>
          <Btn variant="secondary" onClick={onNewSession} title="Archive the current session and start a blank one">
            <IcoPlus /> New
          </Btn>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '6px' }}>
          {/* Current session — pinned like the active file in an explorer tree. */}
          <div
            onMouseEnter={() => setCurrentHover(true)}
            onMouseLeave={() => setCurrentHover(false)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '4px',
              padding: '8px 6px 8px 10px',
              borderRadius: '4px',
              borderLeft: `2px solid ${GH.accentFg}`,
              backgroundColor: GH.accentSubtle,
              marginBottom: '8px',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: 'var(--fs-11)',
                color: GH.accentFg,
                fontWeight: 600,
                marginBottom: '2px',
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: GH.accentFg,
                }} />
                Current Session
              </div>
              <div style={{ fontSize: 'var(--fs-11)', color: GH.fgSubtle, marginBottom: '4px' }}>
                {CURRENT_TIMESTAMP_FORMAT.format(currentSavedAt)}
              </div>

              {renamingCurrent ? (
                <RenameInput
                  initialValue={currentTitle}
                  placeholder="Untitled session"
                  onCommit={title => { onRenameCurrent(title); setRenamingCurrent(false); }}
                  onCancel={() => setRenamingCurrent(false)}
                />
              ) : (
                <>
                  {currentTitle && (
                    <div style={{
                      fontSize: 'var(--fs-14)',
                      fontWeight: 600,
                      color: GH.fgDefault,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {currentTitle}
                    </div>
                  )}
                  {currentRoman.trim() && (
                    <div style={{
                      fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace',
                      fontSize: 'var(--fs-11)',
                      color: GH.fgSubtle,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {currentRoman.trim()}
                    </div>
                  )}
                  <div style={{
                    fontFamily: "'Noto Sans Devanagari', 'Mangal', serif",
                    fontSize: 'var(--fs-14)',
                    color: currentTitle ? GH.fgSubtle : GH.fgDefault,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {currentDevanagari.trim() || '(empty)'}
                  </div>
                </>
              )}
            </div>

            {!renamingCurrent && (
              <div style={{ display: 'flex', flexShrink: 0, opacity: currentHover ? 1 : 0, transition: 'opacity 80ms' }}>
                <button
                  onClick={() => setRenamingCurrent(true)}
                  title="Rename current session"
                  aria-label="Rename current session"
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
                {!currentIsEmpty && (
                  <button
                    onClick={onDeleteCurrent}
                    title="Delete current session (not archived to history)"
                    aria-label="Delete current session"
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
                )}
              </div>
            )}
          </div>

          {history.length === 0 ? (
            <div style={{ padding: '14px 10px', fontSize: 'var(--fs-13)', color: GH.fgSubtle, textAlign: 'center' }}>
              No saved sessions yet — start typing to save your sessions.
            </div>
          ) : (
            history.map(sess => (
              <HistoryItem
                key={sess.id}
                session={sess}
                onSelect={() => onRestore(sess.id)}
                onDelete={() => onDelete(sess.id)}
                onRename={title => onRename(sess.id, title)}
              />
            ))
          )}
        </div>

        <div style={{
          flexShrink: 0,
          padding: '10px 14px',
          borderTop: `1px solid ${GH.borderMuted}`,
          fontSize: 'var(--fs-11)',
          color: GH.fgSubtle,
          lineHeight: 1.5,
        }}>
          <div>© {new Date().getFullYear()} Bodo Typewriter</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
            <span>All rights reserved</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              style={{ color: GH.accentFg, textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              Open source ↗
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}

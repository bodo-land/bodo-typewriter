import { GH } from '../styles/theme';
import { Btn } from './Btn';
import { HistoryItem } from './HistoryItem';
import { IcoBook, IcoPlus } from './icons';
import type { Session } from '../utils/sessionStorage';

/**
 * A persistent, VS Code Explorer-style left panel: instead of a file tree,
 * it lists saved sessions, with the live session pinned at the top like an
 * active/open file. Click a history entry to swap it in (restoreSession
 * parks whatever's current back into history, so nothing is lost).
 */
export function Sidebar({
  history,
  currentPreview,
  onNewSession,
  onRestore,
}: {
  history: Session[];
  currentPreview: string;
  onNewSession: () => void;
  onRestore: (id: string) => void;
}) {
  return (
    <aside className="sidebar" style={{
      width: '260px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      borderRight: `1px solid ${GH.borderDefault}`,
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
        <Btn variant="secondary" onClick={onNewSession} title="Archive the current session and start a blank one">
          <IcoPlus />
        </Btn>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '6px' }}>
        {/* Current session — pinned like the active file in an explorer tree. */}
        <div style={{
          padding: '8px 10px',
          borderRadius: '4px',
          borderLeft: `2px solid ${GH.accentFg}`,
          backgroundColor: GH.accentSubtle,
          marginBottom: '8px',
        }}>
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
            Current
          </div>
          <div style={{
            fontFamily: "'Noto Sans Devanagari', 'Mangal', serif",
            fontSize: 'var(--fs-14)',
            color: GH.fgDefault,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {currentPreview.trim() || '(empty)'}
          </div>
        </div>

        {history.length === 0 ? (
          <div style={{ padding: '14px 10px', fontSize: 'var(--fs-13)', color: GH.fgSubtle, textAlign: 'center' }}>
            No saved sessions yet — the + button archives the current one here.
          </div>
        ) : (
          history.map(sess => (
            <HistoryItem key={sess.id} session={sess} onSelect={() => onRestore(sess.id)} />
          ))
        )}
      </div>
    </aside>
  );
}

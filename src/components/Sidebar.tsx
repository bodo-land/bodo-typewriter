import { useMemo, useRef, useState } from 'react';
import { HistoryItem } from './HistoryItem';
import { IcoPlus, IcoSearch, IcoHardDrive, IcoDownload, IcoUpload } from './icons';
import { MAX_HISTORY, STORAGE_QUOTA_BYTES, storageBytesUsed, type Session } from '../utils/sessionStorage';
import { timeAgo } from '../utils/timeAgo';

const CURRENT_TIME_FORMAT = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function matches(query: string, ...fields: (string | undefined)[]): boolean {
  const q = query.trim().toLowerCase();
  return !q || fields.some(f => f?.toLowerCase().includes(q));
}

/**
 * Left panel: the live session pinned at the top (highlighted), then
 * archived sessions. Clicking an archived one swaps it in (restoreSession
 * parks the current one back into history, so nothing is lost). The search
 * box filters archived sessions by title, English or Devanagari text. The
 * footer shows real localStorage usage and the backup export/import.
 *
 * On narrow screens (see index.css) this renders as a dismissible overlay
 * with a backdrop instead of an inline column — `onClose` is only used
 * there (the backdrop is invisible and un-clickable on wide screens).
 */
export function Sidebar({
  history,
  currentEnglish,
  currentDevanagari,
  currentTitle,
  currentSavedAt,
  imeActive,
  onRenameCurrent,
  onNewSession,
  onRestore,
  onDelete,
  onRename,
  onDeleteCurrent,
  onExport,
  onImport,
  onClose,
}: {
  history: Session[];
  currentEnglish: string;
  currentDevanagari: string;
  currentTitle: string;
  currentSavedAt: number;
  imeActive: boolean;
  onRenameCurrent: (title: string) => void;
  onNewSession: () => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDeleteCurrent: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentIsEmpty = !currentEnglish.trim() && !currentDevanagari.trim();

  const filtered = history.filter(s => matches(query, s.title, s.englishParagraph, s.paragraph));

  // Recomputed whenever anything that gets persisted changes.
  const bytesUsed = useMemo(
    () => storageBytesUsed(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history, currentEnglish, currentDevanagari, currentTitle, currentSavedAt],
  );
  const usedPct = Math.min(100, (bytesUsed / STORAGE_QUOTA_BYTES) * 100);

  return (
    <>
      <div className="sidebar-backdrop" onClick={onClose} />
      <aside className="sidebar flex w-72 shrink-0 flex-col border-r border-line bg-panel">
        <div className="flex flex-col gap-3 border-b border-line p-4">
          <button
            type="button"
            onClick={onNewSession}
            title="Archive the current session and start a blank one"
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-600/25 transition-all hover:brightness-110"
          >
            <span className="transition-transform group-hover:rotate-90"><IcoPlus /></span>
            New Bodo Session
          </button>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-subtle"><IcoSearch size={14} /></span>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search saved drafts…"
              aria-label="Search saved sessions"
              className="w-full rounded-lg border border-line bg-canvas py-2 pl-9 pr-3 text-xs text-fg placeholder:text-subtle focus:border-brand focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 space-y-1.5 overflow-y-auto p-3">
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
            <span>Current Session</span>
          </div>
          <HistoryItem
            active
            title={currentTitle}
            english={currentEnglish}
            devanagari={currentDevanagari}
            timeLabel={CURRENT_TIME_FORMAT.format(currentSavedAt)}
            onRename={onRenameCurrent}
            onDelete={currentIsEmpty ? undefined : onDeleteCurrent}
            deleteTitle="Delete current session (not archived to history)"
          />

          <div className="flex items-center justify-between px-2 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
            <span>Recent Documents</span>
            <span className="text-[10px] text-subtle">{history.length}/{MAX_HISTORY} Drafts</span>
          </div>
          {history.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-subtle">
              No saved sessions yet. "New Bodo Session" archives the current one here.
            </p>
          ) : filtered.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-subtle">No sessions match "{query.trim()}".</p>
          ) : (
            filtered.map(sess => (
              <HistoryItem
                key={sess.id}
                title={sess.title}
                english={sess.englishParagraph}
                devanagari={sess.paragraph}
                timeLabel={timeAgo(sess.savedAt)}
                onSelect={() => onRestore(sess.id)}
                onDelete={() => onDelete(sess.id)}
                onRename={title => onRename(sess.id, title)}
              />
            ))
          )}
        </div>

        <div className="border-t border-line bg-canvas/40 p-4 text-xs">
          <div className="mb-2 flex items-center justify-between text-muted">
            <span className="flex items-center gap-1.5">
              <span className="text-brand-fg"><IcoHardDrive size={14} /></span> Storage
            </span>
            <span title="Space used in this browser's local storage">
              {formatBytes(bytesUsed)} / ~{formatBytes(STORAGE_QUOTA_BYTES)}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-hover">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-400"
              style={{ width: `${Math.max(usedPct, bytesUsed > 0 ? 1 : 0)}%` }}
            />
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={onExport}
              title="Download all sessions as a backup file"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-hover px-2 py-1.5 text-[11px] text-fg transition-all hover:brightness-125"
            >
              <IcoDownload /> Export all
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Import sessions from a backup file"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-hover px-2 py-1.5 text-[11px] text-fg transition-all hover:brightness-125"
            >
              <IcoUpload /> Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) onImport(file);
                e.target.value = ''; // allow importing the same file again later
              }}
            />
          </div>

          <div className="mt-3 flex justify-between border-t border-line pt-2 text-[11px] text-subtle">
            <span>Bodo IME (Devanagari)</span>
            <span className={imeActive ? 'text-ok' : 'text-subtle'}>{imeActive ? 'On' : 'Off'}</span>
          </div>
        </div>
      </aside>
    </>
  );
}

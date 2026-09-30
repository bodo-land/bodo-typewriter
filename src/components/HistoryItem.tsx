import { useState } from 'react';
import { RenameInput } from './RenameInput';
import { IcoTrash, IcoPencil, IcoFileText } from './icons';
import { wordCount } from '../utils/wordCount';

/**
 * One session card in the sidebar: Devanagari preview (or its custom
 * title), a time label, the English preview, and a word count. Used for
 * both the pinned current session (`active`) and archived ones. Not a real
 * <button> (it has nested rename/delete buttons, and interactive elements
 * can't nest in valid HTML) — a div with button semantics instead,
 * clickable and keyboard-operable.
 */
export function HistoryItem({
  title,
  english,
  devanagari,
  timeLabel,
  active,
  onSelect,
  onDelete,
  onRename,
  deleteTitle = 'Delete this session',
}: {
  title?: string;
  english: string;
  devanagari: string;
  timeLabel: string;
  active?: boolean;
  onSelect?: () => void;
  /** Omit to hide the delete button (e.g. an empty current session). */
  onDelete?: () => void;
  onRename: (title: string) => void;
  deleteTitle?: string;
}) {
  const [renaming, setRenaming] = useState(false);
  const english_ = english.trim();
  const devanagari_ = devanagari.trim();
  const words = wordCount(devanagari_);
  const clickable = !renaming && !!onSelect;

  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? onSelect : undefined}
      onKeyDown={e => {
        if (clickable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect!(); }
      }}
      className={`group relative rounded-xl border p-3 text-left transition-all ${
        active
          ? 'border-brand/40 bg-hover'
          : 'border-transparent hover:border-line hover:bg-hover/60'
      } ${clickable ? 'cursor-pointer' : ''}`}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        {renaming ? (
          <RenameInput
            initialValue={title ?? ''}
            placeholder="Untitled session"
            onCommit={t => { onRename(t); setRenaming(false); }}
            onCancel={() => setRenaming(false)}
          />
        ) : (
          <span className={`truncate text-xs font-medium ${title ? '' : 'font-deva'} ${active ? 'text-fg' : 'text-fg/80'}`}>
            {title || devanagari_ || (active ? 'New session' : '(empty session)')}
          </span>
        )}
        <span className={`whitespace-nowrap text-[10px] ${active ? 'text-muted' : 'text-subtle'}`}>{timeLabel}</span>
      </div>
      {title && devanagari_ && <p className="mb-0.5 truncate font-deva text-[11px] text-muted">{devanagari_}</p>}
      <p className="mb-2 truncate font-mono text-[11px] text-subtle">{english_ || '—'}</p>
      <div className="flex items-center justify-between text-[10px] text-subtle">
        <span className="flex items-center gap-1">
          <span className={active ? 'text-brand-fg' : ''}><IcoFileText size={12} /></span>
          {words} {words === 1 ? 'Word' : 'Words'}
        </span>
        {!renaming && (
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setRenaming(true); }}
              title="Rename this session"
              aria-label="Rename this session"
              className="p-0.5 text-muted hover:text-brand-fg"
            >
              <IcoPencil />
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onDelete(); }}
                title={deleteTitle}
                aria-label={deleteTitle}
                className="p-0.5 text-muted hover:text-danger"
              >
                <IcoTrash />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

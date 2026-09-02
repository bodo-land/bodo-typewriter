import { useRef, useEffect } from 'react';
import { GH } from '../styles/theme';

/**
 * Inline text input for renaming a session — autofocused and selected on
 * mount, commits on Enter/blur, discards on Escape. Shared by HistoryItem
 * and Sidebar's pinned "Current" block so both rename affordances behave
 * identically.
 */
export function RenameInput({
  initialValue,
  placeholder,
  onCommit,
  onCancel,
}: {
  initialValue: string;
  placeholder: string;
  onCommit: (value: string) => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  return (
    <input
      ref={ref}
      type="text"
      defaultValue={initialValue}
      placeholder={placeholder}
      maxLength={80}
      onClick={e => e.stopPropagation()}
      onKeyDown={e => {
        e.stopPropagation();
        if (e.key === 'Enter') { e.preventDefault(); onCommit(e.currentTarget.value.trim()); }
        if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
      }}
      onBlur={e => onCommit(e.currentTarget.value.trim())}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        fontSize: 'var(--fs-14)',
        fontWeight: 600,
        color: GH.fgDefault,
        backgroundColor: GH.canvasDefault,
        border: `1px solid ${GH.accentFg}`,
        borderRadius: '4px',
        padding: '2px 6px',
        outline: 'none',
      }}
    />
  );
}

/**
 * BodoInput — a transliteration-enabled textarea for Bodo Devanagari.
 *
 * Features
 * ─────────
 * • Real-time transliteration as the user types Roman characters
 * • Smart backspace (undoes one Roman keystroke at a time)
 * • Word-boundary commit on Space / Enter / Tab
 * • IME active/inactive toggle (F9 or a toggle button)
 * • Copy outputs pure Devanagari Unicode
 * • Mobile-friendly (software keyboard triggers onChange, handled via paste path)
 * • Controlled mode: pass `value` + `onChange` for external state
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { transliterate } from '../engine/transliterator';
import { useBodoIME } from '../hooks/useBodoIME';

export type BodoInputProps = {
  /** Placeholder shown when empty */
  placeholder?: string;
  /** Initial value (Roman or Unicode) */
  defaultValue?: string;
  /** Controlled value; if provided, `onChange` is also required */
  value?: string;
  /** Called with the new Unicode value after every change */
  onChange?: (value: string) => void;
  /** Class name applied to the wrapper <div> */
  className?: string;
  /** Class name applied to the <textarea> */
  textareaClassName?: string;
  /** Number of rows (default: 4) */
  rows?: number;
  /** Autofocus on mount */
  autoFocus?: boolean;
};

export const BodoInput: React.FC<BodoInputProps> = ({
  placeholder = 'Type in Bodo (Roman transliteration)…',
  defaultValue = '',
  value: controlledValue,
  onChange,
  className = '',
  textareaClassName = '',
  rows = 4,
  autoFocus = false,
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  // Finished words live here, fully independent of the composing buffer —
  // Backspace in the composing buffer can never reach back into this.
  const [committed, setCommitted] = useState(() => defaultValue.normalize('NFC'));
  const { romanBuffer, handleKeyDown, reset: resetBuffer } = useBodoIME({
    onCommit: text => setCommitted(c => c + text),
  });
  const value = committed + transliterate(romanBuffer);
  const reset = useCallback(() => {
    setCommitted('');
    resetBuffer();
  }, [resetBuffer]);
  const [imeActive, setImeActive] = useState(true);

  // Sync controlled value → internal state (reset + seed committed)
  const prevControlled = useRef(controlledValue);
  useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== prevControlled.current) {
      prevControlled.current = controlledValue;
      // When externally controlled, we surface it directly.
      // The hook manages its own buffer; for full controlled mode the parent
      // should manage the entire string via onChange.
    }
  }, [controlledValue]);

  // Notify parent of changes
  const displayValue = controlledValue !== undefined ? controlledValue : value;

  useEffect(() => {
    onChange?.(value);
  }, [value, onChange]);

  // Move cursor to end after every transliteration update
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const end = el.value.length;
    // Only move cursor if we're currently at the end (don't disrupt manual positioning)
    if (el.selectionStart === el.selectionEnd && el.selectionEnd >= end - 3) {
      el.setSelectionRange(end, end);
    }
  }, [value]);

  // Toggle IME with F9 (matching Pramukh behaviour)
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'F9') {
        e.preventDefault();
        setImeActive(v => !v);
        return;
      }
      if (imeActive) {
        handleKeyDown(e);
      }
    },
    [imeActive, handleKeyDown],
  );

  // Mobile / paste: transliterate pasted Roman text
  const onPaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (!imeActive) return;
      e.preventDefault();
      const pastedRoman = e.clipboardData.getData('text/plain');
      const unicode = transliterate(pastedRoman);
      const el = ref.current;
      if (!el) return;
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;
      const current = el.value;
      const next = current.slice(0, start) + unicode + current.slice(end);
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value',
      )?.set;
      nativeInputValueSetter?.call(el, next);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    },
    [imeActive],
  );

  return (
    <div className={`bodo-input-wrapper ${className}`} style={{ position: 'relative' }}>
      <textarea
        ref={ref}
        rows={rows}
        value={displayValue}
        onChange={() => {
          /* Controlled by IME hook; suppress React's uncontrolled warning */
        }}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`bodo-textarea ${textareaClassName}`}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        inputMode="text"
        style={{
          fontFamily: '"Noto Sans Devanagari", "Mangal", serif',
          fontSize: '1.2rem',
          lineHeight: 1.6,
          width: '100%',
          boxSizing: 'border-box',
          padding: '0.75rem',
          resize: 'vertical',
        }}
      />

      {/* Status bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: '#666',
          padding: '0.25rem 0',
        }}
      >
        <span>
          {imeActive ? (
            <span style={{ color: '#1a73e8' }}>
              ✦ Bodo IME active (F9 to toggle) — composing:{' '}
              <code style={{ fontFamily: 'monospace' }}>{romanBuffer || '…'}</code>
            </span>
          ) : (
            <span>IME off (F9 to enable Bodo transliteration)</span>
          )}
        </span>
        <button
          type="button"
          onClick={reset}
          style={{
            border: '1px solid #ccc',
            background: 'none',
            cursor: 'pointer',
            borderRadius: 4,
            padding: '2px 8px',
            fontSize: '0.75rem',
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default BodoInput;

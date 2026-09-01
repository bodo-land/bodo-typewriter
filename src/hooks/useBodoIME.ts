/**
 * useBodoIME — React hook that manages the Roman→Bodo composing buffer.
 *
 * Architecture
 * ─────────────
 * The hook owns exactly ONE piece of state: `romanBuffer`, the Roman
 * keystrokes for the word currently being composed. It does NOT own any
 * "committed" / already-finished text — that lives wherever the caller
 * decides (see `onCommit` below). This is what lets a caller keep finished
 * words in a separate, independently-editable text store: Backspace here
 * can only ever reach into the current word, never into anything already
 * committed.
 *
 * Word boundaries
 * ───────────────
 * Space and Enter both trigger a commit: the current romanBuffer is
 * transliterated, a single space appended, and the result handed to
 * `onCommit`. The buffer is then cleared. Enter does NOT insert a hard
 * line break here — composing text always stays on one flowing line; a
 * real paragraph break is something the user adds by focusing the
 * committed-text box directly and pressing Enter there (plain textarea
 * behaviour, independent of this hook). Tab is intentionally NOT a commit
 * boundary — it lets the browser move focus to the next element as normal
 * (fixes BUG-005).
 *
 * Backspace
 * ─────────
 * Smart backspace: removes the last Roman character from romanBuffer and
 * re-transliterates. If romanBuffer is already empty, Backspace is a no-op —
 * it never reaches into previously committed text (this is the fix for the
 * "holding Backspace erases everything" bug).
 *
 * Paste
 * ─────
 * handlePaste() should be wired to the textarea's onPaste event. It commits
 * the current buffer plus the transliterated pasted text in one step via
 * `onCommit`, then clears the buffer.
 */

import { useState, useCallback } from 'react';
import { transliterate } from '../engine/transliterator';

export type UseBodoIMEOptions = {
  /** Called with finished Unicode text (word + boundary char) on Space/Enter/paste. */
  onCommit?: (unicodeText: string) => void;
};

export type IMEState = {
  /** Live transliteration preview of the current in-progress word only. */
  value: string;
  /** Roman buffer for the current in-progress word */
  romanBuffer: string;
  /** Handle a keydown event on the host element */
  handleKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  /** Handle a paste event on the host element */
  handlePaste: (e: React.ClipboardEvent<HTMLElement>) => void;
  /** Directly set the entire Roman buffer (e.g. for programmatic input) */
  setRoman: (roman: string) => void;
  /** Clear the composing buffer (does not touch anything already committed) */
  reset: () => void;
};

/** Characters that commit the current word and pass through verbatim */
const COMMIT_CHARS = new Set([' ', 'Enter', '\n', '\r']);
// Tab intentionally omitted — let the browser move focus normally (BUG-005).

export function useBodoIME(options: UseBodoIMEOptions = {}): IMEState {
  const { onCommit } = options;
  const [romanBuffer, setRomanBuffer] = useState('');

  const value = transliterate(romanBuffer);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      const key = e.key;

      // Let browser handle ctrl/meta shortcuts (undo, copy, etc.)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Smart backspace — undo last Roman keystroke. No-op once the buffer
      // is empty; previously committed words are out of reach from here.
      if (key === 'Backspace') {
        e.preventDefault();
        setRomanBuffer(prev => (prev.length > 0 ? prev.slice(0, -1) : prev));
        return;
      }

      // Delete — not yet implemented (requires cursor-position tracking)
      if (key === 'Delete') return;

      // Word boundary: commit buffer + a space, then clear. Enter is treated
      // the same as Space — it does not insert a hard line break (see
      // "Word boundaries" above).
      if (COMMIT_CHARS.has(key)) {
        e.preventDefault();
        onCommit?.(transliterate(romanBuffer) + ' ');
        setRomanBuffer('');
        return;
      }

      // Printable single character — append to Roman buffer
      if (key.length === 1) {
        e.preventDefault();
        setRomanBuffer(prev => prev + key);
        return;
      }

      // Arrow keys, Home, End, F-keys, etc. — let browser handle
    },
    [romanBuffer, onCommit],
  );

  // Paste handler — commits current buffer + transliterated pasted text in
  // one step (fixes BUG-002), then clears the buffer.
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text/plain');
      if (!pasted) return;
      onCommit?.(transliterate(romanBuffer) + transliterate(pasted));
      setRomanBuffer('');
    },
    [romanBuffer, onCommit],
  );

  const setRoman = useCallback((roman: string) => {
    setRomanBuffer(roman);
  }, []);

  const reset = useCallback(() => {
    setRomanBuffer('');
  }, []);

  return {
    value,
    romanBuffer,
    handleKeyDown,
    handlePaste,
    setRoman,
    reset,
  };
}

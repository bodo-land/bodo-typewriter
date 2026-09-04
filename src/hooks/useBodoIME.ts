/**
 * useBodoIME — React hook that manages the English→Bodo composing buffer.
 *
 * Architecture
 * ─────────────
 * The hook owns exactly ONE piece of state: `englishBuffer`, the English
 * keystrokes for the word currently being composed. It does NOT own any
 * "committed" / already-finished text — that lives wherever the caller
 * decides (see `onCommit` below). This is what lets a caller keep finished
 * words in a separate, independently-editable text store: Backspace here
 * can only ever reach into the current word, never into anything already
 * committed.
 *
 * Word boundaries
 * ───────────────
 * Space and Enter both trigger a commit: the current englishBuffer is
 * transliterated, a single space appended, and the result handed to
 * `onCommit`. The buffer is then cleared. Enter does NOT insert a hard
 * line break here — composing text always stays on one flowing line; a
 * real paragraph break is something the user adds by focusing the
 * committed-text box directly and pressing Enter there (plain textarea
 * behaviour, independent of this hook). Tab is intentionally NOT a commit
 * boundary — it lets the browser move focus to the next element as normal
 * (fixes BUG-005).
 *
 * Cursor-aware editing
 * ─────────────────────
 * Typing, Backspace and Delete all act at the textarea's actual caret
 * position (or replace its selection), not just at the end of the buffer —
 * so clicking into the middle of a composing word (e.g. "fo_ra_y_bw_na_i")
 * and inserting a character there edits in place instead of the keystroke
 * landing at the end. `ref` must be attached to the host textarea for this
 * to work: since the textarea is React-controlled, updating its value alone
 * would otherwise snap the caret to the end on every keystroke, so this
 * hook restores the caret itself after each edit.
 *
 * Backspace
 * ─────────
 * Smart backspace: removes the English character before the caret (or the
 * selected range) and re-transliterates. No-op if the caret is already at
 * position 0 with nothing selected — it never reaches into previously
 * committed text (this is the fix for the "holding Backspace erases
 * everything" bug).
 *
 * Paste
 * ─────
 * handlePaste() should be wired to the textarea's onPaste event. It commits
 * the current buffer plus the transliterated pasted text in one step via
 * `onCommit`, then clears the buffer.
 */

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { transliterate } from '../engine/transliterator';

export type UseBodoIMEOptions = {
  /**
   * Called on Space/Enter/paste with the finished word (+ boundary char),
   * in both its transliterated Unicode form and its raw English form — e.g.
   * a caller keeping parallel "English paragraph" and "Devanagari paragraph"
   * stores appends unicodeText to one and englishText to the other.
   */
  onCommit?: (unicodeText: string, englishText: string) => void;
  /**
   * Initial value for the composing buffer (e.g. restoring a saved session).
   * Only read on first render, like a normal useState initializer.
   */
  initialEnglish?: string;
};

export type IMEState = {
  /** Live transliteration preview of the current in-progress word only. */
  value: string;
  /** English buffer for the current in-progress word */
  englishBuffer: string;
  /** Attach to the host textarea — required for cursor-aware editing. */
  ref: React.RefObject<HTMLTextAreaElement | null>;
  /** Handle a keydown event on the host element */
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  /** Handle a paste event on the host element */
  handlePaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  /** Directly set the entire English buffer (e.g. for programmatic input) */
  setEnglish: (english: string) => void;
  /** Clear the composing buffer (does not touch anything already committed) */
  reset: () => void;
};

/** Characters that commit the current word and pass through verbatim */
const COMMIT_CHARS = new Set([' ', 'Enter', '\n', '\r']);
// Tab intentionally omitted — let the browser move focus normally (BUG-005).

export function useBodoIME(options: UseBodoIMEOptions = {}): IMEState {
  const { onCommit, initialEnglish } = options;
  const [englishBuffer, setEnglishBuffer] = useState(() => initialEnglish ?? '');
  const ref = useRef<HTMLTextAreaElement>(null);
  // Caret position to restore after a buffer edit — the textarea is
  // React-controlled, so setting .value alone would otherwise snap the
  // caret to the end.
  const pendingCaret = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (pendingCaret.current !== null && ref.current) {
      const pos = pendingCaret.current;
      pendingCaret.current = null;
      ref.current.setSelectionRange(pos, pos);
    }
  }, [englishBuffer]);

  const value = transliterate(englishBuffer);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const key = e.key;

      // Let browser handle ctrl/meta shortcuts (undo, copy, etc.)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const target = e.currentTarget;
      const selStart = target.selectionStart ?? englishBuffer.length;
      const selEnd = target.selectionEnd ?? englishBuffer.length;
      const hasSelection = selStart !== selEnd;

      // Smart backspace — deletes the selection, or the English character
      // before the caret. No-op at position 0 with nothing selected;
      // previously committed words are out of reach from here.
      if (key === 'Backspace') {
        e.preventDefault();
        if (hasSelection) {
          pendingCaret.current = selStart;
          setEnglishBuffer(prev => prev.slice(0, selStart) + prev.slice(selEnd));
        } else if (selStart > 0) {
          pendingCaret.current = selStart - 1;
          setEnglishBuffer(prev => prev.slice(0, selStart - 1) + prev.slice(selStart));
        }
        return;
      }

      // Delete — removes the selection, or the English character after the caret.
      if (key === 'Delete') {
        e.preventDefault();
        if (hasSelection) {
          pendingCaret.current = selStart;
          setEnglishBuffer(prev => prev.slice(0, selStart) + prev.slice(selEnd));
        } else if (selStart < englishBuffer.length) {
          pendingCaret.current = selStart;
          setEnglishBuffer(prev => prev.slice(0, selStart) + prev.slice(selStart + 1));
        }
        return;
      }

      // Word boundary: commit buffer + a space, then clear. Enter is treated
      // the same as Space — it does not insert a hard line break (see
      // "Word boundaries" above).
      if (COMMIT_CHARS.has(key)) {
        e.preventDefault();
        onCommit?.(transliterate(englishBuffer) + ' ', englishBuffer + ' ');
        setEnglishBuffer('');
        return;
      }

      // Printable single character — insert at the caret (replacing any
      // selection), not always at the end.
      if (key.length === 1) {
        e.preventDefault();
        pendingCaret.current = selStart + 1;
        setEnglishBuffer(prev => prev.slice(0, selStart) + key + prev.slice(selEnd));
        return;
      }

      // Arrow keys, Home, End, F-keys, etc. — let browser handle
    },
    [englishBuffer, onCommit],
  );

  // Paste handler — commits current buffer + transliterated pasted text in
  // one step (fixes BUG-002), then clears the buffer.
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text/plain');
      if (!pasted) return;
      onCommit?.(transliterate(englishBuffer) + transliterate(pasted), englishBuffer + pasted);
      setEnglishBuffer('');
    },
    [englishBuffer, onCommit],
  );

  const setEnglish = useCallback((english: string) => {
    setEnglishBuffer(english);
  }, []);

  const reset = useCallback(() => {
    setEnglishBuffer('');
  }, []);

  return {
    value,
    englishBuffer,
    ref,
    handleKeyDown,
    handlePaste,
    setEnglish,
    reset,
  };
}

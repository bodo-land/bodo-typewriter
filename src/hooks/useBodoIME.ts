/**
 * useBodoIME — React hook that manages Bodo transliteration state.
 *
 * Architecture
 * ─────────────
 * The hook maintains TWO parallel strings:
 *
 *   committedUnicode  — Unicode text already committed (word-complete)
 *   romanBuffer       — Roman keystrokes since the last word boundary
 *
 * The visible value is committedUnicode + transliterate(romanBuffer).
 *
 * Word boundaries
 * ───────────────
 * Space and Enter trigger a commit: the current romanBuffer is transliterated,
 * appended to committed, and the boundary character itself is appended.
 * Tab is intentionally NOT a commit boundary — it lets the browser move focus
 * to the next element as normal (fixes BUG-005).
 *
 * Backspace
 * ─────────
 * Smart backspace: removes the last Roman character from romanBuffer and
 * re-transliterates.  If romanBuffer is empty, removes the last Unicode
 * *grapheme cluster* from committedUnicode using Intl.Segmenter (fixes BUG-001).
 *
 * Paste
 * ─────
 * handlePaste() should be wired to the textarea's onPaste event.  It commits
 * the current buffer, then transliterates and commits the pasted Roman text
 * in one step (fixes BUG-002).
 */

import { useState, useCallback } from 'react';
import { transliterate } from '../engine/transliterator';

export type IMEState = {
  /** The full visible value (committed + in-progress transliteration) */
  value: string;
  /** Roman buffer for the current in-progress word */
  romanBuffer: string;
  /** Handle a keydown event on the host element */
  handleKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  /** Handle a paste event on the host element */
  handlePaste: (e: React.ClipboardEvent<HTMLElement>) => void;
  /** Directly set the entire Roman buffer (e.g. for programmatic input) */
  setRoman: (roman: string) => void;
  /** Reset all state */
  reset: () => void;
};

/** Characters that commit the current word and pass through verbatim */
const COMMIT_CHARS = new Set([' ', 'Enter', '\n', '\r']);
// Tab intentionally omitted — let the browser move focus normally (BUG-005).

/** Remove the last grapheme cluster from a string (BUG-001 fix). */
function dropLastGrapheme(s: string): string {
  if (!s) return s;
  const clusters = [...new Intl.Segmenter().segment(s)];
  return clusters.slice(0, -1).map(c => c.segment).join('');
}

export function useBodoIME(initialValue = ''): IMEState {
  // Normalise any externally provided seed value (BUG-006).
  const [committedUnicode, setCommitted] = useState(
    () => initialValue.normalize('NFC'),
  );
  const [romanBuffer, setRomanBuffer] = useState('');

  const currentValue = committedUnicode + transliterate(romanBuffer);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      const key = e.key;

      // Let browser handle ctrl/meta shortcuts (undo, copy, etc.)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Smart backspace — undo last Roman keystroke, or delete last grapheme
      if (key === 'Backspace') {
        e.preventDefault();
        setRomanBuffer(prev => {
          if (prev.length > 0) return prev.slice(0, -1);
          setCommitted(c => dropLastGrapheme(c)); // grapheme-aware (BUG-001)
          return prev;
        });
        return;
      }

      // Delete — not yet implemented (requires cursor-position tracking)
      if (key === 'Delete') return;

      // Word boundary: commit buffer + boundary char
      if (COMMIT_CHARS.has(key)) {
        e.preventDefault();
        const commitChar = key === 'Enter' ? '\n' : ' ';
        setCommitted(c => c + transliterate(romanBuffer) + commitChar);
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
    [romanBuffer],
  );

  // Paste handler — commits current buffer, then commits transliteration of
  // pasted Roman text in one atomic update (BUG-002 fix).
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text/plain');
      if (!pasted) return;
      setCommitted(c => c + transliterate(romanBuffer) + transliterate(pasted));
      setRomanBuffer('');
    },
    [romanBuffer],
  );

  const setRoman = useCallback((roman: string) => {
    setRomanBuffer(roman);
  }, []);

  const reset = useCallback(() => {
    setCommitted('');
    setRomanBuffer('');
  }, []);

  return {
    value: currentValue,
    romanBuffer,
    handleKeyDown,
    handlePaste,
    setRoman,
    reset,
  };
}

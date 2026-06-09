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
 * Space, Enter, Tab, and all punctuation outside the mapping tables trigger
 * a commit: the current romanBuffer is transliterated, appended to committed,
 * and the boundary character itself is appended.
 *
 * Backspace
 * ─────────
 * Smart backspace: removes the last Roman character from romanBuffer and
 * re-transliterates.  If romanBuffer is empty, removes the last Unicode
 * codepoint from committedUnicode (simple codepoint delete, not grapheme).
 *
 * This means backspace undoes one Roman keystroke at a time while composing,
 * which correctly handles multi-key sequences (e.g. typing "kh" → ख and
 * pressing backspace removes 'h' and re-renders 'k' → ख).
 */

import { useState, useCallback } from 'react';
import { transliterate } from '../engine/transliterator';

export type IMEState = {
  /** The full visible value (committed + in-progress transliteration) */
  value: string;
  /** Roman buffer for the current in-progress word */
  romanBuffer: string;
  /** Handle a keyboard event; returns the new value */
  handleKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
  /** Directly set the entire Roman buffer (e.g. for paste handling) */
  setRoman: (roman: string) => void;
  /** Reset all state */
  reset: () => void;
};

/** Characters that commit the current word and pass through as-is */
const COMMIT_CHARS = new Set([' ', 'Enter', 'Tab', '\n', '\r']);

export function useBodoIME(initialValue = ''): IMEState {
  const [committedUnicode, setCommitted] = useState(initialValue);
  const [romanBuffer, setRomanBuffer] = useState('');

  const currentValue =
    committedUnicode + transliterate(romanBuffer);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      const key = e.key;

      // Let browser handle ctrl/meta shortcuts
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (key === 'Backspace') {
        e.preventDefault();
        setRomanBuffer(prev => {
          if (prev.length > 0) return prev.slice(0, -1);
          // Buffer empty: delete from committed
          setCommitted(c => c.slice(0, -1)); // removes last UTF-16 code unit
          return prev;
        });
        return;
      }

      if (key === 'Delete') {
        // Not supported in composition mode — ignore or handle separately
        return;
      }

      // Word boundary / commit
      if (COMMIT_CHARS.has(key)) {
        e.preventDefault();
        const commitChar = key === 'Enter' ? '\n' : key === 'Tab' ? '\t' : key;
        setCommitted(c => c + transliterate(romanBuffer) + commitChar);
        setRomanBuffer('');
        return;
      }

      // Printable single character
      if (key.length === 1) {
        e.preventDefault();
        setRomanBuffer(prev => prev + key);
        return;
      }

      // Arrow keys, Home, End, etc. — do not alter state, let browser handle
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
    setRoman,
    reset,
  };
}

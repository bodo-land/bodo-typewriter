/**
 * Owns the live editing session (paragraph + romanParagraph + the composing
 * buffer via useBodoIME) plus up to MAX_HISTORY archived sessions —
 * shared between the Sidebar (browse/restore/new) and EditorPanel (edit).
 *
 * The live session autosaves continuously; startNewSession archives it into
 * history and starts a blank one. restoreSession swaps a history entry back
 * in and parks whatever was current in its place, so switching between
 * sessions never silently discards work.
 */

import { useCallback, useEffect, useState } from 'react';
import { useBodoIME, type IMEState } from './useBodoIME';
import {
  type Session,
  MAX_HISTORY,
  isEmptySession,
  loadCurrentSession,
  saveCurrentSession,
  loadHistory,
  saveHistory,
  newSessionId,
} from '../utils/sessionStorage';

export type SessionManager = {
  ime: IMEState;
  paragraph: string;
  romanParagraph: string;
  setParagraph: (value: string) => void;
  setRomanParagraph: (value: string) => void;
  history: Session[];
  startNewSession: () => void;
  restoreSession: (id: string) => void;
  resetAll: () => void;
};

export function useSessionManager(): SessionManager {
  // Read once, synchronously, on first render — like any other useState
  // initializer — rather than hydrating via an effect.
  const [savedSession] = useState(() => loadCurrentSession());

  const [paragraph, setParagraph] = useState(() => savedSession?.paragraph ?? '');
  const [romanParagraph, setRomanParagraph] = useState(() => savedSession?.romanParagraph ?? '');
  const ime = useBodoIME({
    initialRoman: savedSession?.romanBuffer,
    onCommit: (unicodeText, romanText) => {
      setParagraph(p => p + unicodeText);
      setRomanParagraph(p => p + romanText);
    },
  });

  const [history, setHistory] = useState<Session[]>(() => loadHistory());

  useEffect(() => {
    const t = setTimeout(() => {
      saveCurrentSession({
        id: 'current',
        paragraph,
        romanParagraph,
        romanBuffer: ime.romanBuffer,
        savedAt: Date.now(),
      });
    }, 400);
    return () => clearTimeout(t);
  }, [paragraph, romanParagraph, ime.romanBuffer]);

  const resetAll = useCallback(() => {
    ime.reset();
    setParagraph('');
    setRomanParagraph('');
  }, [ime]);

  const startNewSession = useCallback(() => {
    const snapshot: Session = {
      id: newSessionId(),
      paragraph,
      romanParagraph,
      romanBuffer: ime.romanBuffer,
      savedAt: Date.now(),
    };
    if (!isEmptySession(snapshot)) {
      const next = [snapshot, ...history].slice(0, MAX_HISTORY);
      setHistory(next);
      saveHistory(next);
    }
    ime.reset();
    setParagraph('');
    setRomanParagraph('');
    saveCurrentSession({ id: 'current', paragraph: '', romanParagraph: '', romanBuffer: '', savedAt: Date.now() });
  }, [paragraph, romanParagraph, ime, history]);

  const restoreSession = useCallback((id: string) => {
    const target = history.find(sess => sess.id === id);
    if (!target) return;

    const snapshot: Session = {
      id: newSessionId(),
      paragraph,
      romanParagraph,
      romanBuffer: ime.romanBuffer,
      savedAt: Date.now(),
    };
    const withoutTarget = history.filter(sess => sess.id !== id);
    const next = isEmptySession(snapshot) ? withoutTarget : [snapshot, ...withoutTarget].slice(0, MAX_HISTORY);
    setHistory(next);
    saveHistory(next);

    setParagraph(target.paragraph);
    setRomanParagraph(target.romanParagraph);
    ime.setRoman(target.romanBuffer);
    saveCurrentSession({ ...target, id: 'current', savedAt: Date.now() });
  }, [paragraph, romanParagraph, ime, history]);

  return {
    ime,
    paragraph,
    romanParagraph,
    setParagraph,
    setRomanParagraph,
    history,
    startNewSession,
    restoreSession,
    resetAll,
  };
}

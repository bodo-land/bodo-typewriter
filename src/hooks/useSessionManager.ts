/**
 * Owns the live editing session (paragraph + romanParagraph + the composing
 * buffer via useBodoIME) plus up to MAX_HISTORY archived sessions —
 * shared between the Sidebar (browse/restore/new/delete) and EditorPanel
 * (edit).
 *
 * The live session autosaves continuously (justSaved flashes briefly after
 * each save, for the UI to show a "Saved" indicator). startNewSession
 * archives it into history and starts a blank one — this is also what
 * backs the "Clear" buttons in EditorPanel, so clearing is never a
 * destructive dead end. restoreSession swaps a history entry back in and
 * parks whatever was current in its place, so switching between sessions
 * never silently discards work either. Titles are optional and travel
 * with a session through archive/restore, same as its text.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
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
  /** User-given name for the current session, or '' for untitled. */
  currentTitle: string;
  renameCurrentSession: (title: string) => void;
  history: Session[];
  /** Renames an archived session by id. */
  renameSession: (id: string, title: string) => void;
  /** Briefly true right after a save completes (auto or manual) — drives a "Saved" indicator. */
  justSaved: boolean;
  /** Saves the current session to localStorage immediately, skipping the autosave debounce. */
  saveNow: () => void;
  startNewSession: () => void;
  /** Wipes the current session outright — unlike startNewSession, it is NOT archived into history first. */
  deleteCurrentSession: () => void;
  restoreSession: (id: string) => void;
  deleteSession: (id: string) => void;
};

export function useSessionManager(): SessionManager {
  // Read once, synchronously, on first render — like any other useState
  // initializer — rather than hydrating via an effect.
  const [savedSession] = useState(() => loadCurrentSession());

  const [paragraph, setParagraph] = useState(() => savedSession?.paragraph ?? '');
  const [romanParagraph, setRomanParagraph] = useState(() => savedSession?.romanParagraph ?? '');
  const [currentTitle, setCurrentTitle] = useState(() => savedSession?.title ?? '');
  const ime = useBodoIME({
    initialRoman: savedSession?.romanBuffer,
    onCommit: (unicodeText, romanText) => {
      setParagraph(p => p + unicodeText);
      setRomanParagraph(p => p + romanText);
    },
  });

  const [history, setHistory] = useState<Session[]>(() => loadHistory());
  const [justSaved, setJustSaved] = useState(false);
  // True only for this effect's very first run (the mount itself) — nothing
  // has changed yet at that point, so there's nothing new to save or flash.
  const mounted = useRef(false);
  const flashTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistNow = useCallback(() => {
    saveCurrentSession({
      id: 'current',
      paragraph,
      romanParagraph,
      romanBuffer: ime.romanBuffer,
      savedAt: Date.now(),
      title: currentTitle || undefined,
    });
    setJustSaved(true);
    if (flashTimeout.current) clearTimeout(flashTimeout.current);
    flashTimeout.current = setTimeout(() => setJustSaved(false), 1500);
  }, [paragraph, romanParagraph, ime.romanBuffer, currentTitle]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    const saveTimeout = setTimeout(persistNow, 400);

    return () => {
      clearTimeout(saveTimeout);
      if (flashTimeout.current) clearTimeout(flashTimeout.current);
    };
  }, [persistNow]);

  const startNewSession = useCallback(() => {
    const snapshot: Session = {
      id: newSessionId(),
      paragraph,
      romanParagraph,
      romanBuffer: ime.romanBuffer,
      savedAt: Date.now(),
      title: currentTitle || undefined,
    };
    if (!isEmptySession(snapshot)) {
      const next = [snapshot, ...history].slice(0, MAX_HISTORY);
      setHistory(next);
      saveHistory(next);
    }
    ime.reset();
    setParagraph('');
    setRomanParagraph('');
    setCurrentTitle('');
    saveCurrentSession({ id: 'current', paragraph: '', romanParagraph: '', romanBuffer: '', savedAt: Date.now() });
  }, [paragraph, romanParagraph, ime, history, currentTitle]);

  const deleteCurrentSession = useCallback(() => {
    ime.reset();
    setParagraph('');
    setRomanParagraph('');
    setCurrentTitle('');
    saveCurrentSession({ id: 'current', paragraph: '', romanParagraph: '', romanBuffer: '', savedAt: Date.now() });
  }, [ime]);

  const restoreSession = useCallback((id: string) => {
    const target = history.find(sess => sess.id === id);
    if (!target) return;

    const snapshot: Session = {
      id: newSessionId(),
      paragraph,
      romanParagraph,
      romanBuffer: ime.romanBuffer,
      savedAt: Date.now(),
      title: currentTitle || undefined,
    };
    const withoutTarget = history.filter(sess => sess.id !== id);
    const next = isEmptySession(snapshot) ? withoutTarget : [snapshot, ...withoutTarget].slice(0, MAX_HISTORY);
    setHistory(next);
    saveHistory(next);

    setParagraph(target.paragraph);
    setRomanParagraph(target.romanParagraph);
    setCurrentTitle(target.title ?? '');
    ime.setRoman(target.romanBuffer);
    saveCurrentSession({ ...target, id: 'current', savedAt: Date.now() });
  }, [paragraph, romanParagraph, ime, history, currentTitle]);

  const deleteSession = useCallback((id: string) => {
    const next = history.filter(sess => sess.id !== id);
    setHistory(next);
    saveHistory(next);
  }, [history]);

  const renameSession = useCallback((id: string, title: string) => {
    setHistory(prev => {
      const next = prev.map(sess => (sess.id === id ? { ...sess, title: title || undefined } : sess));
      saveHistory(next);
      return next;
    });
  }, []);

  return {
    ime,
    paragraph,
    romanParagraph,
    setParagraph,
    setRomanParagraph,
    currentTitle,
    renameCurrentSession: setCurrentTitle,
    history,
    renameSession,
    justSaved,
    saveNow: persistNow,
    startNewSession,
    deleteCurrentSession,
    restoreSession,
    deleteSession,
  };
}

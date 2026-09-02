import { useState, useCallback, useEffect, useRef } from 'react';
import { useBodoIME } from '../hooks/useBodoIME';
import { transliterate } from '../engine/transliterator';
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
import { GH, s } from '../styles/theme';
import { Btn, CopyBtn } from './Btn';
import { Key } from './Key';
import { StatusDot } from './StatusDot';
import { HistoryItem } from './HistoryItem';
import { IcoCheck, IcoBook, IcoTrash } from './icons';

export function EditorPanel({ imeActive, onToggleIme }: { imeActive: boolean; onToggleIme: () => void }) {
  // Read once, synchronously, on first render — like any other useState
  // initializer — rather than hydrating via an effect (which would cause
  // an extra render and a discouraged setState-in-effect call).
  const [savedSession] = useState(() => loadCurrentSession());

  // `paragraph` / `romanParagraph` hold every word already committed, in
  // Devanagari and raw Roman form respectively — both fully independent of
  // the composing buffer below and of each other. Backspace only ever
  // reaches into either one when that textarea itself has focus (native
  // textarea behaviour).
  const [paragraph, setParagraph] = useState(() => savedSession?.paragraph ?? '');
  const [romanParagraph, setRomanParagraph] = useState(() => savedSession?.romanParagraph ?? '');
  const ime = useBodoIME({
    initialRoman: savedSession?.romanBuffer,
    onCommit: (unicodeText, romanText) => {
      setParagraph(p => p + unicodeText);
      setRomanParagraph(p => p + romanText);
    },
  });
  const [focused, setFocused] = useState(false);
  const [plainRoman, setPlainRoman] = useState('');

  // ── Session persistence (localStorage) ──────────────────────────────────
  // The live session autosaves continuously; "New Session" archives it into
  // history (capped at MAX_HISTORY) and starts a blank one. Restoring a
  // history entry swaps it back in and parks whatever was current in its
  // place, so switching between sessions never silently discards work.
  const [history, setHistory] = useState<Session[]>(() => loadHistory());
  const [historyOpen, setHistoryOpen] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

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

  // Close the history dropdown on an outside click.
  useEffect(() => {
    if (!historyOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setHistoryOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [historyOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // F9 toggles IME — update the shared state in App (UI-007 fix).
      if (e.key === 'F9') { e.preventDefault(); onToggleIme(); return; }
      if (imeActive) ime.handleKeyDown(e);
    },
    [ime, imeActive, onToggleIme],
  );

  const resetAll = useCallback(() => {
    ime.reset();
    setParagraph('');
    setRomanParagraph('');
    setPlainRoman('');
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
    setHistoryOpen(false);
  }, [paragraph, romanParagraph, ime, history]);

  const restoreSession = useCallback((id: string) => {
    const target = history.find(s => s.id === id);
    if (!target) return;

    const snapshot: Session = {
      id: newSessionId(),
      paragraph,
      romanParagraph,
      romanBuffer: ime.romanBuffer,
      savedAt: Date.now(),
    };
    const withoutTarget = history.filter(s => s.id !== id);
    const next = isEmptySession(snapshot) ? withoutTarget : [snapshot, ...withoutTarget].slice(0, MAX_HISTORY);
    setHistory(next);
    saveHistory(next);

    setParagraph(target.paragraph);
    setRomanParagraph(target.romanParagraph);
    ime.setRoman(target.romanBuffer);
    saveCurrentSession({ ...target, id: 'current', savedAt: Date.now() });

    setHistoryOpen(false);
  }, [paragraph, romanParagraph, ime, history]);

  const charCount = [...paragraph].length;
  const lineCount = paragraph ? paragraph.split('\n').length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, minHeight: 0 }}>

      {/* ── Session toolbar ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexShrink: 0 }}>
        <Btn variant="secondary" onClick={startNewSession} title="Archive the current session and start a blank one">
          <IcoCheck /> New session
        </Btn>
        <div ref={historyRef} style={{ position: 'relative' }}>
          <Btn variant="secondary" onClick={() => setHistoryOpen(o => !o)} title="Browse previous sessions">
            <IcoBook /> History{history.length > 0 ? ` (${history.length})` : ''}
          </Btn>
          {historyOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              zIndex: 50,
              width: '300px',
              maxHeight: '340px',
              overflowY: 'auto',
              backgroundColor: GH.canvasSubtle,
              border: `1px solid ${GH.borderDefault}`,
              borderRadius: '6px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              padding: '6px',
            }}>
              {history.length === 0 ? (
                <div style={{ padding: '14px 10px', fontSize: 'var(--fs-13)', color: GH.fgSubtle, textAlign: 'center' }}>
                  No saved sessions yet — "New session" archives the current one here.
                </div>
              ) : (
                history.map(sess => <HistoryItem key={sess.id} session={sess} onSelect={() => restoreSession(sess.id)} />)
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Roman input ── */}
      <div style={{ flexShrink: 0 }}>
        <span style={s.sectionLabel}>Roman input</span>
        <textarea
          ref={imeActive ? ime.ref : undefined}
          rows={4}
          value={imeActive ? ime.romanBuffer : plainRoman}
          onChange={e => { if (!imeActive) setPlainRoman(e.target.value); }}
          onKeyDown={handleKeyDown}
          onPaste={imeActive ? ime.handlePaste : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={imeActive ? 'Type in Roman — e.g. bwdw → बोदो\nkhalam_dwng → खालामदों' : 'IME off — typing in English'}
          spellCheck={false}
          style={{
            ...s.textarea,
            borderColor: focused ? GH.accentFg : imeActive ? GH.borderDefault : GH.attentionFg,
            boxShadow: focused ? `0 0 0 3px ${GH.accentSubtle}` : 'none',
            transition: 'border-color 80ms, box-shadow 80ms',
          }}
          aria-label="Roman transliteration input"
        />

        {/* Composing hint */}
        {imeActive && ime.romanBuffer && (
          <div style={{
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: GH.accentSubtle,
            border: `1px solid ${GH.accentEmphasis}33`,
            animation: 'composing-fade-in 100ms ease-out',
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: 'var(--fs-11)',
              fontWeight: 600,
              color: GH.accentFg,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              flexShrink: 0,
            }}>
              <StatusDot active />
              Composing
            </span>

            <Key k={ime.romanBuffer} />

            <span style={{ color: GH.fgSubtle, fontSize: 'var(--fs-14)', flexShrink: 0 }}>→</span>

            <span style={{
              fontFamily: "'Noto Sans Devanagari', 'Mangal', serif",
              fontSize: 'var(--fs-20)',
              fontWeight: 500,
              color: GH.fgDefault,
              wordBreak: 'break-all',
            }}>
              {transliterate(ime.romanBuffer)}
              <span style={{
                display: 'inline-block',
                width: '2px',
                height: '1.1em',
                marginLeft: '2px',
                verticalAlign: 'text-bottom',
                backgroundColor: GH.accentFg,
                animation: 'composing-caret 1s step-end infinite',
              }} />
            </span>
          </div>
        )}

        {!imeActive && (
          <div style={{
            marginTop: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: 'var(--fs-14)',
            color: GH.attentionFg,
          }}>
            <span>⚠</span>
            <span>IME off — press F9 or the keyboard button to re-enable transliteration</span>
          </div>
        )}
      </div>

      {/* ── Divider ── */}
      <div style={{ ...s.divider, flexShrink: 0 }} />

      {/*
        Roman paragraph — a plain, independent textarea just like the
        Devanagari paragraph below: Backspace/typing here is native browser
        behaviour and only ever touches THIS box. It's populated by
        committed words' raw Roman form (via onCommit) but has no other
        link back to Roman input — Backspace there can never reach text
        that has landed here.
      */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', flexShrink: 0 }}>
          <span style={{ ...s.sectionLabel, marginBottom: 0, flex: 1 }}>Roman paragraph</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <CopyBtn text={romanParagraph} />
            <Btn
              variant="danger"
              onClick={resetAll}
              disabled={!paragraph && !romanParagraph && !ime.romanBuffer}
              title="Clear all text"
            >
              <IcoTrash /> Clear
            </Btn>
          </div>
        </div>

        <textarea
          value={romanParagraph}
          onChange={e => setRomanParagraph(e.target.value)}
          placeholder="Your raw Roman keystrokes accumulate here as you commit words (Space/Enter) — or type directly…"
          spellCheck={false}
          style={{
            ...s.textarea,
            flex: 1,
            minHeight: 0,
            resize: 'none',
            fontStyle: romanParagraph ? 'normal' : 'italic',
          }}
          aria-label="Roman paragraph output"
        />
      </div>

      {/* ── Divider ── */}
      <div style={{ ...s.divider, flexShrink: 0 }} />

      {/* ── Output — flexes to fill all remaining height ── */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', flexShrink: 0 }}>
          <span style={{ ...s.sectionLabel, marginBottom: 0, flex: 1 }}>Devanagari paragraph</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <CopyBtn text={paragraph} />
            <Btn
              variant="danger"
              onClick={resetAll}
              disabled={!paragraph && !romanParagraph && !ime.romanBuffer}
              title="Clear all text"
            >
              <IcoTrash /> Clear
            </Btn>
          </div>
        </div>

        {/*
          A plain, independent textarea: Backspace/typing here is native
          browser behaviour and only ever touches THIS box. It is populated
          by committed words from Roman input (via onCommit) but has no
          other link back to it — Backspace in Roman input can never reach
          text that has landed here.
        */}
        <textarea
          value={paragraph}
          onChange={e => setParagraph(e.target.value)}
          placeholder="Output appears here as you commit words (Space/Enter) — or type directly…"
          spellCheck={false}
          style={{
            ...s.output,
            width: '100%',
            flex: 1,
            minHeight: 0,
            resize: 'none',
            outline: 'none',
            boxSizing: 'border-box',
            fontStyle: paragraph ? 'normal' : 'italic',
          }}
          aria-label="Devanagari paragraph output"
        />
      </div>

      {/* ── Status bar ── */}
      <div style={{
        display: 'flex',
        gap: '16px',
        fontSize: 'var(--fs-13)',
        color: GH.fgSubtle,
        flexWrap: 'wrap',
        paddingTop: '4px',
        borderTop: `1px solid ${GH.borderMuted}`,
        flexShrink: 0,
      }}>
        <span><span style={{ color: GH.fgMuted }}>{charCount}</span> chars</span>
        <span><span style={{ color: GH.fgMuted }}>{lineCount}</span> lines</span>
      </div>
    </div>
  );
}

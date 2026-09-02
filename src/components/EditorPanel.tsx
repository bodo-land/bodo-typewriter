import { useState, useCallback } from 'react';
import type { IMEState } from '../hooks/useBodoIME';
import { transliterate } from '../engine/transliterator';
import { GH, s } from '../styles/theme';
import { Btn, CopyBtn, DownloadBtn } from './Btn';
import { Key } from './Key';
import { StatusDot } from './StatusDot';
import { IcoTrash, IcoCheck, IcoX } from './icons';

const TIP_DISMISSED_KEY = 'bodo-typewriter:tip-dismissed';

export function EditorPanel({
  imeActive,
  onToggleIme,
  ime,
  paragraph,
  romanParagraph,
  setParagraph,
  setRomanParagraph,
  onClear,
  justSaved,
}: {
  imeActive: boolean;
  onToggleIme: () => void;
  ime: IMEState;
  paragraph: string;
  romanParagraph: string;
  setParagraph: (value: string) => void;
  setRomanParagraph: (value: string) => void;
  onClear: () => void;
  justSaved: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [plainRoman, setPlainRoman] = useState('');
  const [tipDismissed, setTipDismissed] = useState(() => {
    try {
      return localStorage.getItem(TIP_DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  });

  const dismissTip = useCallback(() => {
    setTipDismissed(true);
    try {
      localStorage.setItem(TIP_DISMISSED_KEY, '1');
    } catch {
      // localStorage unavailable — tip will just reappear next visit
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // F9 toggles IME — update the shared state in App (UI-007 fix).
      if (e.key === 'F9') { e.preventDefault(); onToggleIme(); return; }
      if (imeActive) ime.handleKeyDown(e);
    },
    [ime, imeActive, onToggleIme],
  );

  const handleClear = useCallback(() => {
    onClear();
    setPlainRoman('');
  }, [onClear]);

  const charCount = [...paragraph].length;
  const lineCount = paragraph ? paragraph.split('\n').length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, minHeight: 0 }}>

      {!tipDismissed && (
        <div style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          padding: '10px 12px',
          borderRadius: '6px',
          backgroundColor: GH.accentSubtle,
          border: `1px solid ${GH.accentEmphasis}33`,
          fontSize: 'var(--fs-13)',
          color: GH.fgDefault,
        }}>
          <span style={{ flex: 1 }}>
            <strong>Tip:</strong> type Roman below — each word you finish with Space/Enter
            gets added to both "Roman paragraph" and "Devanagari paragraph" underneath.
            Both boxes are freely editable on their own too.
          </span>
          <button
            onClick={dismissTip}
            aria-label="Dismiss tip"
            title="Dismiss"
            style={{
              flexShrink: 0,
              border: 'none',
              background: 'none',
              color: GH.fgMuted,
              cursor: 'pointer',
              padding: '2px',
            }}
          >
            <IcoX />
          </button>
        </div>
      )}

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
            backgroundColor: imeActive ? s.textarea.backgroundColor : `${GH.attentionFg}14`,
            borderColor: focused ? GH.accentFg : imeActive ? GH.borderDefault : GH.attentionFg,
            boxShadow: focused ? `0 0 0 3px ${GH.accentSubtle}` : 'none',
            transition: 'border-color 80ms, box-shadow 80ms, background-color 80ms',
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
            fontWeight: 600,
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
            <DownloadBtn text={romanParagraph} filename="bodo-roman.txt" title="Download as .txt" />
            <CopyBtn text={romanParagraph} />
            <Btn
              variant="danger"
              onClick={handleClear}
              disabled={!paragraph && !romanParagraph && !ime.romanBuffer}
              title="Archive this session and clear both boxes"
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
            <DownloadBtn text={paragraph} filename="bodo-devanagari.txt" title="Download as .txt" />
            <CopyBtn text={paragraph} />
            <Btn
              variant="danger"
              onClick={handleClear}
              disabled={!paragraph && !romanParagraph && !ime.romanBuffer}
              title="Archive this session and clear both boxes"
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
        alignItems: 'center',
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
        <span style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: GH.successFg,
          opacity: justSaved ? 1 : 0,
          transition: 'opacity 300ms',
        }}>
          <IcoCheck /> Saved
        </span>
      </div>
    </div>
  );
}

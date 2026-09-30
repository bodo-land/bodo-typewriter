import { useState, useCallback, useEffect, useRef } from 'react';
import type { IMEState } from '../hooks/useBodoIME';
import type { SuggestionSection } from '../utils/suggestions';
import { transliterate } from '../engine/transliterator';
import { downloadTextFile } from '../utils/download';
import { Btn, CopyBtn, ComingSoon } from './Btn';
import { LineNumberedTextarea } from './LineNumberedTextarea';
import {
  IcoCheck, IcoSave, IcoSparkles, IcoClose, IcoArrowRight, IcoRotate,
  IcoVolume, IcoDownload, IcoChevronDown,
} from './icons';

const TIP_DISMISSED_KEY = 'bodo-typewriter:tip-dismissed';
const ENGLISH_INPUT_MAX = 5000;
const DEVANAGARI_FONT = "'Noto Sans Devanagari', 'Mangal', sans-serif";

function stats(text: string): string {
  const chars = [...text].length;
  const lines = text ? text.split('\n').length : 0;
  return `${chars} characters • ${lines} line${lines === 1 ? '' : 's'}`;
}

function PanelHeader({ label, labelClass = 'text-muted', badge, children }: {
  label: string;
  labelClass?: string;
  badge?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold uppercase tracking-wider ${labelClass}`}>{label}</span>
        {badge}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

export function EditorPanel({
  imeActive,
  onToggleIme,
  ime,
  paragraph,
  englishParagraph,
  setParagraph,
  setEnglishParagraph,
  devanagariRef,
  onSave,
  justSaved,
  suggestionSections,
  onApplySuggestion,
}: {
  imeActive: boolean;
  onToggleIme: () => void;
  ime: IMEState;
  paragraph: string;
  englishParagraph: string;
  setParagraph: (value: string) => void;
  setEnglishParagraph: (value: string) => void;
  /** Lets the virtual keyboard insert at the Devanagari box's caret. */
  devanagariRef: React.Ref<HTMLTextAreaElement>;
  onSave: () => void;
  justSaved: boolean;
  suggestionSections: SuggestionSection[];
  onApplySuggestion: (segmentIndex: number, english: string) => void;
}) {
  const [plainEnglish, setPlainEnglish] = useState('');
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

  const clearInput = useCallback(() => {
    if (imeActive) ime.reset();
    else setPlainEnglish('');
  }, [ime, imeActive]);

  const englishInputValue = imeActive ? ime.englishBuffer : plainEnglish;

  // Every Did You Mean alternative (not the spelling already typed),
  // flattened into one numbered candidate row.
  const candidates = suggestionSections.flatMap(section =>
    section.groups.flatMap(group =>
      group.options
        .filter(o => !o.isCurrent)
        .map(o => ({ segmentIndex: section.segmentIndex, english: o.english, unicode: o.unicode })),
    ),
  );

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {!tipDismissed && (
        <div className="glass-panel flex items-center justify-between gap-3 rounded-2xl border border-brand/20 p-3.5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-brand/20 p-2 text-brand-fg"><IcoSparkles size={20} /></div>
            <div className="text-xs">
              <p className="font-medium text-fg">Phonetic Bodo engine</p>
              <p className="text-muted">
                Type English phonetics (e.g. <span className="font-mono text-brand-fg">bwdw</span>,{' '}
                <span className="font-mono text-brand-fg">khalamdwng</span>) and press Space or Enter to add
                the word to both paragraphs below. Both paragraphs can also be edited directly.
              </p>
            </div>
          </div>
          <button type="button" onClick={dismissTip} aria-label="Dismiss tip" title="Dismiss" className="p-1 text-muted hover:text-fg">
            <IcoClose />
          </button>
        </div>
      )}

      {/* Live composition buffer — the word being typed, its conversion, and
          the Did You Mean alternatives as clickable candidates. */}
      <div className="relative overflow-hidden rounded-xl border border-brand/30 bg-panel p-3 shadow-xl">
        <div className="mb-2 flex items-center justify-between border-b border-line pb-2 text-xs">
          <span className="flex items-center gap-2 font-medium text-fg/90">
            <span className={`h-2 w-2 rounded-full ${imeActive && ime.englishBuffer ? 'animate-pulse bg-brand' : 'bg-subtle'}`} />
            Live IME Composition Buffer
          </span>
          <span className="hidden font-mono text-[11px] text-muted sm:inline">Did You Mean candidates</span>
        </div>
        {!imeActive ? (
          <p className="py-1 text-xs font-medium text-warn">
            ⚠ IME off. Press F9 or the IME button in the header to turn transliteration back on.
          </p>
        ) : !ime.englishBuffer ? (
          <p className="py-1 text-xs text-subtle">Start typing in the English input below…</p>
        ) : (
          <div className="flex items-center gap-3" style={{ animation: 'composing-fade-in 100ms ease-out' }}>
            <div className="shrink-0 rounded border border-brand/40 bg-brand/10 px-2.5 py-1 font-mono text-sm font-semibold text-brand-fg">
              {ime.englishBuffer}
            </div>
            <span className="shrink-0 text-subtle"><IcoArrowRight /></span>
            <div className="flex items-center gap-2 overflow-x-auto py-0.5">
              <span className="whitespace-nowrap rounded bg-brand px-3 py-1 font-deva text-sm font-medium text-white shadow">
                1. {transliterate(ime.englishBuffer)}
              </span>
              {candidates.map((c, i) => (
                <button
                  key={`${c.segmentIndex}:${c.english}`}
                  type="button"
                  onClick={() => onApplySuggestion(c.segmentIndex, c.english)}
                  title={`Use "${c.english}"`}
                  className="whitespace-nowrap rounded bg-hover px-3 py-1 font-deva text-sm text-fg transition-colors hover:bg-brand hover:text-white"
                >
                  {i + 2}. {c.unicode}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* English input */}
      <div className="glass-panel flex flex-col rounded-2xl border border-line p-4 shadow-lg">
        <PanelHeader
          label="English Input"
          badge={<span className="rounded bg-hover px-2 py-0.5 font-mono text-[10px] text-muted">EN</span>}
        >
          <CopyBtn text={englishInputValue} />
          <Btn variant="danger" onClick={clearInput} disabled={!englishInputValue} title="Clear the word being typed">
            <IcoRotate size={14} /> Clear
          </Btn>
        </PanelHeader>
        <LineNumberedTextarea
          ref={imeActive ? ime.ref : undefined}
          minHeight="110px"
          value={englishInputValue}
          onChange={e => { if (!imeActive) setPlainEnglish(e.target.value); }}
          onKeyDown={handleKeyDown}
          onPaste={imeActive ? ime.handlePaste : undefined}
          placeholder={imeActive ? 'Type in English — e.g. bwdw → बोदो, khalamdwng → खालामदों' : 'IME off — typing plain English (no transliteration)'}
          spellCheck={false}
          maxLength={ENGLISH_INPUT_MAX}
          stats={`${englishInputValue.length} / ${ENGLISH_INPUT_MAX}`}
          aria-label="English transliteration input"
        />
      </div>

      {/* English paragraph — committed words' raw English keystrokes. A plain,
          independent textarea: editing here never touches the input above. */}
      <div className="glass-panel flex flex-col rounded-2xl border border-line p-4 shadow-lg">
        <PanelHeader label="English Paragraph">
          <CopyBtn text={englishParagraph} />
          <Btn onClick={() => downloadTextFile('bodo-english.txt', englishParagraph)} disabled={!englishParagraph} title="Download as .txt">
            <IcoDownload />
          </Btn>
        </PanelHeader>
        <LineNumberedTextarea
          minHeight="110px"
          value={englishParagraph}
          onChange={e => setEnglishParagraph(e.target.value)}
          placeholder="Your English keystrokes collect here as you commit words (Space/Enter), or type directly…"
          spellCheck={false}
          stats={stats(englishParagraph)}
          aria-label="English paragraph output"
        />
      </div>

      {/* Devanagari output — also a plain, independent textarea. */}
      <div className="glass-panel flex flex-col rounded-2xl border border-line p-4 shadow-lg">
        <PanelHeader
          label="Bodo Devanagari Output"
          labelClass="text-ok"
          badge={<span className="rounded border border-ok/20 bg-ok/10 px-2 py-0.5 font-deva text-[10px] text-ok">देव</span>}
        >
          <span className="flex items-center gap-1.5" title="Text-to-speech for Bodo coming soon">
            <Btn disabled><IcoVolume size={14} /> Speak</Btn>
            <ComingSoon className="hidden sm:inline-flex" />
          </span>
          <CopyBtn text={paragraph} label="Copy Bodo Text" variant="primary" />
        </PanelHeader>
        <LineNumberedTextarea
          ref={devanagariRef}
          minHeight="160px"
          value={paragraph}
          onChange={e => setParagraph(e.target.value)}
          placeholder="Output appears here as you commit words (Space/Enter), or type directly…"
          spellCheck={false}
          fontFamily={DEVANAGARI_FONT}
          fontSize="var(--fs-20)"
          lineHeight="1.8"
          aria-label="Devanagari paragraph output"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSave}
              title="Save current session now"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:brightness-110"
            >
              <IcoSave /> Save Session
            </button>
            <ExportMenu paragraph={paragraph} />
            <span className={`flex items-center gap-1 text-xs text-ok transition-opacity duration-300 ${justSaved ? 'opacity-100' : 'opacity-0'}`}>
              <IcoCheck /> Saved
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-subtle">
            <span>{stats(paragraph)}</span>
            <span className="rounded bg-hover px-2 py-0.5 text-muted">UTF-8</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Export dropdown — .txt is real; Word and PDF are placeholders for now. */
function ExportMenu({ paragraph }: { paragraph: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-xl bg-hover px-3 py-2 text-xs font-medium text-fg transition-all hover:brightness-125"
      >
        <IcoDownload /> Export <IcoChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 z-20 mb-1 w-48 rounded-xl border border-line bg-panel p-1 shadow-xl">
          <button
            type="button"
            disabled={!paragraph}
            onClick={() => { downloadTextFile('bodo-devanagari.txt', paragraph); setOpen(false); }}
            className="w-full rounded-lg px-3 py-1.5 text-left text-xs text-fg hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            Text (.txt)
          </button>
          <div className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs text-subtle" aria-disabled="true">
            Word (.docx) <ComingSoon />
          </div>
          <div className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs text-subtle" aria-disabled="true">
            PDF <ComingSoon />
          </div>
        </div>
      )}
    </div>
  );
}

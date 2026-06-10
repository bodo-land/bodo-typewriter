import { useState, useCallback, useRef } from 'react';
import { useBodoIME } from './hooks/useBodoIME';
import { transliterate } from './engine/transliterator';
import './App.css';

// ─── GitHub design tokens ─────────────────────────────────────────────────────
// Sourced from github.com/primer/primitives dark-mode tokens.
const GH = {
  canvasDefault:  '#0d1117',
  canvasSubtle:   '#161b22',
  canvasInset:    '#010409',
  borderDefault:  '#30363d',
  borderMuted:    '#21262d',
  fgDefault:      '#e6edf3',
  fgMuted:        '#7d8590',
  fgSubtle:       '#6e7681',
  accentFg:       '#2f81f7',
  accentEmphasis: '#1f6feb',
  accentSubtle:   '#121d2f',
  successFg:      '#3fb950',
  successSubtle:  '#0f2d1a',
  attentionFg:    '#d29922',
  dangerFg:       '#f85149',
  dangerSubtle:   '#2d0f0e',
} as const;

// ─── Style helpers ────────────────────────────────────────────────────────────

const s = {
  page: {
    minHeight: '100vh',
    backgroundColor: GH.canvasDefault,
    color: GH.fgDefault,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif",
    fontSize: '16px',
    lineHeight: '1.5',
  } as React.CSSProperties,

  header: {
    backgroundColor: GH.canvasSubtle,
    borderBottom: `1px solid ${GH.borderDefault}`,
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    gap: '16px',
    position: 'sticky',
    top: 0,
    zIndex: 40,
  } as React.CSSProperties,

  card: (extra?: React.CSSProperties): React.CSSProperties => ({
    backgroundColor: GH.canvasSubtle,
    border: `1px solid ${GH.borderDefault}`,
    borderRadius: '6px',
    ...extra,
  }),

  textarea: {
    width: '100%',
    backgroundColor: GH.canvasDefault,
    border: `1px solid ${GH.borderDefault}`,
    borderRadius: '6px',
    color: GH.fgDefault,
    fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace',
    fontSize: '16px',
    lineHeight: '1.6',
    padding: '12px',
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
    display: 'block',
  } as React.CSSProperties,

  output: {
    backgroundColor: GH.canvasInset,
    border: `1px solid ${GH.borderDefault}`,
    borderRadius: '6px',
    color: GH.fgDefault,
    fontFamily: "'Noto Sans Devanagari', 'Mangal', serif",
    fontSize: '24px',
    lineHeight: '1.8',
    padding: '12px',
    minHeight: '80px',
    wordBreak: 'break-all',
  } as React.CSSProperties,

  btnPrimary: {
    backgroundColor: GH.accentEmphasis,
    border: '1px solid rgba(240,246,252,0.1)',
    borderRadius: '6px',
    color: '#ffffff',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '15px',
    fontWeight: 500,
    padding: '6px 16px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    lineHeight: '20px',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
  } as React.CSSProperties,

  btnSecondary: {
    backgroundColor: GH.canvasSubtle,
    border: `1px solid ${GH.borderDefault}`,
    borderRadius: '6px',
    color: GH.fgDefault,
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '15px',
    fontWeight: 500,
    padding: '6px 16px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    lineHeight: '20px',
    whiteSpace: 'nowrap',
  } as React.CSSProperties,

  btnDanger: {
    backgroundColor: 'transparent',
    border: `1px solid ${GH.borderDefault}`,
    borderRadius: '6px',
    color: GH.dangerFg,
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '15px',
    fontWeight: 500,
    padding: '6px 16px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    lineHeight: '20px',
    whiteSpace: 'nowrap',
  } as React.CSSProperties,

  label: (color: string = GH.fgMuted, bg: string = 'transparent', border: string = GH.borderDefault): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '0 8px',
    height: '22px',
    fontSize: '13px',
    fontWeight: 500,
    borderRadius: '20px',
    color,
    backgroundColor: bg,
    border: `1px solid ${border}`,
    whiteSpace: 'nowrap',
  }),

  divider: {
    borderTop: `1px solid ${GH.borderMuted}`,
    margin: '16px 0',
  } as React.CSSProperties,

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  } as React.CSSProperties,

  th: {
    padding: '8px 12px',
    textAlign: 'left',
    color: GH.fgMuted,
    fontWeight: 600,
    borderBottom: `1px solid ${GH.borderMuted}`,
    backgroundColor: GH.canvasSubtle,
    position: 'sticky',
    top: 0,
  } as React.CSSProperties,

  td: {
    padding: '8px 12px',
    borderBottom: `1px solid ${GH.borderMuted}`,
    verticalAlign: 'top',
  } as React.CSSProperties,

  code: {
    fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace',
    fontSize: '13px',
    backgroundColor: GH.canvasDefault,
    border: `1px solid ${GH.borderMuted}`,
    borderRadius: '3px',
    padding: '1px 5px',
    color: GH.fgDefault,
  } as React.CSSProperties,

  sectionLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: GH.fgMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px',
    display: 'block',
  } as React.CSSProperties,

  h2: {
    fontSize: '18px',
    fontWeight: 600,
    color: GH.fgDefault,
    margin: 0,
  } as React.CSSProperties,
};

// ─── Reference data ───────────────────────────────────────────────────────────

const VOWEL_REF = [
  { keys: ['o'],        output: 'अ',  label: 'Short a (schwa / inherent)' },
  { keys: ['a', 'A'],   output: 'आ',  label: 'Long aa' },
  { keys: ['i'],        output: 'इ',  label: 'Short i' },
  { keys: ['ee'],       output: 'ई',  label: 'Long ii' },
  { keys: ['u'],        output: 'उ',  label: 'Short u' },
  { keys: ['oo'],       output: 'ऊ',  label: 'Long uu' },
  { keys: ['e'],        output: 'ए',  label: 'Vowel e' },
  { keys: ['wi', 'ai'], output: 'ऐ',  label: 'Vowel ai / oi' },
  { keys: ['w'],        output: 'ओ',  label: 'Vowel o' },
  { keys: ['wo', 'ou'], output: 'औ',  label: 'Vowel au / ou' },
  { keys: ['ng', 'M'],  output: 'ं',  label: 'Anusvara (nasal diacritic)' },
  { keys: ['oM'],       output: 'अं', label: 'Nasal short-a' },
  { keys: ['H'],        output: 'ः',  label: 'Visarga' },
];

const CONSONANT_REF = [
  { keys: ['k', 'kh'],     output: 'ख', label: 'Kha (aspirated default)' },
  { keys: ['g'],            output: 'ग', label: 'Ga' },
  { keys: ['gh'],           output: 'घ', label: 'Gha' },
  { keys: ['NG'],           output: 'ङ', label: 'Nga (velar nasal)' },
  { keys: ['c'],            output: 'च', label: 'Cha' },
  { keys: ['C', 'ch'],      output: 'छ', label: 'Chha (aspirated)' },
  { keys: ['j'],            output: 'ज', label: 'Ja' },
  { keys: ['jh', 'J'],      output: 'झ', label: 'Jha' },
  { keys: ['NY'],           output: 'ञ', label: 'Nya (palatal nasal)' },
  { keys: ['T'],            output: 'ट', label: 'Ta (retroflex)' },
  { keys: ['Th'],           output: 'ठ', label: 'Tha (retroflex asp.)' },
  { keys: ['D'],            output: 'ड', label: 'Da (retroflex)' },
  { keys: ['Dh'],           output: 'ढ', label: 'Dha (retroflex asp.)' },
  { keys: ['N'],            output: 'ण', label: 'Na (retroflex nasal)' },
  { keys: ['t', 'th'],      output: 'थ', label: 'Tha (dental aspirated)' },
  { keys: ['d'],            output: 'द', label: 'Da (dental)' },
  { keys: ['dh'],           output: 'ध', label: 'Dha (dental asp.)' },
  { keys: ['n'],            output: 'न', label: 'Na (dental)' },
  { keys: ['p', 'ph', 'f'], output: 'फ', label: 'Pha (aspirated default)' },
  { keys: ['b'],            output: 'ब', label: 'Ba' },
  { keys: ['bh', 'B'],      output: 'भ', label: 'Bha' },
  { keys: ['m'],            output: 'म', label: 'Ma' },
  { keys: ['y', 'I'],       output: 'य', label: 'Ya (capital I = ya)' },
  { keys: ['r'],            output: 'र', label: 'Ra' },
  { keys: ['l'],            output: 'ल', label: 'La' },
  { keys: ['O'],            output: 'व', label: 'Va/Wa (capital O)' },
  { keys: ['S', 'sh'],      output: 'श', label: 'Sha' },
  { keys: ['x'],            output: 'ष', label: 'Ssa (retroflex sibilant)' },
  { keys: ['s'],            output: 'स', label: 'Sa' },
  { keys: ['h'],            output: 'ह', label: 'Ha' },
];

const SPECIAL_REF = [
  { keys: ['|'],    output: '।',  label: 'Danda (sentence full stop)' },
  { keys: ['||'],   output: '॥',  label: 'Double danda' },
  { keys: ['.a'],   output: 'ऽ',  label: 'Avagraha' },
  { keys: ["'"],    output: 'ʼ',  label: 'Glottal apostrophe' },
  { keys: ['OM'],   output: 'ॐ',  label: 'Om' },
  { keys: ['Rs'],   output: '₹',  label: 'Rupee sign' },
];

const EXAMPLES = [
  { roman: 'bwdw',     devanagari: 'बोदो',      meaning: 'Bodo (the language)' },
  { roman: 'khwn',     devanagari: 'खोन',       meaning: 'Ear' },
  { roman: 'gonga',    devanagari: 'गंगा',      meaning: 'Ganga (river)' },
  { roman: 'bwdwland', devanagari: 'बोदोलान्ड', meaning: 'Bodoland' },
  { roman: 'sang',     devanagari: 'सां',       meaning: 'With (nasal)' },
  { roman: 'OM',       devanagari: 'ॐ',         meaning: 'Om' },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

function IcoCopy() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/></svg>;
}

function IcoCheck() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/></svg>;
}

function IcoTrash() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z"/></svg>;
}

function IcoKeyboard() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M0 4.75C0 3.784.784 3 1.75 3h12.5c.966 0 1.75.784 1.75 1.75v6.5A1.75 1.75 0 0 1 14.25 13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v6.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-6.5a.25.25 0 0 0-.25-.25ZM2 7h1v1H2Zm3 0h1v1H5Zm3 0h1v1H8Zm3 0h1v1h-1ZM5 5h1v1H5Zm3 0h1v1H8Zm3 0h1v1h-1ZM2 9h5v1H2Zm7 0h5v1H9Zm-2 0h1v1H7Z"/></svg>;
}

function IcoBook() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A3.743 3.743 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.507a2.25 2.25 0 0 0-1.591.659l-.622.621a.75.75 0 0 1-1.06 0l-.622-.621A2.25 2.25 0 0 0 5.258 13H.75a.75.75 0 0 1-.75-.75Zm7.251 10.324.004-5.073-.002-2.253A2.25 2.25 0 0 0 5.003 2.5H1.5v9h3.757a3.75 3.75 0 0 1 1.994.574ZM8.755 4.75l-.004 7.322a3.752 3.752 0 0 1 1.992-.572H14.5v-9h-3.495a2.25 2.25 0 0 0-2.25 2.25Z"/></svg>;
}

function IcoLightning() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M9.504.43a1.516 1.516 0 0 1 .437 1.688L8.218 6h4.37a1.358 1.358 0 0 1 1.087 2.172l-.639.795-.031.027-.7 1.047a1.355 1.355 0 0 1-.95.572l-3.773.34L6.457 16.3a1.353 1.353 0 0 1-1.235.7 1.359 1.359 0 0 1-1.246-.845l-.37-.95a1.358 1.358 0 0 1 .065-1.046l1.92-3.616H2.016a1.358 1.358 0 0 1-1.013-2.27L9.504.43Z"/></svg>;
}

// ─── Primitive components ─────────────────────────────────────────────────────

function Btn({
  variant = 'secondary',
  onClick,
  children,
  disabled,
  title,
}: {
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  title?: string;
}) {
  const [hover, setHover] = useState(false);

  const base = variant === 'primary' ? s.btnPrimary
             : variant === 'danger'  ? s.btnDanger
             :                         s.btnSecondary;

  const hoverOverride: Record<string, React.CSSProperties> = {
    primary:   { backgroundColor: GH.accentFg },
    secondary: { backgroundColor: '#21262d', borderColor: '#8b949e' },
    danger:    { backgroundColor: GH.dangerSubtle, borderColor: GH.dangerFg },
  };

  return (
    <button
      style={{
        ...base,
        ...(hover && !disabled ? hoverOverride[variant] : {}),
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 80ms, border-color 80ms',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={disabled ? undefined : onClick}
      title={title}
    >
      {children}
    </button>
  );
}

function CopyBtn({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Btn variant="secondary" onClick={handleCopy} disabled={!text}>
      {copied ? <IcoCheck /> : <IcoCopy />}
      {copied ? 'Copied!' : label}
    </Btn>
  );
}

function Key({ k }: { k: string }) {
  return <kbd style={s.code}>{k}</kbd>;
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span style={{
      display: 'inline-block',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: active ? GH.successFg : GH.fgSubtle,
      flexShrink: 0,
      boxShadow: active ? `0 0 0 3px ${GH.successSubtle}` : 'none',
      transition: 'background-color 150ms, box-shadow 150ms',
    }} />
  );
}

function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div style={{
      display: 'flex',
      borderBottom: `1px solid ${GH.borderDefault}`,
      overflowX: 'auto',
      gap: '0',
    }}>
      {tabs.map(tab => {
        const on = tab.id === active;
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: on ? 600 : 400,
            color: on ? GH.fgDefault : GH.fgMuted,
            background: 'none',
            border: 'none',
            borderBottom: on ? `2px solid ${GH.accentFg}` : '2px solid transparent',
            cursor: 'pointer',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
            marginBottom: '-1px',
            transition: 'color 100ms',
          }}>
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function RefTable({ rows }: { rows: { keys: string[]; output: string; label: string }[] }) {
  return (
    <table style={s.table}>
      <thead>
        <tr>
          <th style={s.th}>Keys</th>
          <th style={s.th}>Output</th>
          <th style={s.th}>Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ backgroundColor: i % 2 === 1 ? '#0d111766' : 'transparent' }}>
            <td style={s.td}>
              <span style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {row.keys.map(k => <Key key={k} k={k} />)}
              </span>
            </td>
            <td style={{
              ...s.td,
              fontFamily: "'Noto Sans Devanagari', 'Mangal', serif",
              fontSize: '18px',
              color: GH.accentFg,
            }}>
              {row.output}
            </td>
            <td style={{ ...s.td, color: GH.fgMuted }}>{row.label}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header({ imeActive, onToggleIme }: { imeActive: boolean; onToggleIme: () => void }) {
  return (
    <header style={s.header}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <span style={{
          fontFamily: "'Noto Sans Devanagari', 'Mangal', serif",
          fontSize: '20px',
          lineHeight: 1,
          color: GH.accentFg,
        }}>
          ब
        </span>
        <span style={{ fontWeight: 600, fontSize: '16px' }}>Bodo Typewriter</span>
        <span style={s.label(GH.fgSubtle, 'transparent', GH.borderMuted)}>v1.0</span>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <StatusDot active={imeActive} />
        <span style={{ fontSize: '14px', color: GH.fgMuted }}>
          IME {imeActive ? 'enabled' : 'disabled'}
        </span>
        <Btn variant="secondary" onClick={onToggleIme} title="Toggle transliteration (F9)">
          <IcoKeyboard />
          <span style={{ fontSize: '13px', color: GH.fgSubtle, marginLeft: '2px' }}>F9</span>
        </Btn>
      </div>
    </header>
  );
}

// ─── Editor panel ─────────────────────────────────────────────────────────────

function EditorPanel({ imeActive, onToggleIme }: { imeActive: boolean; onToggleIme: () => void }) {
  const ime = useBodoIME();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // F9 toggles IME — update the shared state in App (UI-007 fix).
      if (e.key === 'F9') { e.preventDefault(); onToggleIme(); return; }
      if (imeActive) ime.handleKeyDown(e);
    },
    [ime, imeActive, onToggleIme],
  );

  const charCount = [...ime.value].length;
  const lineCount = ime.value ? ime.value.split('\n').length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Roman input ── */}
      <div>
        <span style={s.sectionLabel}>Roman input</span>
        <textarea
          ref={textareaRef}
          rows={6}
          value={imeActive ? ime.romanBuffer : ime.value}
          onChange={e => { if (!imeActive) ime.setRoman(e.target.value); }}
          onKeyDown={handleKeyDown}
          onPaste={imeActive ? ime.handlePaste : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={imeActive ? 'Type in Roman — e.g. bwdw → बोदो' : 'IME off — typing in English'}
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
            marginTop: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: GH.fgMuted,
          }}>
            <span>Composing</span>
            <Key k={ime.romanBuffer} />
            <span style={{ color: GH.fgSubtle }}>→</span>
            <span style={{
              fontFamily: "'Noto Sans Devanagari', 'Mangal', serif",
              fontSize: '18px',
              color: GH.accentFg,
            }}>
              {transliterate(ime.romanBuffer)}
            </span>
          </div>
        )}

        {!imeActive && (
          <div style={{
            marginTop: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            color: GH.attentionFg,
          }}>
            <span>⚠</span>
            <span>IME off — press F9 or the keyboard button to re-enable transliteration</span>
          </div>
        )}
      </div>

      {/* ── Divider ── */}
      <div style={s.divider} />

      {/* ── Output ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ ...s.sectionLabel, marginBottom: 0, flex: 1 }}>Devanagari output</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <CopyBtn text={ime.value} />
            <Btn variant="danger" onClick={ime.reset} disabled={!ime.value} title="Clear all text">
              <IcoTrash /> Clear
            </Btn>
          </div>
        </div>

        <div
          style={{
            ...s.output,
            color: ime.value ? GH.fgDefault : GH.fgSubtle,
            fontStyle: ime.value ? 'normal' : 'italic',
          }}
          aria-label="Transliterated Devanagari output"
          aria-live="polite"
        >
          {ime.value || 'Output appears here as you type…'}
        </div>
      </div>

      {/* ── Status bar ── */}
      <div style={{
        display: 'flex',
        gap: '16px',
        fontSize: '13px',
        color: GH.fgSubtle,
        flexWrap: 'wrap',
        paddingTop: '4px',
        borderTop: `1px solid ${GH.borderMuted}`,
      }}>
        <span><span style={{ color: GH.fgMuted }}>{charCount}</span> chars</span>
        <span><span style={{ color: GH.fgMuted }}>{lineCount}</span> lines</span>
        <span style={{ marginLeft: 'auto', color: GH.fgSubtle }}>
          Pramukh IME-compatible ·{' '}
          <a
            href="https://pramukhime.com/help/bodo-typing-help"
            target="_blank"
            rel="noreferrer"
            style={{ color: GH.accentFg, textDecoration: 'none' }}
          >
            Docs ↗
          </a>
        </span>
      </div>
    </div>
  );
}

// ─── Reference panel ──────────────────────────────────────────────────────────

function ReferencePanel() {
  const [tab, setTab] = useState('vowels');

  const tabs = [
    { id: 'vowels',     label: 'Vowels',     icon: <IcoBook /> },
    { id: 'consonants', label: 'Consonants', icon: <IcoKeyboard /> },
    { id: 'special',    label: 'Special',    icon: <IcoLightning /> },
    { id: 'examples',   label: 'Examples',   icon: <IcoCheck /> },
  ];

  return (
    <div>
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <div style={{ overflowY: 'auto', maxHeight: '520px' }}>
        {tab === 'vowels' && (
          <>
            <p style={{ margin: '10px 0 8px', fontSize: '14px', color: GH.fgMuted }}>
              <Key k="o" /> is the inherent vowel (अ). After a consonant it emits no mātrā sign —
              the consonant's inherent /a/ is implied.
            </p>
            <RefTable rows={VOWEL_REF} />
          </>
        )}
        {tab === 'consonants' && (
          <>
            <p style={{ margin: '10px 0 8px', fontSize: '14px', color: GH.fgMuted }}>
              Bodo uses an <strong style={{ color: GH.fgDefault }}>aspirated-first</strong> system —
              <Key k="k" /> → ख (aspirated), not क. Note: capital <Key k="I" /> = य, <Key k="O" /> = व.
            </p>
            <RefTable rows={CONSONANT_REF} />
          </>
        )}
        {tab === 'special' && (
          <>
            <p style={{ margin: '10px 0 8px', fontSize: '14px', color: GH.fgMuted }}>
              Special characters and the <strong style={{ color: GH.fgDefault }}>ng rule</strong>:{' '}
              <Key k="ng" /> before a vowel → anusvara + ग + mātrā; before consonant/end → anusvara only.
              Two consonants with no vowel automatically insert halant (् ).
            </p>
            <RefTable rows={SPECIAL_REF} />
          </>
        )}
        {tab === 'examples' && (
          <div style={{ paddingTop: '8px' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Type</th>
                  <th style={s.th}>Output</th>
                  <th style={s.th}>Meaning</th>
                </tr>
              </thead>
              <tbody>
                {EXAMPLES.map((ex, i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 1 ? '#0d111766' : 'transparent' }}>
                    <td style={s.td}><Key k={ex.roman} /></td>
                    <td style={{
                      ...s.td,
                      fontFamily: "'Noto Sans Devanagari', 'Mangal', serif",
                      fontSize: '18px',
                      color: GH.accentFg,
                    }}>
                      {ex.devanagari}
                    </td>
                    <td style={{ ...s.td, color: GH.fgMuted }}>{ex.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shortcuts bar ────────────────────────────────────────────────────────────

function ShortcutsBar() {
  const items = [
    { key: 'F9',        label: 'Toggle IME' },
    { key: 'Space',     label: 'Commit word' },
    { key: '|',         label: 'Danda (।)' },
    { key: 'Backspace', label: 'Smart undo' },
    { key: 'ng',        label: 'Anusvara' },
    { key: 'NG',        label: 'ङ (nga)' },
  ];

  return (
    <div style={{
      ...s.card({
        padding: '10px 16px',
        display: 'flex',
        gap: '0',
        flexWrap: 'wrap',
        alignItems: 'center',
      }),
    }}>
      <span style={{
        fontSize: '13px',
        fontWeight: 600,
        color: GH.fgSubtle,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginRight: '16px',
        flexShrink: 0,
      }}>
        Shortcuts
      </span>
      {items.map((item, i) => (
        <span key={i} style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '14px',
          color: GH.fgMuted,
          marginRight: '20px',
          padding: '2px 0',
        }}>
          <Key k={item.key} />
          <span>{item.label}</span>
        </span>
      ))}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [imeActive, setImeActive] = useState(true);

  const toggleIme = useCallback(() => setImeActive(v => !v), []);

  return (
    <div style={s.page}>
      <Header imeActive={imeActive} onToggleIme={toggleIme} />

      {/* Main two-column grid */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px 16px',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)',
        gap: '16px',
        alignItems: 'start',
      }}>

        {/* Left — Transliterator */}
        <div style={s.card({ padding: '20px' })}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px',
          }}>
            <IcoKeyboard />
            <h2 style={s.h2}>Transliterator</h2>
            <div style={{ flex: 1 }} />
            <span style={s.label(GH.successFg, GH.successSubtle, 'transparent')}>
              <StatusDot active /> Live
            </span>
          </div>
          <div style={s.divider} />
          <EditorPanel imeActive={imeActive} onToggleIme={toggleIme} />
        </div>

        {/* Right — Reference */}
        <div style={s.card({ padding: '20px' })}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px',
          }}>
            <IcoBook />
            <h2 style={s.h2}>Key Reference</h2>
          </div>
          <div style={s.divider} />
          <ReferencePanel />
        </div>
      </div>

      {/* Shortcuts */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px 24px' }}>
        <ShortcutsBar />
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${GH.borderMuted}`,
        padding: '16px',
        display: 'flex',
        justifyContent: 'center',
        gap: '24px',
        fontSize: '13px',
        color: GH.fgSubtle,
        flexWrap: 'wrap',
      }}>
        <span>Bodo Typewriter</span>
        <span style={{ color: GH.borderDefault }}>·</span>
        <span>Pramukh IME-compatible</span>
        <span style={{ color: GH.borderDefault }}>·</span>
        <span>React + TypeScript + Vite</span>
        <span style={{ color: GH.borderDefault }}>·</span>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          style={{ color: GH.accentFg, textDecoration: 'none' }}
        >
          Open source ↗
        </a>
      </footer>
    </div>
  );
}

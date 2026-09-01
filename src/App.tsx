import { useState, useCallback, useRef, useEffect } from 'react';
import { useBodoIME } from './hooks/useBodoIME';
import { transliterate } from './engine/transliterator';
import './App.css';

// ─── GitHub design tokens ─────────────────────────────────────────────────────
// Values live as CSS custom properties (see index.css) so a light/dark theme
// switch is just flipping `data-theme` on <html> — every inline style below
// keeps working unchanged because these all resolve through var().
const GH = {
  canvasDefault:  'var(--gh-canvas-default)',
  canvasSubtle:   'var(--gh-canvas-subtle)',
  canvasInset:    'var(--gh-canvas-inset)',
  borderDefault:  'var(--gh-border-default)',
  borderMuted:    'var(--gh-border-muted)',
  fgDefault:      'var(--gh-fg-default)',
  fgMuted:        'var(--gh-fg-muted)',
  fgSubtle:       'var(--gh-fg-subtle)',
  accentFg:       'var(--gh-accent-fg)',
  accentEmphasis: 'var(--gh-accent-emphasis)',
  accentSubtle:   'var(--gh-accent-subtle)',
  successFg:      'var(--gh-success-fg)',
  successSubtle:  'var(--gh-success-subtle)',
  attentionFg:    'var(--gh-attention-fg)',
  dangerFg:       'var(--gh-danger-fg)',
  dangerSubtle:   'var(--gh-danger-subtle)',
  hoverBg:        'var(--gh-hover-bg)',
  hoverBorder:    'var(--gh-hover-border)',
  rowStripe:      'var(--gh-row-stripe)',
} as const;

type Theme = 'dark' | 'light';
const THEME_KEY = 'bodo-typewriter-theme';

// ─── Style helpers ────────────────────────────────────────────────────────────

const s = {
  page: {
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: GH.canvasDefault,
    color: GH.fgDefault,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif",
    fontSize: '16px',
    lineHeight: '1.5',
  } as React.CSSProperties,

  header: {
    backgroundColor: GH.canvasSubtle,
    borderBottom: `1px solid ${GH.borderDefault}`,
    height: '52px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    padding: '0 clamp(16px, 3vw, 40px)',
    gap: '16px',
    zIndex: 40,
  } as React.CSSProperties,

  mainGrid: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    maxWidth: '2000px',
    margin: '0 auto',
    padding: '20px clamp(16px, 3vw, 40px)',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)',
    gap: '20px',
    boxSizing: 'border-box',
  } as React.CSSProperties,

  panelCard: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    overflow: 'hidden',
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

// Vowels & consonants are the chart from bodo_deva.md, verbatim: Devanagari
// letter (+ dependent diacritic form for vowels), Roman transcription, IPA.
// This is a phonetic reference, not the app's typing-key scheme — see the
// "Special" tab for actual input keys.
const VOWEL_REF = [
  { output: 'अ',  diacritic: '—',  roman: 'ô',    ipa: '[o]' },
  { output: 'आ',  diacritic: 'ा',  roman: 'a',    ipa: '[a]' },
  { output: 'इ',  diacritic: 'ि',  roman: 'i',    ipa: '[i]' },
  { output: 'ई',  diacritic: 'ी',  roman: 'ī',    ipa: '[i]' },
  { output: 'उ',  diacritic: 'ु',  roman: 'u',    ipa: '[u]' },
  { output: 'ऊ',  diacritic: 'ू',  roman: 'ū',    ipa: '[u]' },
  { output: 'ऋ',  diacritic: 'ृ',  roman: 'ri',   ipa: '[ri]' },
  { output: 'ए',  diacritic: 'े',  roman: 'e',    ipa: '[e]' },
  { output: 'ऐ',  diacritic: 'ै',  roman: 'ŵi',   ipa: '[oi/ɯi]' },
  { output: 'ओ',  diacritic: 'ो',  roman: 'ŵ',    ipa: '[ɯ]' },
  { output: 'औ',  diacritic: 'ौ',  roman: 'ŵu',   ipa: '[ɯu]' },
  { output: 'ं',  diacritic: '—',  roman: 'ṅg',   ipa: '[ŋ]' },
  { output: 'ः',  diacritic: '—',  roman: 'ah',   ipa: '[h]' },
  { output: 'ँ',  diacritic: '—',  roman: 'ṅ',    ipa: '[ ̃ ]' },
];

const CONSONANT_REF = [
  { output: 'क',   roman: 'kô',     ipa: '[kɔ]' },
  { output: 'ख',   roman: 'khô',    ipa: '[kʰɔ]' },
  { output: 'ग',   roman: 'gô',     ipa: '[gɔ]' },
  { output: 'घ',   roman: 'ghô',    ipa: '[gɦɔ]' },
  { output: 'ङ',   roman: 'ṅgô',    ipa: '[ŋɔ]' },
  { output: 'च',   roman: 'cô',     ipa: '[sɔ]' },
  { output: 'छ',   roman: 'chô',    ipa: '[sʰɔ]' },
  { output: 'ज',   roman: 'zô',     ipa: '[zɔ]' },
  { output: 'ट',   roman: 'ṭô',     ipa: '[ʈɔ]' },
  { output: 'ठ',   roman: 'ṭhô',    ipa: '[ʈʰɔ]' },
  { output: 'ड',   roman: 'ḍô',     ipa: '[ɖɔ]' },
  { output: 'त',   roman: 'tô',     ipa: '[tɔ]' },
  { output: 'थ',   roman: 'thô',    ipa: '[tʰɔ]' },
  { output: 'द',   roman: 'dô',     ipa: '[dɔ]' },
  { output: 'ध',   roman: 'dhô',    ipa: '[dɦɔ]' },
  { output: 'न',   roman: 'nô',     ipa: '[nɔ]' },
  { output: 'प',   roman: 'pô',     ipa: '[pɔ]' },
  { output: 'फ',   roman: 'phô',    ipa: '[pʰɔ]' },
  { output: 'ब',   roman: 'bô',     ipa: '[bɔ]' },
  { output: 'भ',   roman: 'bhô',    ipa: '[bɦɔ]' },
  { output: 'म',   roman: 'mô',     ipa: '[mɔ]' },
  { output: 'य',   roman: 'yô',     ipa: '[jɔ]' },
  { output: 'र',   roman: 'rô',     ipa: '[rɔ]' },
  { output: 'ल',   roman: 'lô',     ipa: '[lɔ]' },
  { output: 'व',   roman: 'wô',     ipa: '[wɔ]' },
  { output: 'श',   roman: 'shô',    ipa: '[sɔ]' },
  { output: 'स',   roman: 'sô',     ipa: '[sɔ]' },
  { output: 'ह',   roman: 'hô',     ipa: '[ɦɔ]' },
  { output: 'त्',  roman: 'half t', ipa: '[t]' },
  { output: 'ड़',  roman: 'ṛô',     ipa: '[ɽɔ]' },
  { output: 'ढ़',  roman: 'ṛhô',    ipa: '[ɽʰɔ]' },
  { output: 'क्ष', roman: 'khyô',   ipa: '[kʰjɔ]' },
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

function IcoSun() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-9.5a.75.75 0 0 1-.75-.75V.25a.75.75 0 0 1 1.5 0v1.5A.75.75 0 0 1 8 2.5Zm0 13a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 1.5 0v1.5a.75.75 0 0 1-.75.75ZM2.5 8a.75.75 0 0 1-.75.75H.25a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 2.5 8Zm13 0a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 .75.75ZM3.94 3.94a.75.75 0 0 1 0 1.06L2.88 6.06a.75.75 0 1 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 0Zm9.19 9.19a.75.75 0 0 1 0 1.06l-1.06 1.06a.75.75 0 1 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 0ZM3.94 12.06a.75.75 0 0 1-1.06 0l-1.06-1.06a.75.75 0 1 1 1.06-1.06l1.06 1.06a.75.75 0 0 1 0 1.06Zm9.19-9.19a.75.75 0 0 1-1.06 0l-1.06-1.06a.75.75 0 1 1 1.06-1.06l1.06 1.06a.75.75 0 0 1 0 1.06Z"/></svg>;
}

function IcoMoon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M9.598 1.591a.75.75 0 0 1 .785-.175 7 7 0 1 1-8.967 8.967.75.75 0 0 1 .961-.96 5.5 5.5 0 0 0 7.046-7.046.75.75 0 0 1 .175-.786Zm1.616 1.945a7 7 0 0 1-7.678 7.678 5.5 5.5 0 1 0 7.678-7.678Z"/></svg>;
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
    secondary: { backgroundColor: GH.hoverBg, borderColor: GH.hoverBorder },
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
          <tr key={i} style={{ backgroundColor: i % 2 === 1 ? GH.rowStripe : 'transparent' }}>
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

// Pure phonetic-chart table (bodo_deva.md): Devanagari, optional dependent
// diacritic form, Roman transcription, IPA. No typing keys here.
function ChartTable({
  rows,
  showDiacritic = false,
}: {
  rows: { output: string; diacritic?: string; roman: string; ipa: string }[];
  showDiacritic?: boolean;
}) {
  return (
    <table style={s.table}>
      <thead>
        <tr>
          <th style={s.th}>Devanagari</th>
          {showDiacritic && <th style={s.th}>Diacritic</th>}
          <th style={s.th}>Roman</th>
          <th style={s.th}>IPA</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ backgroundColor: i % 2 === 1 ? GH.rowStripe : 'transparent' }}>
            <td style={{
              ...s.td,
              fontFamily: "'Noto Sans Devanagari', 'Mangal', serif",
              fontSize: '20px',
              color: GH.accentFg,
            }}>
              {row.output}
            </td>
            {showDiacritic && (
              <td style={{
                ...s.td,
                fontFamily: "'Noto Sans Devanagari', 'Mangal', serif",
                fontSize: '20px',
                color: GH.fgMuted,
              }}>
                {row.diacritic}
              </td>
            )}
            <td style={{ ...s.td, color: GH.fgDefault, fontStyle: 'italic' }}>{row.roman}</td>
            <td style={{ ...s.td, color: GH.fgMuted, fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>
              {row.ipa}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header({
  imeActive,
  onToggleIme,
  theme,
  onToggleTheme,
}: {
  imeActive: boolean;
  onToggleIme: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}) {
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
        <Btn
          variant="secondary"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <IcoSun /> : <IcoMoon />}
        </Btn>
      </div>
    </header>
  );
}

// ─── Panel header (shared by both cards) ───────────────────────────────────────

function PanelHeader({
  icon,
  title,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexShrink: 0 }}>
        {icon}
        <h2 style={s.h2}>{title}</h2>
        <div style={{ flex: 1 }} />
        {right}
      </div>
      <div style={{ ...s.divider, flexShrink: 0 }} />
    </>
  );
}

// ─── Editor panel ─────────────────────────────────────────────────────────────

function EditorPanel({ imeActive, onToggleIme }: { imeActive: boolean; onToggleIme: () => void }) {
  // `paragraph` holds every word already committed — fully independent of
  // the composing buffer below. Backspace only ever reaches into it when
  // the paragraph textarea itself has focus (native textarea behaviour).
  const [paragraph, setParagraph] = useState('');
  const ime = useBodoIME({
    onCommit: text => setParagraph(p => p + text),
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);
  const [plainRoman, setPlainRoman] = useState('');

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
    setPlainRoman('');
  }, [ime]);

  const charCount = [...paragraph].length;
  const lineCount = paragraph ? paragraph.split('\n').length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, minHeight: 0 }}>

      {/* ── Roman input ── */}
      <div style={{ flexShrink: 0 }}>
        <span style={s.sectionLabel}>Roman input</span>
        <textarea
          ref={textareaRef}
          rows={4}
          value={imeActive ? ime.romanBuffer : plainRoman}
          onChange={e => { if (!imeActive) setPlainRoman(e.target.value); }}
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
              fontSize: '11px',
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

            <span style={{ color: GH.fgSubtle, fontSize: '14px', flexShrink: 0 }}>→</span>

            <span style={{
              fontFamily: "'Noto Sans Devanagari', 'Mangal', serif",
              fontSize: '20px',
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
            fontSize: '14px',
            color: GH.attentionFg,
          }}>
            <span>⚠</span>
            <span>IME off — press F9 or the keyboard button to re-enable transliteration</span>
          </div>
        )}
      </div>

      {/* ── Divider ── */}
      <div style={{ ...s.divider, flexShrink: 0 }} />

      {/* ── Output — flexes to fill all remaining height ── */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', flexShrink: 0 }}>
          <span style={{ ...s.sectionLabel, marginBottom: 0, flex: 1 }}>Devanagari paragraph</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <CopyBtn text={paragraph} />
            <Btn variant="danger" onClick={resetAll} disabled={!paragraph && !ime.romanBuffer} title="Clear all text">
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
        fontSize: '13px',
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
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ flexShrink: 0 }}>
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {tab === 'vowels' && (
          <>
            <p style={{ margin: '10px 0 8px', fontSize: '14px', color: GH.fgMuted }}>
              Bodo Devanagari vowels — independent form, dependent diacritic (mātrā) form,
              Roman transcription, and IPA. Reference chart, from{' '}
              <code style={s.code}>bodo_deva.md</code>.
            </p>
            <ChartTable rows={VOWEL_REF} showDiacritic />
          </>
        )}
        {tab === 'consonants' && (
          <>
            <p style={{ margin: '10px 0 8px', fontSize: '14px', color: GH.fgMuted }}>
              Bodo Devanagari consonants — with Roman transcription and IPA. Reference chart,
              from <code style={s.code}>bodo_deva.md</code>.
            </p>
            <ChartTable rows={CONSONANT_REF} />
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
                  <tr key={i} style={{ backgroundColor: i % 2 === 1 ? GH.rowStripe : 'transparent' }}>
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

// ─── Bottom bar (shortcuts + footer, merged into one slim strip) ───────────────

function BottomBar() {
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
      flexShrink: 0,
      borderTop: `1px solid ${GH.borderMuted}`,
      backgroundColor: GH.canvasSubtle,
      padding: '10px clamp(16px, 3vw, 40px)',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flexWrap: 'wrap',
      fontSize: '13px',
    }}>
      <span style={{
        fontSize: '13px',
        fontWeight: 600,
        color: GH.fgSubtle,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        flexShrink: 0,
      }}>
        Shortcuts
      </span>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', flex: 1 }}>
        {items.map((item, i) => (
          <span key={i} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '14px',
            color: GH.fgMuted,
          }}>
            <Key k={item.key} />
            <span>{item.label}</span>
          </span>
        ))}
      </div>
      <span style={{ color: GH.fgSubtle, whiteSpace: 'nowrap' }}>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          style={{ color: GH.accentFg, textDecoration: 'none' }}
        >
          Open source ↗
        </a>
      </span>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage unavailable (private mode, etc.) — fall through
  }
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}

export default function App() {
  const [imeActive, setImeActive] = useState(true);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const toggleIme = useCallback(() => setImeActive(v => !v), []);
  const toggleTheme = useCallback(() => setTheme(t => (t === 'dark' ? 'light' : 'dark')), []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // localStorage unavailable — theme just won't persist across reloads
    }
  }, [theme]);

  return (
    <div className="app-shell" style={s.page}>
      <Header imeActive={imeActive} onToggleIme={toggleIme} theme={theme} onToggleTheme={toggleTheme} />

      {/* Fluid two-column grid — fills the full viewport width/height;
          collapses to a single scrolling column below 860px (index.css). */}
      <div className="main-grid" style={s.mainGrid}>
        <div className="panel-card" style={s.card({ ...s.panelCard, padding: '20px' })}>
          <PanelHeader
            icon={<IcoKeyboard />}
            title="Transliterator"
            right={
              <span style={s.label(GH.successFg, GH.successSubtle, 'transparent')}>
                <StatusDot active /> Live
              </span>
            }
          />
          <EditorPanel imeActive={imeActive} onToggleIme={toggleIme} />
        </div>

        <div className="panel-card" style={s.card({ ...s.panelCard, padding: '20px' })}>
          <PanelHeader icon={<IcoBook />} title="Script Reference" />
          <ReferencePanel />
        </div>
      </div>

      <BottomBar />
    </div>
  );
}

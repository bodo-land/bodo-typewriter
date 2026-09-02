import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { GH, s, THEME_KEY, type Theme } from './styles/theme';
import { useSessionManager } from './hooks/useSessionManager';
import { getSuggestionSections, applySuggestionToBuffer } from './utils/suggestions';
import { Header } from './components/Header';
import { IconRail } from './components/IconRail';
import { Sidebar } from './components/Sidebar';
import { EditorPanel } from './components/EditorPanel';
import { ReferencePanel } from './components/ReferencePanel';
import { StatusDot } from './components/StatusDot';
import { Btn } from './components/Btn';
import { IcoChat, IcoPlus, IcoTrash } from './components/icons';
import './App.css';

const REFERENCE_OPEN_KEY = 'bodo-typewriter:reference-open';

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

// Hidden by default — most typing sessions don't need the reference open,
// and it's one click away in the icon rail when it's wanted.
function getInitialReferenceOpen(): boolean {
  try {
    return localStorage.getItem(REFERENCE_OPEN_KEY) === '1';
  } catch {
    return false;
  }
}

/** Kebab menu on the Transliterator tab — New Session / Delete Current, the same real actions already available elsewhere, just one click closer. */
function TabMenu({ onNewSession, onDeleteCurrent }: { onNewSession: () => void; onDeleteCurrent: () => void }) {
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
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        title="Session actions"
        aria-label="Session actions"
        style={{
          border: 'none',
          background: 'none',
          color: GH.fgMuted,
          cursor: 'pointer',
          padding: '4px 6px',
          fontSize: 'var(--fs-16)',
          lineHeight: 1,
        }}
      >
        ⋮
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '4px',
          backgroundColor: GH.canvasSubtle,
          border: `1px solid ${GH.borderDefault}`,
          borderRadius: '6px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 20,
          minWidth: '180px',
          overflow: 'hidden',
        }}>
          <MenuItem icon={<IcoPlus />} label="New Session" onClick={() => { onNewSession(); setOpen(false); }} />
          <MenuItem icon={<IcoTrash />} label="Delete Current Session" danger onClick={() => { onDeleteCurrent(); setOpen(false); }} />
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, label, danger, onClick }: { icon: React.ReactNode; label: string; danger?: boolean; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        border: 'none',
        background: hover ? GH.hoverBg : 'none',
        color: danger ? GH.dangerFg : GH.fgDefault,
        cursor: 'pointer',
        padding: '8px 12px',
        fontSize: 'var(--fs-14)',
        textAlign: 'left',
      }}
    >
      {icon} {label}
    </button>
  );
}

export default function App() {
  const [imeActive, setImeActive] = useState(true);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [referenceOpen, setReferenceOpen] = useState(getInitialReferenceOpen);
  const [referenceTab, setReferenceTab] = useState('vowels');

  const toggleIme = useCallback(() => setImeActive(v => !v), []);
  const toggleTheme = useCallback(() => setTheme(t => (t === 'dark' ? 'light' : 'dark')), []);
  const toggleSidebar = useCallback(() => setSidebarOpen(v => !v), []);
  const toggleReference = useCallback(() => setReferenceOpen(v => !v), []);

  const session = useSessionManager();

  const suggestionSections = useMemo(
    () => getSuggestionSections(session.ime.romanBuffer),
    [session.ime.romanBuffer],
  );
  const applySuggestion = useCallback((segmentIndex: number, roman: string) => {
    session.ime.setRoman(applySuggestionToBuffer(session.ime.romanBuffer, segmentIndex, roman));
    session.ime.ref.current?.focus();
  }, [session.ime]);
  const hasSuggestions = imeActive && suggestionSections.length > 0;

  // Jump straight to "Did You Mean" the moment suggestions appear — but
  // only on that rising edge (dependency is the boolean, not the array),
  // so it doesn't keep stealing the tab back if the user switches away
  // while suggestions are still showing on later keystrokes.
  const hadSuggestions = useRef(false);
  useEffect(() => {
    if (hasSuggestions && !hadSuggestions.current) {
      setReferenceOpen(true);
      setReferenceTab('suggestions');
    }
    hadSuggestions.current = hasSuggestions;
  }, [hasSuggestions]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // localStorage unavailable — theme just won't persist across reloads
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(REFERENCE_OPEN_KEY, referenceOpen ? '1' : '0');
    } catch {
      // localStorage unavailable — preference just won't persist across reloads
    }
  }, [referenceOpen]);

  return (
    <div className="app-shell" style={s.page}>
      <Header
        imeActive={imeActive}
        onToggleIme={toggleIme}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <IconRail
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
          referenceOpen={referenceOpen}
          onToggleReference={toggleReference}
        />

        {/* Shared padded row — Sidebar, the Transliterator/RightPanel grid,
            and ConsonantKeyRail are flex siblings here so they all get the
            same outer margin and the same stretched height, keeping their
            borders and bottom edges aligned instead of each one drifting. */}
        <div style={s.contentRow}>
        {sidebarOpen && (
          <Sidebar
            history={session.history}
            currentRoman={session.romanParagraph}
            currentDevanagari={session.paragraph}
            currentTitle={session.currentTitle}
            currentSavedAt={session.currentSavedAt}
            onRenameCurrent={session.renameCurrentSession}
            onNewSession={session.startNewSession}
            onRestore={session.restoreSession}
            onDelete={session.deleteSession}
            onRename={session.renameSession}
            onDeleteCurrent={session.deleteCurrentSession}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* Fluid two-column grid — fills the remaining width/height; collapses
            to a single scrolling column below 860px (index.css), and also
            to a single column whenever the reference panel is closed. */}
        <div
          className="main-grid"
          style={{
            ...s.mainGrid,
            gridTemplateColumns: referenceOpen ? s.mainGrid.gridTemplateColumns : '1fr',
          }}
        >
          <div className="panel-card" style={s.card({ ...s.panelCard, padding: 0 })}>
            {/* Browser-tab-style header: one real tab (there's only one
                workspace today), "+" archives-and-starts-fresh the same
                way the sidebar's own New button does, and the kebab menu
                surfaces the same two actions without leaving this card. */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: `1px solid ${GH.borderDefault}`,
              padding: '0 12px',
              flexShrink: 0,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                borderBottom: `2px solid ${GH.accentFg}`,
                marginBottom: '-1px',
                fontWeight: 600,
                fontSize: 'var(--fs-15)',
              }}>
                <IcoChat /> Transliterator
              </div>
              <Btn variant="secondary" onClick={session.startNewSession} title="Archive the current session and start a blank one">
                <IcoPlus />
              </Btn>
              <div style={{ flex: 1 }} />
              <span style={{ ...s.label(GH.successFg, GH.successSubtle, 'transparent'), marginRight: '8px' }}>
                <StatusDot active /> Live
              </span>
              <TabMenu onNewSession={session.startNewSession} onDeleteCurrent={session.deleteCurrentSession} />
            </div>

            <div style={{ padding: '20px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <EditorPanel
                imeActive={imeActive}
                onToggleIme={toggleIme}
                ime={session.ime}
                paragraph={session.paragraph}
                romanParagraph={session.romanParagraph}
                setParagraph={session.setParagraph}
                setRomanParagraph={session.setRomanParagraph}
                onClear={session.startNewSession}
                onSave={session.saveNow}
                justSaved={session.justSaved}
              />
            </div>
          </div>

          {/* One unified right-hand panel — Vowels/Consonants/Special/
              Examples/Consonant Keys/Did You Mean all live as tabs inside
              ReferencePanel now, instead of each being its own card. */}
          {referenceOpen && (
            <div className="panel-card" style={s.card({ ...s.panelCard, padding: '20px' })}>
              <ReferencePanel
                tab={referenceTab}
                onTabChange={setReferenceTab}
                suggestionSections={hasSuggestions ? suggestionSections : []}
                onApplySuggestion={applySuggestion}
              />
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

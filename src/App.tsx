import { useState, useCallback, useEffect, useMemo } from 'react';
import { GH, s, THEME_KEY, type Theme } from './styles/theme';
import { useSessionManager } from './hooks/useSessionManager';
import { getSuggestionSections, applySuggestionToBuffer } from './utils/suggestions';
import { Header } from './components/Header';
import { PanelHeader } from './components/PanelHeader';
import { Sidebar } from './components/Sidebar';
import { ConsonantKeyRail } from './components/ConsonantKeyRail';
import { EditorPanel } from './components/EditorPanel';
import { ReferencePanel } from './components/ReferencePanel';
import { Suggestions } from './components/Suggestions';
import { ShortcutsBar } from './components/ShortcutsBar';
import { StatusDot } from './components/StatusDot';
import { IcoKeyboard, IcoBook, IcoLightning } from './components/icons';
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
// and it's one click away in the shortcuts bar when it's wanted.
function getInitialReferenceOpen(): boolean {
  try {
    return localStorage.getItem(REFERENCE_OPEN_KEY) === '1';
  } catch {
    return false;
  }
}

export default function App() {
  const [imeActive, setImeActive] = useState(true);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [referenceOpen, setReferenceOpen] = useState(getInitialReferenceOpen);

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
  const showSuggestions = imeActive && suggestionSections.length > 0;

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
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      <ShortcutsBar referenceOpen={referenceOpen} onToggleReference={toggleReference} />

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {sidebarOpen && (
          <Sidebar
            history={session.history}
            currentRoman={session.romanParagraph}
            currentDevanagari={session.paragraph}
            currentTitle={session.currentTitle}
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
            to a single column whenever neither Script Reference nor
            suggestions have anything to occupy the second column with. */}
        <div
          className="main-grid"
          style={{
            ...s.mainGrid,
            gridTemplateColumns: (referenceOpen || showSuggestions) ? s.mainGrid.gridTemplateColumns : '1fr',
          }}
        >
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

          {/* Suggestions take over this column, in place of Script Reference,
              whenever there's something to suggest — that's a more useful
              use of the space than the reference table while composing. */}
          {showSuggestions ? (
            <div className="panel-card" style={s.card({ ...s.panelCard, padding: '20px' })}>
              <PanelHeader icon={<IcoLightning />} title="Did You Mean?" />
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingTop: '4px' }}>
                <Suggestions sections={suggestionSections} onApply={applySuggestion} />
              </div>
            </div>
          ) : referenceOpen ? (
            <div className="panel-card" style={s.card({ ...s.panelCard, padding: '20px' })}>
              <PanelHeader icon={<IcoBook />} title="Script Reference" />
              <ReferencePanel />
            </div>
          ) : null}
        </div>

        <ConsonantKeyRail />
      </div>
    </div>
  );
}

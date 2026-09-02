import { useState, useCallback, useEffect } from 'react';
import { GH, s, THEME_KEY, type Theme } from './styles/theme';
import { useSessionManager } from './hooks/useSessionManager';
import { Header } from './components/Header';
import { PanelHeader } from './components/PanelHeader';
import { Sidebar } from './components/Sidebar';
import { EditorPanel } from './components/EditorPanel';
import { ReferencePanel } from './components/ReferencePanel';
import { ShortcutsBar } from './components/ShortcutsBar';
import { StatusDot } from './components/StatusDot';
import { IcoKeyboard, IcoBook } from './components/icons';
import './App.css';

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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleIme = useCallback(() => setImeActive(v => !v), []);
  const toggleTheme = useCallback(() => setTheme(t => (t === 'dark' ? 'light' : 'dark')), []);
  const toggleSidebar = useCallback(() => setSidebarOpen(v => !v), []);

  const session = useSessionManager();

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
      <Header
        imeActive={imeActive}
        onToggleIme={toggleIme}
        theme={theme}
        onToggleTheme={toggleTheme}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      <ShortcutsBar />

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {sidebarOpen && (
          <Sidebar
            history={session.history}
            currentRoman={session.romanParagraph}
            currentDevanagari={session.paragraph}
            onNewSession={session.startNewSession}
            onRestore={session.restoreSession}
            onDelete={session.deleteSession}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* Fluid two-column grid — fills the remaining width/height; collapses
            to a single scrolling column below 860px (index.css). */}
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
            <EditorPanel
              imeActive={imeActive}
              onToggleIme={toggleIme}
              ime={session.ime}
              paragraph={session.paragraph}
              romanParagraph={session.romanParagraph}
              setParagraph={session.setParagraph}
              setRomanParagraph={session.setRomanParagraph}
              onClear={session.startNewSession}
              justSaved={session.justSaved}
            />
          </div>

          <div className="panel-card" style={s.card({ ...s.panelCard, padding: '20px' })}>
            <PanelHeader icon={<IcoBook />} title="Script Reference" />
            <ReferencePanel />
          </div>
        </div>
      </div>
    </div>
  );
}

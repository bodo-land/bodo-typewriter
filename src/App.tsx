import { useState, useCallback, useEffect } from 'react';
import { GH, s, THEME_KEY, type Theme } from './styles/theme';
import { Header } from './components/Header';
import { PanelHeader } from './components/PanelHeader';
import { EditorPanel } from './components/EditorPanel';
import { ReferencePanel } from './components/ReferencePanel';
import { BottomBar } from './components/BottomBar';
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

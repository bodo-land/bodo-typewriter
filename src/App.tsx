import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { s, THEME_KEY, type Theme } from './styles/theme';
import { useSessionManager } from './hooks/useSessionManager';
import { getSuggestionSections, applySuggestionToBuffer } from './utils/suggestions';
import { downloadTextFile } from './utils/download';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { EditorPanel } from './components/EditorPanel';
import { AssistantPanel, type AssistantTab } from './components/AssistantPanel';
import { DocumentView, ScriptRules, ImeSettings } from './components/WorkspaceTabs';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { ShortcutsModal } from './components/ShortcutsModal';
import { IcoLanguages, IcoFileText, IcoGrid, IcoSliders, IcoKeyboardOutline, IcoPanelRight } from './components/icons';

const ASSISTANT_OPEN_KEY = 'bodo-typewriter:assistant-open';
const KEYBOARD_OPEN_KEY = 'bodo-typewriter:keyboard-open';
// Below this width the assistant panel is an overlay (index.css), so it
// starts closed there instead of covering the editor on load.
const WIDE_SCREEN = '(min-width: 1280px)';

type WorkspaceTab = 'transliterator' | 'document' | 'rules' | 'settings';

const WORKSPACE_TABS: { id: WorkspaceTab; label: string; icon: React.ReactNode }[] = [
  { id: 'transliterator', label: 'Transliterator Engine', icon: <IcoLanguages /> },
  { id: 'document', label: 'Document View', icon: <IcoFileText /> },
  { id: 'rules', label: 'Bodo Script Rules', icon: <IcoGrid /> },
  { id: 'settings', label: 'IME Settings', icon: <IcoSliders /> },
];

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

function getStoredFlag(key: string, fallback: boolean): boolean {
  try {
    const stored = localStorage.getItem(key);
    if (stored === '1') return true;
    if (stored === '0') return false;
  } catch {
    // localStorage unavailable — use the fallback
  }
  return fallback;
}

function isWideScreen(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.(WIDE_SCREEN).matches;
}

function storeFlag(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, value ? '1' : '0');
  } catch {
    // localStorage unavailable — preference just won't persist across reloads
  }
}

export default function App() {
  const [imeActive, setImeActive] = useState(true);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [sidebarOpen, setSidebarOpen] = useState(() => !window.matchMedia?.('(max-width: 860px)').matches);
  const [assistantOpen, setAssistantOpen] = useState(() => isWideScreen() && getStoredFlag(ASSISTANT_OPEN_KEY, true));
  const [assistantTab, setAssistantTab] = useState<AssistantTab>('suggestions');
  const [keyboardOpen, setKeyboardOpen] = useState(() => getStoredFlag(KEYBOARD_OPEN_KEY, false));
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('transliterator');
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const devanagariRef = useRef<HTMLTextAreaElement>(null);

  const toggleIme = useCallback(() => setImeActive(v => !v), []);
  const toggleTheme = useCallback(() => setTheme(t => (t === 'dark' ? 'light' : 'dark')), []);
  const toggleSidebar = useCallback(() => setSidebarOpen(v => !v), []);
  const closeShortcuts = useCallback(() => setShortcutsOpen(false), []);

  const session = useSessionManager();

  const handleExport = useCallback(() => {
    const json = session.exportBackup();
    const stamp = new Date().toISOString().slice(0, 10);
    downloadTextFile(`bodo-typewriter-backup-${stamp}.json`, json);
  }, [session]);

  const handleImport = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const count = session.importBackup(parsed);
        alert(count > 0 ? `Imported ${count} session${count === 1 ? '' : 's'} into history.` : 'That backup had no sessions to import.');
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Could not read that file.');
      }
    };
    reader.readAsText(file);
  }, [session]);

  // Virtual keyboard: insert at the Devanagari box's caret (or the end).
  const insertDevanagari = useCallback((text: string) => {
    const el = devanagariRef.current;
    const value = session.paragraph;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    session.setParagraph(value.slice(0, start) + text + value.slice(end));
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      el.setSelectionRange(start + text.length, start + text.length);
    });
  }, [session]);

  const suggestionSections = useMemo(
    () => getSuggestionSections(session.ime.englishBuffer),
    [session.ime.englishBuffer],
  );
  const applySuggestion = useCallback((segmentIndex: number, english: string) => {
    session.ime.setEnglish(applySuggestionToBuffer(session.ime.englishBuffer, segmentIndex, english));
    session.ime.ref.current?.focus();
  }, [session.ime]);
  const hasSuggestions = imeActive && suggestionSections.length > 0;
  const visibleSections = hasSuggestions ? suggestionSections : [];
  // "_"-delimited segment count — used below to tell "still the same word
  // the user already saw/dismissed" apart from "moved on to a new word".
  const segmentCount = session.ime.englishBuffer.split('_').length;

  // Jump straight to the assistant's Suggestions tab the moment Did You
  // Mean suggestions appear for a word the user hasn't already seen one
  // for — only on wide screens, where the panel sits beside the editor
  // (on narrow screens it's an overlay and would cover what's being
  // typed; the candidate row in the editor shows the same options there).
  // Re-triggers either on the empty→non-empty rising edge, or whenever a
  // new "_"-delimited segment starts, since suggestions can stay
  // continuously true across a "_" boundary (e.g. "thang_nai"). Refining
  // the *same* word further after a manual close intentionally does not
  // reopen it — only starting a new one does.
  const hadSuggestions = useRef(false);
  const prevSegmentCount = useRef(segmentCount);
  useEffect(() => {
    const newSegment = segmentCount !== prevSegmentCount.current;
    if (hasSuggestions && (!hadSuggestions.current || newSegment) && isWideScreen()) {
      setAssistantOpen(true);
      setAssistantTab('suggestions');
    }
    hadSuggestions.current = hasSuggestions;
    prevSegmentCount.current = segmentCount;
  }, [hasSuggestions, segmentCount]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // localStorage unavailable — theme just won't persist across reloads
    }
  }, [theme]);

  // Only a deliberate choice on a wide screen is remembered; overlay
  // open/close on narrow screens is transient.
  useEffect(() => { if (isWideScreen()) storeFlag(ASSISTANT_OPEN_KEY, assistantOpen); }, [assistantOpen]);
  useEffect(() => { storeFlag(KEYBOARD_OPEN_KEY, keyboardOpen); }, [keyboardOpen]);

  return (
    <div className="app-shell font-sans antialiased" style={s.page}>
      <Header
        imeActive={imeActive}
        onToggleIme={toggleIme}
        theme={theme}
        onToggleTheme={toggleTheme}
        onToggleSidebar={toggleSidebar}
        onShowShortcuts={() => setShortcutsOpen(true)}
      />

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {sidebarOpen && (
          <Sidebar
            history={session.history}
            currentEnglish={session.englishParagraph}
            currentDevanagari={session.paragraph}
            currentTitle={session.currentTitle}
            currentSavedAt={session.currentSavedAt}
            imeActive={imeActive}
            onRenameCurrent={session.renameCurrentSession}
            onNewSession={session.startNewSession}
            onRestore={session.restoreSession}
            onDelete={session.deleteSession}
            onRename={session.renameSession}
            onDeleteCurrent={session.deleteCurrentSession}
            onExport={handleExport}
            onImport={handleImport}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-canvas">
          <div className="flex items-center justify-between gap-2 overflow-x-auto border-b border-line bg-panel/30 px-4 lg:px-6">
            <div className="flex items-center gap-1" role="tablist">
              {WORKSPACE_TABS.map(t => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={workspaceTab === t.id}
                  onClick={() => setWorkspaceTab(t.id)}
                  className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-xs transition-all ${
                    workspaceTab === t.id
                      ? 'border-brand font-semibold text-brand-fg'
                      : 'border-transparent font-medium text-muted hover:text-fg'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex shrink-0 items-center gap-2 py-2">
              <button
                type="button"
                onClick={() => setKeyboardOpen(v => !v)}
                aria-pressed={keyboardOpen}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-all ${
                  keyboardOpen ? 'border-brand/50 bg-brand/10 text-fg' : 'border-line bg-hover/60 text-fg/80 hover:bg-hover'
                }`}
              >
                <span className="text-brand-fg"><IcoKeyboardOutline size={14} /></span>
                <span className="hidden sm:inline">Virtual Keyboard</span>
              </button>
              <button
                type="button"
                onClick={() => setAssistantOpen(v => !v)}
                aria-pressed={assistantOpen}
                title={assistantOpen ? 'Hide assistant panel' : 'Show assistant panel'}
                aria-label="Toggle assistant panel"
                className={`relative rounded-lg border p-1.5 transition-all ${
                  assistantOpen ? 'border-brand/50 bg-brand/10 text-fg' : 'border-line bg-hover/60 text-fg/80 hover:bg-hover'
                }`}
              >
                <IcoPanelRight />
                {hasSuggestions && !assistantOpen && (
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-brand" title="Suggestions available" />
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            {workspaceTab === 'transliterator' && (
              <EditorPanel
                imeActive={imeActive}
                onToggleIme={toggleIme}
                ime={session.ime}
                paragraph={session.paragraph}
                englishParagraph={session.englishParagraph}
                setParagraph={session.setParagraph}
                setEnglishParagraph={session.setEnglishParagraph}
                devanagariRef={devanagariRef}
                onSave={session.saveNow}
                justSaved={session.justSaved}
                suggestionSections={visibleSections}
                onApplySuggestion={applySuggestion}
              />
            )}
            {workspaceTab === 'document' && <DocumentView paragraph={session.paragraph} />}
            {workspaceTab === 'rules' && <ScriptRules />}
            {workspaceTab === 'settings' && <ImeSettings />}
          </div>

          {keyboardOpen && (
            <VirtualKeyboard
              onInsert={text => {
                // The Devanagari box only exists on the Transliterator tab.
                setWorkspaceTab('transliterator');
                insertDevanagari(text);
              }}
              onClose={() => setKeyboardOpen(false)}
            />
          )}
        </main>

        {assistantOpen && (
          <AssistantPanel
            tab={assistantTab}
            onTabChange={setAssistantTab}
            suggestionSections={visibleSections}
            onApplySuggestion={applySuggestion}
            onClose={() => setAssistantOpen(false)}
          />
        )}
      </div>

      {shortcutsOpen && <ShortcutsModal onClose={closeShortcuts} />}
    </div>
  );
}

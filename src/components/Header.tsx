import type { Theme } from '../styles/theme';
import { ComingSoon } from './Btn';
import { IcoPanelLeft, IcoKeyboardOutline, IcoSunOutline, IcoMoonOutline, IcoUser } from './icons';

const ICON_BTN = 'rounded-lg p-2 text-muted transition-colors hover:bg-hover hover:text-fg';

export function Header({
  imeActive,
  onToggleIme,
  theme,
  onToggleTheme,
  onToggleSidebar,
  onShowShortcuts,
}: {
  imeActive: boolean;
  onToggleIme: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  onShowShortcuts: () => void;
}) {
  return (
    // z-110 keeps the header (and its sidebar toggle) clickable above the
    // side panels when they open as overlays on narrow screens.
    <header className="relative z-[110] flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line bg-panel/80 px-4 backdrop-blur-md lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onToggleSidebar} title="Toggle session list" aria-label="Toggle session list" className={ICON_BTN}>
          <IcoPanelLeft size={20} />
        </button>
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 font-deva text-lg font-bold text-white shadow-lg shadow-indigo-500/20">
            ब
          </div>
          <div className="min-w-0">
            <span className="block truncate text-lg font-bold tracking-tight text-fg">Bodo Typewriter</span>
            <p className="hidden text-[11px] text-muted sm:block">Real-time English → Bodo Devanagari Engine</p>
          </div>
        </div>
      </div>

      <div className="hidden items-center gap-3 rounded-full border border-line bg-canvas/60 p-1.5 md:flex">
        <button
          type="button"
          onClick={onToggleIme}
          title={imeActive ? 'Turn transliteration off (F9)' : 'Turn transliteration on (F9)'}
          className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-all ${
            imeActive
              ? 'border-ok/30 bg-ok/10 text-ok'
              : 'border-line bg-hover text-muted'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${imeActive ? 'animate-pulse bg-ok' : 'bg-subtle'}`} />
          {imeActive ? 'IME Active (Phonetic Bodo)' : 'IME Off (plain English)'}
        </button>
        <span className="pr-2 text-xs text-subtle">
          Press <kbd className="rounded border border-line bg-hover px-1.5 py-0.5 font-mono text-[10px]">F9</kbd> to toggle
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        {/* Narrow screens hide the centre pill, so keep a compact toggle. */}
        <button
          type="button"
          onClick={onToggleIme}
          title={imeActive ? 'Turn transliteration off (F9)' : 'Turn transliteration on (F9)'}
          aria-label="Toggle transliteration"
          className={`rounded-full border px-2.5 py-1 text-xs font-medium md:hidden ${imeActive ? 'border-ok/30 bg-ok/10 text-ok' : 'border-line text-muted'}`}
        >
          {imeActive ? 'IME on' : 'IME off'}
        </button>
        <button type="button" onClick={onShowShortcuts} title="Keyboard shortcuts" aria-label="Keyboard shortcuts" className={ICON_BTN}>
          <IcoKeyboardOutline size={20} />
        </button>
        <button
          type="button"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-label="Toggle theme"
          className={ICON_BTN}
        >
          {theme === 'dark' ? <IcoMoonOutline size={20} /> : <IcoSunOutline size={20} />}
        </button>
        <div className="mx-1 hidden h-5 w-px bg-line sm:block" />
        {/* Accounts don't exist yet — shown greyed out, not as a fake profile. */}
        <div className="hidden items-center gap-2.5 opacity-60 sm:flex" title="Accounts coming soon" aria-disabled="true">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-hover text-muted">
            <IcoUser size={16} />
          </div>
          <div className="hidden text-left xl:block">
            <p className="text-xs font-medium leading-tight text-fg">Sign in</p>
            <ComingSoon className="mt-0.5" />
          </div>
        </div>
      </div>
    </header>
  );
}

import { GH, s, type Theme } from '../styles/theme';
import { Btn } from './Btn';
import { StatusDot } from './StatusDot';
import { IcoKeyboard, IcoSun, IcoMoon } from './icons';

export function Header({
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
          fontSize: 'var(--fs-20)',
          lineHeight: 1,
          color: GH.accentFg,
        }}>
          ब
        </span>
        <span style={{ fontWeight: 600, fontSize: 'var(--fs-16)' }}>Bodo Typewriter</span>
        <span style={s.label(GH.fgSubtle, 'transparent', GH.borderMuted)}>v1.0</span>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <StatusDot active={imeActive} />
        <span style={{ fontSize: 'var(--fs-14)', color: GH.fgMuted }}>
          IME {imeActive ? 'enabled' : 'disabled'}
        </span>
        <Btn variant="secondary" onClick={onToggleIme} title="Toggle transliteration (F9)">
          <IcoKeyboard />
          <span style={{ fontSize: 'var(--fs-13)', color: GH.fgSubtle, marginLeft: '2px' }}>F9</span>
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

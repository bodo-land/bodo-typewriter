import { GH } from '../styles/theme';
import { Key } from './Key';

// Keyboard shortcuts reference + footer link, in one slim strip pinned to
// the top of the app (right below the header) so it's always visible.
export function ShortcutsBar() {
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
      borderBottom: `1px solid ${GH.borderMuted}`,
      backgroundColor: GH.canvasSubtle,
      padding: '10px clamp(16px, 3vw, 40px)',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flexWrap: 'wrap',
      fontSize: 'var(--fs-13)',
    }}>
      <span style={{
        fontSize: 'var(--fs-13)',
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
            fontSize: 'var(--fs-14)',
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

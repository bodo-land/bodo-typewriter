import { GH } from '../styles/theme';
import { CONSONANT_KEYS } from '../data/consonantKeys';

/**
 * A slim, always-on "which key types this letter?" cheat sheet pinned to
 * the far right of the window — separate from the toggleable Script
 * Reference / suggestions column, and doesn't replace either. Only shows
 * up on very wide screens (see the "consonant-rail" CSS class) where the
 * centered main content already leaves empty margin on both sides; on
 * anything narrower it renders nothing.
 */
export function ConsonantKeyRail() {
  return (
    <div className="consonant-rail" style={{
      width: '110px',
      flexShrink: 0,
      display: 'none',
      flexDirection: 'column',
      minHeight: 0,
      padding: '16px 10px',
    }}>
      <span style={{
        fontSize: 'var(--fs-11)',
        fontWeight: 700,
        color: GH.fgMuted,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: '8px',
        flexShrink: 0,
      }}>
        Consonant Keys
      </span>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {CONSONANT_KEYS.map(({ devanagari, key }) => (
          <div
            key={devanagari}
            title={key ? `Type "${key}" for ${devanagari}` : `${devanagari} has no direct key in this engine`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '6px',
              padding: '2px 6px',
              borderRadius: '4px',
              opacity: key ? 1 : 0.4,
            }}
          >
            <span style={{
              fontFamily: "'Noto Sans Devanagari', 'Mangal', serif",
              fontSize: 'var(--fs-16)',
              color: GH.fgDefault,
            }}>
              {devanagari}
            </span>
            <kbd style={{
              fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace',
              fontSize: 'var(--fs-11)',
              color: key ? GH.accentFg : GH.fgSubtle,
            }}>
              {key ?? '—'}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}

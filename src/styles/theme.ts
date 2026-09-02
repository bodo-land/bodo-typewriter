/**
 * GitHub Primer-inspired design tokens and shared inline-style helpers.
 *
 * Color values are CSS custom properties (see index.css) so a light/dark
 * theme switch is just flipping `data-theme` on <html> — every inline
 * style built from GH below keeps working unchanged because these all
 * resolve through var(). Font sizes below are CSS vars for the same
 * reason (see index.css's min-width: 2560px media query).
 */

export const GH = {
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

export type Theme = 'dark' | 'light';
export const THEME_KEY = 'bodo-typewriter-theme';

export const s = {
  page: {
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: GH.canvasDefault,
    color: GH.fgDefault,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif",
    fontSize: 'var(--fs-16)',
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
    position: 'relative',
    // Must stay above the sidebar's mobile-overlay z-index (see index.css)
    // so its toggle button (and everything else) stays clickable while
    // the sidebar is open as a drawer on narrow screens.
    zIndex: 110,
  } as React.CSSProperties,

  // The shared padded row holding Sidebar, the Transliterator/RightPanel
  // grid, and ConsonantKeyRail as flex siblings — all three get the same
  // outer margin and the same available height (flex default align-items:
  // stretch), so their top/bottom edges line up exactly instead of each
  // one inventing its own spacing.
  contentRow: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    padding: '20px clamp(16px, 2vw, 32px)',
    display: 'flex',
    gap: '20px',
    boxSizing: 'border-box',
    minWidth: 0,
  } as React.CSSProperties,

  mainGrid: {
    // Weight 80 alongside Sidebar's 20 in contentRow — a 20/80 width split.
    flex: 80,
    minHeight: 0,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 0.6fr)',
    gap: '20px',
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
    fontSize: 'var(--fs-16)',
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
    fontSize: 'var(--fs-24)',
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
    fontSize: 'var(--fs-15)',
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
    fontSize: 'var(--fs-15)',
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
    fontSize: 'var(--fs-15)',
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
    fontSize: 'var(--fs-13)',
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
    fontSize: 'var(--fs-14)',
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
    fontSize: 'var(--fs-13)',
    backgroundColor: GH.canvasDefault,
    border: `1px solid ${GH.borderMuted}`,
    borderRadius: '3px',
    padding: '1px 5px',
    color: GH.fgDefault,
  } as React.CSSProperties,

  sectionLabel: {
    fontSize: 'var(--fs-13)',
    fontWeight: 600,
    color: GH.fgMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px',
    display: 'block',
  } as React.CSSProperties,

  h2: {
    fontSize: 'var(--fs-18)',
    fontWeight: 600,
    color: GH.fgDefault,
    margin: 0,
  } as React.CSSProperties,
};

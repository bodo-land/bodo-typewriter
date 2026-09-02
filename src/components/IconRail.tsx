import { GH } from '../styles/theme';
import { IcoChat, IcoSidebar, IcoBook, IcoFlask, IcoGear } from './icons';

/**
 * Slim vertical navigation rail, far left, below the header — a home for
 * future top-level sections as the app grows, not just a styling flourish.
 * "Editor" is the only real destination today (always active — there's
 * just one workspace); "Session History" and "Reference Panel" are real
 * toggles moved out of the header/shortcuts bar to keep them uncluttered.
 * The rest are honest coming-soon placeholders (disabled, not silently
 * inert) rather than fabricated features — same treatment as Settings.
 */
export function IconRail({
  sidebarOpen,
  onToggleSidebar,
  referenceOpen,
  onToggleReference,
}: {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  referenceOpen: boolean;
  onToggleReference: () => void;
}) {
  return (
    <div style={{
      width: '52px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 0',
      borderRight: `1px solid ${GH.borderDefault}`,
      backgroundColor: GH.canvasSubtle,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
        <RailIcon active title="Transliterator (current workspace)">
          <IcoChat />
        </RailIcon>
        <RailIcon active={sidebarOpen} onClick={onToggleSidebar} title={sidebarOpen ? 'Hide session history' : 'Show session history'}>
          <IcoSidebar />
        </RailIcon>
        <RailIcon active={referenceOpen} onClick={onToggleReference} title={referenceOpen ? 'Hide reference panel' : 'Show reference panel'}>
          <IcoBook />
        </RailIcon>
        <RailIcon disabled title="Experimental features — coming soon">
          <IcoFlask />
        </RailIcon>
      </div>

      <RailIcon disabled title="More settings coming soon">
        <IcoGear />
      </RailIcon>
    </div>
  );
}

function RailIcon({
  children,
  active,
  disabled,
  onClick,
  title,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  title: string;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      title={title}
      aria-label={title}
      aria-disabled={disabled}
      style={{
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: active ? GH.accentEmphasis : 'transparent',
        color: active ? '#ffffff' : GH.fgMuted,
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 100ms, color 100ms',
      }}
      onMouseEnter={e => { if (!active && !disabled) e.currentTarget.style.backgroundColor = GH.hoverBg; }}
      onMouseLeave={e => { if (!active && !disabled) e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      {children}
    </button>
  );
}

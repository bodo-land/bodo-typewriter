import { useEffect, useRef, useState } from 'react';
import { GH } from '../styles/theme';
import { IcoChat, IcoSidebar, IcoBook, IcoDownload, IcoUpload, IcoGear } from './icons';

/**
 * Slim vertical navigation rail, far left, below the header — a home for
 * future top-level sections as the app grows, not just a styling flourish.
 * "Editor" is the only real destination today (always active — there's
 * just one workspace); "Session History", "Reference Panel", and "Backup"
 * are real toggles/actions moved out of the header/shortcuts bar to keep
 * them uncluttered. Settings is an honest coming-soon placeholder
 * (disabled, not silently inert) rather than a fabricated feature.
 */
export function IconRail({
  sidebarOpen,
  onToggleSidebar,
  referenceOpen,
  onToggleReference,
  onExport,
  onImport,
}: {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  referenceOpen: boolean;
  onToggleReference: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
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
        <BackupMenu onExport={onExport} onImport={onImport} />
      </div>

      <RailIcon disabled title="More settings coming soon">
        <IcoGear />
      </RailIcon>
    </div>
  );
}

/** Export current+history to a file, or import one back in — the only two actions that need more than a single click, so they get a small menu instead of two separate rail icons. */
function BackupMenu({ onExport, onImport }: { onExport: () => void; onImport: (file: File) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <RailIcon onClick={() => setOpen(v => !v)} title="Backup: export or import sessions">
        <IcoDownload />
      </RailIcon>
      {open && (
        <div style={{
          position: 'absolute',
          left: '100%',
          top: 0,
          marginLeft: '4px',
          backgroundColor: GH.canvasSubtle,
          border: `1px solid ${GH.borderDefault}`,
          borderRadius: '6px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 20,
          minWidth: '200px',
          overflow: 'hidden',
        }}>
          <MenuItem
            icon={<IcoDownload />}
            label="Export all sessions"
            onClick={() => { onExport(); setOpen(false); }}
          />
          <MenuItem
            icon={<IcoUpload />}
            label="Import sessions…"
            onClick={() => { fileInputRef.current?.click(); setOpen(false); }}
          />
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) onImport(file);
          e.target.value = ''; // allow importing the same file again later
        }}
      />
    </div>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        border: 'none',
        background: hover ? GH.hoverBg : 'none',
        color: GH.fgDefault,
        cursor: 'pointer',
        padding: '8px 12px',
        fontSize: 'var(--fs-14)',
        textAlign: 'left',
        whiteSpace: 'nowrap',
      }}
    >
      {icon} {label}
    </button>
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

import { GH } from '../styles/theme';

/** Small colored dot indicating an active/inactive state (with a glow when active). */
export function StatusDot({ active }: { active: boolean }) {
  return (
    <span style={{
      display: 'inline-block',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: active ? GH.successFg : GH.fgSubtle,
      flexShrink: 0,
      boxShadow: active ? `0 0 0 3px ${GH.successSubtle}` : 'none',
      transition: 'background-color 150ms, box-shadow 150ms',
    }} />
  );
}

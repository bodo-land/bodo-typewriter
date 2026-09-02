import { s } from '../styles/theme';

/** Shared title row + divider used at the top of both main panel cards. */
export function PanelHeader({
  icon,
  title,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexShrink: 0 }}>
        {icon}
        <h2 style={s.h2}>{title}</h2>
        <div style={{ flex: 1 }} />
        {right}
      </div>
      <div style={{ ...s.divider, flexShrink: 0 }} />
    </>
  );
}

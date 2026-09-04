import { GH } from '../styles/theme';

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div style={{
      display: 'flex',
      borderBottom: `1px solid ${GH.borderDefault}`,
      gap: '0',
    }}>
      {tabs.map(tab => {
        const on = tab.id === active;
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            fontSize: 'var(--fs-14)',
            fontWeight: on ? 600 : 400,
            color: on ? GH.fgDefault : GH.fgMuted,
            background: 'none',
            border: 'none',
            borderBottom: on ? `2px solid ${GH.accentFg}` : '2px solid transparent',
            cursor: 'pointer',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
            marginBottom: '-1px',
            transition: 'color 100ms',
          }}>
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

import { useState } from 'react';
import { GH } from '../styles/theme';
import type { SuggestionSection } from '../utils/suggestions';

/**
 * "Did you mean?" rail — meant to sit in EditorPanel's vertical suggestions
 * column (to the right of Roman input, inside the Transliterator card; see
 * EditorPanel's "Roman input" row), not inline with the text. Each
 * underscore-delimited segment gets its own labeled group, stacked
 * vertically; a fresh "_" starts a new group rather than mixing
 * suggestions across independent words. Every chip shows the full
 * alternate word (not just the swapped letter), one per line — the one
 * currently typed included and highlighted, so they read as one
 * comparable list top-to-bottom instead of a wrapped horizontal row.
 * Clicking a non-current chip applies that swap to just its segment.
 */
export function Suggestions({
  sections,
  onApply,
}: {
  sections: SuggestionSection[];
  onApply: (segmentIndex: number, roman: string) => void;
}) {
  if (sections.length === 0) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      animation: 'composing-fade-in 100ms ease-out',
    }}>
      {sections.map(section => (
        <div key={section.segmentIndex} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{
            fontSize: 'var(--fs-11)',
            fontWeight: 600,
            color: GH.fgSubtle,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {sections.length > 1 ? `Did you mean (${section.segmentIndex + 1})` : 'Did you mean'}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {section.groups.map(group => (
              group.options.map(option => (
                <SuggestionChip
                  key={`${group.tokenIndex}-${option.key}`}
                  roman={option.roman}
                  unicode={option.unicode}
                  isCurrent={option.isCurrent}
                  onClick={() => onApply(section.segmentIndex, option.roman)}
                />
              ))
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SuggestionChip({
  roman,
  unicode,
  isCurrent,
  onClick,
}: {
  roman: string;
  unicode: string;
  isCurrent: boolean;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={isCurrent ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={isCurrent ? `${roman} — what you've typed` : `Switch to "${roman}"`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        width: '100%',
        padding: '5px 8px',
        borderRadius: '6px',
        border: `1px solid ${isCurrent ? GH.accentFg : hover ? GH.accentFg : GH.borderDefault}`,
        backgroundColor: isCurrent ? GH.accentSubtle : hover ? GH.accentSubtle : GH.canvasDefault,
        color: GH.fgDefault,
        fontFamily: 'inherit',
        fontSize: 'var(--fs-13)',
        textAlign: 'left',
        cursor: isCurrent ? 'default' : 'pointer',
        transition: 'background-color 80ms, border-color 80ms',
      }}
    >
      <kbd style={{
        flexShrink: 0,
        fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace',
        fontSize: 'var(--fs-11)',
        color: isCurrent ? GH.accentFg : GH.fgMuted,
        fontWeight: isCurrent ? 600 : 400,
        maxWidth: '45%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {roman}
      </kbd>
      <span style={{ color: GH.fgSubtle, flexShrink: 0 }}>→</span>
      <span style={{
        fontFamily: "'Noto Sans Devanagari', 'Mangal', serif",
        fontSize: 'var(--fs-14)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        minWidth: 0,
      }}>
        {unicode}
      </span>
    </button>
  );
}

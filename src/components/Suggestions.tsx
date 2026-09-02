import { useState } from 'react';
import { GH } from '../styles/theme';
import type { SuggestionSection } from '../utils/suggestions';

/**
 * "Did you mean?" panel shown under the composing hint whenever the current
 * word (or, for a "_"-joined chain of words, any word in it) contains an
 * easy-to-mistype key (see data/confusables.ts). Each underscore-delimited
 * segment gets its own line — a fresh "_" starts a new section rather than
 * mixing suggestions across independent words. Every chip shows the full
 * alternate word (not just the swapped letter), the one currently typed
 * included, so they read as one comparable list. Clicking a non-current
 * chip applies that swap to just its segment.
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
      marginTop: '6px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      animation: 'composing-fade-in 100ms ease-out',
    }}>
      {sections.map(section => (
        <div key={section.segmentIndex} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 'var(--fs-11)',
            fontWeight: 600,
            color: GH.fgSubtle,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            flexShrink: 0,
          }}>
            {sections.length > 1 ? `Did you mean (${section.segmentIndex + 1})` : 'Did you mean'}
          </span>
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
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 8px',
        borderRadius: '20px',
        border: `1px solid ${isCurrent ? GH.accentFg : hover ? GH.accentFg : GH.borderDefault}`,
        backgroundColor: isCurrent ? GH.accentSubtle : hover ? GH.accentSubtle : GH.canvasDefault,
        color: GH.fgDefault,
        fontFamily: 'inherit',
        fontSize: 'var(--fs-13)',
        cursor: isCurrent ? 'default' : 'pointer',
        transition: 'background-color 80ms, border-color 80ms',
      }}
    >
      <kbd style={{
        fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace',
        fontSize: 'var(--fs-11)',
        color: isCurrent ? GH.accentFg : GH.fgMuted,
        fontWeight: isCurrent ? 600 : 400,
      }}>
        {roman}
      </kbd>
      <span style={{ color: GH.fgSubtle }}>→</span>
      <span style={{ fontFamily: "'Noto Sans Devanagari', 'Mangal', serif", fontSize: 'var(--fs-14)' }}>
        {unicode}
      </span>
    </button>
  );
}

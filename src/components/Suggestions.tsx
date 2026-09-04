import { useState } from 'react';
import { GH } from '../styles/theme';
import type { SuggestionSection } from '../utils/suggestions';

/**
 * "Did you mean?" rail — meant to sit in EditorPanel's vertical suggestions
 * column (to the right of English input, inside the Transliterator card;
 * see EditorPanel's "English input" row), not inline with the text. Each
 * underscore-delimited segment gets its own labeled group, stacked
 * vertically; a fresh "_" starts a new group rather than mixing
 * suggestions across independent words. Every chip shows the full
 * alternate word (not just the swapped letter), one per line. Only the
 * *other* spellings are listed — not the one already typed, since the
 * user can already see that in the English input above and repeating it
 * back read as noise (e.g. typing "thang_nay" should offer "theng" and
 * "ney", not also echo "thang" and "nay"). Clicking a chip applies that
 * swap to just its segment.
 */
export function Suggestions({
  sections,
  onApply,
}: {
  sections: SuggestionSection[];
  onApply: (segmentIndex: number, english: string) => void;
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
              group.options.filter(option => !option.isCurrent).map(option => (
                <SuggestionChip
                  key={`${group.tokenIndex}-${option.key}`}
                  english={option.english}
                  unicode={option.unicode}
                  onClick={() => onApply(section.segmentIndex, option.english)}
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
  english,
  unicode,
  onClick,
}: {
  english: string;
  unicode: string;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={`Switch to "${english}"`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        width: '100%',
        padding: '5px 8px',
        borderRadius: '6px',
        border: `1px solid ${hover ? GH.accentFg : GH.borderDefault}`,
        backgroundColor: hover ? GH.accentSubtle : GH.canvasDefault,
        color: GH.fgDefault,
        fontFamily: 'inherit',
        fontSize: 'var(--fs-13)',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'background-color 80ms, border-color 80ms',
      }}
    >
      <kbd style={{
        flexShrink: 0,
        fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace',
        fontSize: 'var(--fs-11)',
        color: GH.fgMuted,
        maxWidth: '45%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {english}
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

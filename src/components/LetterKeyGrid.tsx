import { GH } from '../styles/theme';

export type LetterKeyItem = { devanagari: string; key: string | null };

/**
 * A flashcard-style grid: each letter as a bordered/padded cell with the
 * Devanagari glyph on top and its Roman/English key below. `groupSizes`
 * (e.g. [5,5,5,5,5,4,3,1] for the classical consonant varga rows) splits
 * `items` into separate row-groups with a visible gap between them,
 * matching how these charts are traditionally laid out; omit it to just
 * wrap everything in one flowing block.
 */
export function LetterKeyGrid({
  items,
  groupSizes,
}: {
  items: LetterKeyItem[];
  groupSizes?: number[];
}) {
  const groups: LetterKeyItem[][] = [];
  if (groupSizes) {
    let i = 0;
    for (const size of groupSizes) {
      groups.push(items.slice(i, i + size));
      i += size;
    }
  } else {
    groups.push(items);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {groups.map((group, gi) => (
        <div key={gi} style={{ display: 'flex', gap: '8px' }}>
          {group.map(({ devanagari, key }) => (
            <div
              key={devanagari}
              title={key ? `Type "${key}" for ${devanagari}` : `${devanagari} has no direct key in this engine`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                flex: '1 1 0',
                minWidth: 0,
                padding: '10px 8px',
                border: `1px solid ${GH.borderDefault}`,
                borderRadius: '6px',
                backgroundColor: GH.canvasDefault,
                opacity: key ? 1 : 0.4,
              }}
            >
              <span style={{
                fontFamily: "'Noto Sans Devanagari', 'Mangal', serif",
                fontSize: 'var(--fs-24)',
                color: GH.accentFg,
                lineHeight: 1,
              }}>
                {devanagari}
              </span>
              <kbd style={{
                fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace',
                fontSize: 'var(--fs-13)',
                color: key ? GH.fgMuted : GH.fgSubtle,
              }}>
                {key ?? '—'}
              </kbd>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

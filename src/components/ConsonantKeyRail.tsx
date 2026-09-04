import { LetterKeyGrid } from './LetterKeyGrid';
import { CONSONANT_KEYS } from '../data/consonantKeys';

// Classical varga row groupings: 5 stop-consonant rows, then the
// semivowels (4), sibilants (3), and ह alone — matches how any
// Sanskrit/Hindi/Bodo consonant chart is traditionally laid out.
const GROUP_SIZES = [5, 5, 5, 5, 5, 4, 3, 1];

/**
 * "Which key types this letter?" cheat sheet — one tab inside
 * ReferencePanel (see ReferencePanel.tsx), not a standalone card.
 */
export function ConsonantKeyRail() {
  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
      <LetterKeyGrid items={CONSONANT_KEYS} groupSizes={GROUP_SIZES} />
    </div>
  );
}

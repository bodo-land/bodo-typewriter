import { LetterKeyGrid } from './LetterKeyGrid';
import { CONSONANT_KEYS } from '../data/consonantKeys';

// 5 stop-consonant rows, then the semivowels/sibilants/ह split evenly
// across two rows of 4.
const GROUP_SIZES = [5, 5, 5, 5, 5, 4, 4];

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

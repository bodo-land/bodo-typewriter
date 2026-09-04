import { GH } from '../styles/theme';
import { Tabs } from './Tabs';
import { LetterKeyGrid } from './LetterKeyGrid';
import { ConsonantKeyRail } from './ConsonantKeyRail';
import { Suggestions } from './Suggestions';
import { IcoBook, IcoKeyboard, IcoPencil } from './icons';
import { VOWEL_REF } from '../data/referenceData';
import type { SuggestionSection } from '../utils/suggestions';

/**
 * The single right-hand panel — every reference/utility view lives here as
 * a tab, instead of each view being its own separately-shown card. Only
 * Did You Mean / Vowels / Consonants for now (Special/Examples parked,
 * not deleted — easy to re-add as more tabs.push(...) entries later).
 * Tab state is controlled by App (rather than local) so it can be
 * reset/driven from elsewhere later if needed.
 */
export function ReferencePanel({
  tab,
  onTabChange,
  suggestionSections,
  onApplySuggestion,
}: {
  tab: string;
  onTabChange: (id: string) => void;
  suggestionSections: SuggestionSection[];
  onApplySuggestion: (segmentIndex: number, english: string) => void;
}) {
  const tabs = [
    { id: 'suggestions', label: 'Did You Mean', icon: <IcoPencil /> },
    { id: 'vowels',      label: 'Vowels',       icon: <IcoBook /> },
    { id: 'consonants',  label: 'Consonants',   icon: <IcoKeyboard /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ flexShrink: 0 }}>
        <Tabs tabs={tabs} active={tab} onChange={onTabChange} />
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {tab === 'vowels' && (
          <>
            <p style={{ margin: '10px 0 8px', fontSize: 'var(--fs-14)', color: GH.fgMuted }}>
              Bodo Devanagari vowels — the English key that types each one in this engine.
            </p>
            <LetterKeyGrid
              items={VOWEL_REF.map(row => ({ devanagari: row.output, key: row.english }))}
              groupSizes={[4, 3, 4, 3]}
            />
          </>
        )}
        {tab === 'consonants' && (
          <>
            <p style={{ margin: '10px 0 8px', fontSize: 'var(--fs-14)', color: GH.fgMuted }}>
              Bodo Devanagari consonants — the English key that types each letter in this engine.
            </p>
            <ConsonantKeyRail />
          </>
        )}
        {tab === 'suggestions' && (
          suggestionSections.length > 0 ? (
            <div style={{ paddingTop: '8px' }}>
              <Suggestions sections={suggestionSections} onApply={onApplySuggestion} />
            </div>
          ) : (
            <p style={{ margin: '10px 0', fontSize: 'var(--fs-14)', color: GH.fgMuted }}>
              Nothing to suggest right now — keep typing.
            </p>
          )
        )}
      </div>
    </div>
  );
}

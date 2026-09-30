import { IcoKeyboardOutline, IcoChevronDown } from './icons';
import { CONSONANT_KEYS } from '../data/consonantKeys';

const VOWELS = ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ'];
const CONSONANTS = CONSONANT_KEYS.map(c => c.devanagari);

/**
 * Bottom drawer of Devanagari letters; clicking one inserts it at the
 * caret of the Devanagari output box. onMouseDown is prevented so the
 * click doesn't steal focus from that box.
 */
export function VirtualKeyboard({ onInsert, onClose }: { onInsert: (text: string) => void; onClose: () => void }) {
  return (
    <div className="flex shrink-0 flex-col gap-2 border-t border-line bg-panel/95 p-3 shadow-2xl">
      <div className="flex items-center justify-between px-1 text-xs">
        <span className="flex items-center gap-1.5 font-medium text-muted">
          <span className="text-brand-fg"><IcoKeyboardOutline size={14} /></span>
          Virtual Devanagari Keyboard Quick-Pad
        </span>
        <button type="button" onClick={onClose} title="Hide keyboard" aria-label="Hide keyboard" className="text-muted hover:text-fg">
          <IcoChevronDown />
        </button>
      </div>
      <div className="mx-auto grid max-h-40 w-full max-w-4xl grid-cols-6 gap-1 overflow-y-auto font-deva text-sm sm:grid-cols-10">
        {[...VOWELS, ...CONSONANTS].map(ch => (
          <button
            key={ch}
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={() => onInsert(ch)}
            className="rounded bg-hover p-2 text-fg transition-colors hover:bg-brand hover:text-white"
          >
            {ch}
          </button>
        ))}
      </div>
    </div>
  );
}

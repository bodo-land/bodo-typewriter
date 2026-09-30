import { LetterKeyGrid } from './LetterKeyGrid';
import { ConsonantKeyRail } from './ConsonantKeyRail';
import { ComingSoon } from './Btn';
import { IcoPrinter } from './icons';
import { VOWEL_REF } from '../data/referenceData';

/** Document View — the Devanagari paragraph as clean, printable text. */
export function DocumentView({ paragraph }: { paragraph: string }) {
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="glass-panel rounded-2xl border border-line p-6">
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-line pb-3">
          <div>
            <h2 className="text-lg font-bold text-fg">Bodo Document Print View</h2>
            <p className="text-xs text-muted">The Devanagari output as clean text, ready to print or save as PDF</p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={!paragraph.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-hover px-3 py-1.5 text-xs text-fg hover:brightness-125 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <IcoPrinter /> Print Page
          </button>
        </div>
        <div
          id="document-print"
          className="min-h-[300px] whitespace-pre-wrap rounded-xl border border-line bg-inset p-4 font-deva text-lg leading-loose text-fg"
        >
          {paragraph.trim() || <span className="text-subtle">Nothing here yet. Type in the Transliterator tab first.</span>}
        </div>
      </div>
    </div>
  );
}

/** Bodo Script Rules — the existing vowel and consonant key charts. */
export function ScriptRules() {
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="glass-panel rounded-2xl border border-line p-6">
        <h3 className="mb-1 text-sm font-bold text-fg">Vowels</h3>
        <p className="mb-3 text-xs text-muted">Bodo Devanagari vowels — the English key that types each one in this engine.</p>
        <LetterKeyGrid
          items={VOWEL_REF.map(row => ({ devanagari: row.output, key: row.english }))}
          groupSizes={[4, 3, 4, 3]}
        />
      </div>

      <div className="glass-panel rounded-2xl border border-line p-6">
        <h3 className="mb-1 text-sm font-bold text-fg">Consonants</h3>
        <p className="mb-3 text-xs text-muted">Bodo Devanagari consonants — the English key that types each letter in this engine.</p>
        <ConsonantKeyRail />
      </div>
    </div>
  );
}

/** IME Settings — placeholder until there are real settings to change. */
export function ImeSettings() {
  const rows = [
    { title: 'Auto-convert on Spacebar', text: 'Choose whether Space commits the current word' },
    { title: 'Number of suggestions', text: 'How many Did You Mean candidates to show' },
  ];
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="glass-panel rounded-2xl border border-line p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-fg">Transliteration Engine Settings</h3>
          <ComingSoon />
        </div>
        <div className="space-y-4 text-sm opacity-60" aria-disabled="true">
          {rows.map((row, i) => (
            <div key={row.title} className={i < rows.length - 1 ? 'border-b border-line pb-3' : ''}>
              <p className="font-medium text-fg">{row.title}</p>
              <p className="text-xs text-muted">{row.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

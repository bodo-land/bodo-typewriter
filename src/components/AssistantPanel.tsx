import { Suggestions } from './Suggestions';
import { ComingSoon } from './Btn';
import { IcoSparkles, IcoWand, IcoCheckCircle, IcoBookMarked, IcoSearch } from './icons';
import type { SuggestionSection } from '../utils/suggestions';

export type AssistantTab = 'suggestions' | 'dictionary' | 'grammar';

const TABS: { id: AssistantTab; label: string }[] = [
  { id: 'suggestions', label: 'Suggestions' },
  { id: 'dictionary', label: 'Dictionary' },
  { id: 'grammar', label: 'Grammar' },
];

// AI tools planned for this panel — shown greyed out until they exist.
const AI_TOOLS = [
  { icon: <IcoWand />, tint: 'bg-brand/10 text-brand-fg', title: 'Improve Bodo Fluency', text: 'Enhance vocabulary and phrasing' },
  { icon: <IcoCheckCircle size={16} />, tint: 'bg-ok/10 text-ok', title: 'Check Devanagari Grammar', text: 'Fix inflection and verb suffixes' },
  { icon: <IcoBookMarked />, tint: 'bg-warn/10 text-warn', title: 'Bodo Synonyms Finder', text: 'Find regional variations' },
];

/**
 * Right-hand panel. "Suggestions" hosts the real Did You Mean list for the
 * word being typed; the AI tools, dictionary and grammar views are layout
 * placeholders marked "Coming soon" (disabled, not silently inert).
 *
 * Inline on wide screens; below 1280px it's a slide-in overlay (index.css),
 * where the backdrop's `onClose` dismisses it.
 */
export function AssistantPanel({
  tab,
  onTabChange,
  suggestionSections,
  onApplySuggestion,
  onClose,
}: {
  tab: AssistantTab;
  onTabChange: (tab: AssistantTab) => void;
  suggestionSections: SuggestionSection[];
  onApplySuggestion: (segmentIndex: number, english: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="assistant-backdrop" onClick={onClose} />
      <aside className="assistant flex w-80 shrink-0 flex-col border-l border-line bg-panel">
        <div className="flex items-center justify-between border-b border-line p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-tr from-indigo-500 to-teal-400 p-1.5 text-white">
              <IcoSparkles />
            </div>
            <div>
              <h3 className="text-sm font-bold text-fg">Bodo Assistant</h3>
              <p className="text-[10px] text-muted">Spelling, vocabulary &amp; grammar</p>
            </div>
          </div>
        </div>

        <div className="flex border-b border-line text-xs" role="tablist">
          {TABS.map(t => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => onTabChange(t.id)}
              className={`-mb-px flex-1 border-b-2 py-2 text-center font-medium transition-colors ${
                tab === t.id ? 'border-brand text-brand-fg' : 'border-transparent text-muted hover:text-fg'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {tab === 'suggestions' && (
            <>
              <section className="rounded-xl border border-line bg-canvas/60 p-3">
                <p className="mb-2 text-xs font-semibold text-fg">Did You Mean?</p>
                {suggestionSections.length > 0 ? (
                  <Suggestions sections={suggestionSections} onApply={onApplySuggestion} />
                ) : (
                  <p className="text-[11px] text-subtle">
                    Nothing to suggest right now. Alternatives for easily confused letters show up here while you type.
                  </p>
                )}
              </section>

              <div className="space-y-2">
                {AI_TOOLS.map(tool => (
                  <div
                    key={tool.title}
                    aria-disabled="true"
                    className="flex w-full items-start gap-3 rounded-xl border border-line bg-hover/60 p-3 text-left opacity-60"
                  >
                    <div className={`rounded-lg p-2 ${tool.tint}`}>{tool.icon}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-fg">{tool.title}</p>
                      <p className="text-[11px] text-muted">{tool.text}</p>
                    </div>
                    <ComingSoon />
                  </div>
                ))}
              </div>

              <DictionaryBox />
            </>
          )}
          {tab === 'dictionary' && (
            <DictionaryBox />
          )}
          {tab === 'grammar' && (
            <div className="rounded-xl border border-line bg-canvas/60 p-4 text-center">
              <p className="mb-2 text-xs font-semibold text-fg">Grammar check</p>
              <p className="mb-3 text-[11px] text-muted">Checks for Bodo inflection and verb suffixes.</p>
              <ComingSoon />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function DictionaryBox() {
  return (
    <div className="space-y-2 rounded-xl border border-line bg-canvas/60 p-3 opacity-60" aria-disabled="true">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-fg">
          <span className="text-teal-400"><IcoSearch size={14} /></span>
          English–Bodo Dictionary
        </span>
        <ComingSoon />
      </div>
      <input
        type="text"
        disabled
        placeholder="Type an English word, e.g. 'book'…"
        className="w-full cursor-not-allowed rounded-lg border border-line bg-inset p-2 text-xs text-fg placeholder:text-subtle"
      />
    </div>
  );
}


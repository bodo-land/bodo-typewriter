import { useEffect } from 'react';
import { IcoClose, IcoKeyboardOutline } from './icons';

const SHORTCUTS: [string, string][] = [
  ['Toggle transliteration (IME)', 'F9'],
  ['Commit the current word', 'Space / Enter'],
  ['Move to the next control', 'Tab'],
];

export function ShortcutsModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-line bg-panel p-6 shadow-2xl"
      >
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 p-1 text-muted hover:text-fg">
          <IcoClose size={20} />
        </button>
        <h3 id="shortcuts-title" className="mb-4 flex items-center gap-2 text-lg font-bold text-fg">
          <span className="text-brand-fg"><IcoKeyboardOutline size={20} /></span> Keyboard Shortcuts
        </h3>
        <div className="space-y-3 text-xs">
          {SHORTCUTS.map(([label, keys], i) => (
            <div key={label} className={`flex items-center justify-between py-1.5 ${i < SHORTCUTS.length - 1 ? 'border-b border-line' : ''}`}>
              <span className="text-fg/90">{label}</span>
              <kbd className="rounded border border-line bg-canvas px-2 py-1 font-mono text-fg">{keys}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

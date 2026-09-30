import { useState } from 'react';
import { IcoCheck, IcoCopy, IcoDownload } from './icons';
import { downloadTextFile } from '../utils/download';

const VARIANTS = {
  primary:   'bg-brand text-white shadow hover:brightness-110',
  secondary: 'bg-hover text-fg hover:brightness-125',
  danger:    'bg-hover text-fg hover:bg-danger/15 hover:text-danger',
} as const;

export function Btn({
  variant = 'secondary',
  onClick,
  children,
  disabled,
  title,
  ariaLabel,
  className = '',
}: {
  variant?: keyof typeof VARIANTS;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  title?: string;
  /** Accessible name for icon-only buttons (falls back to `title` if omitted). */
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel ?? title}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100 ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

/** A Btn that copies `text` to the clipboard and flashes "Copied!" briefly. */
export function CopyBtn({ text, label = 'Copy', variant = 'secondary' }: { text: string; label?: string; variant?: keyof typeof VARIANTS }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Btn variant={variant} onClick={handleCopy} disabled={!text}>
      {copied ? <IcoCheck /> : <IcoCopy />}
      {copied ? 'Copied!' : label}
    </Btn>
  );
}

/** A Btn that downloads `text` as a .txt file. */
export function DownloadBtn({ text, filename, title }: { text: string; filename: string; title: string }) {
  return (
    <Btn variant="secondary" onClick={() => downloadTextFile(filename, text)} disabled={!text} title={title}>
      <IcoDownload />
    </Btn>
  );
}

/** Small "Coming soon" tag for parts of the layout that aren't built yet. */
export function ComingSoon({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full border border-warn/30 bg-warn/10 px-2 py-0.5 text-[10px] font-medium text-warn ${className}`}>
      Coming soon
    </span>
  );
}

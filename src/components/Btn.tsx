import { useState } from 'react';
import { GH, s } from '../styles/theme';
import { IcoCheck, IcoCopy, IcoDownload } from './icons';
import { downloadTextFile } from '../utils/download';

export function Btn({
  variant = 'secondary',
  onClick,
  children,
  disabled,
  title,
  ariaLabel,
}: {
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  title?: string;
  /** Accessible name for icon-only buttons (falls back to `title` if omitted). */
  ariaLabel?: string;
}) {
  const [hover, setHover] = useState(false);

  const base = variant === 'primary' ? s.btnPrimary
             : variant === 'danger'  ? s.btnDanger
             :                         s.btnSecondary;

  const hoverOverride: Record<string, React.CSSProperties> = {
    primary:   { backgroundColor: GH.accentFg },
    secondary: { backgroundColor: GH.hoverBg, border: `1px solid ${GH.hoverBorder}` },
    danger:    { backgroundColor: GH.dangerSubtle, border: `1px solid ${GH.dangerFg}` },
  };

  return (
    <button
      style={{
        ...base,
        ...(hover && !disabled ? hoverOverride[variant] : {}),
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 80ms, border-color 80ms',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={disabled ? undefined : onClick}
      title={title}
      aria-label={ariaLabel ?? title}
    >
      {children}
    </button>
  );
}

/** A Btn that copies `text` to the clipboard and flashes "Copied!" briefly. */
export function CopyBtn({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Btn variant="secondary" onClick={handleCopy} disabled={!text}>
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

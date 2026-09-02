import { forwardRef, useRef } from 'react';
import { GH } from '../styles/theme';

type Props = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'style'> & {
  /** Small right-aligned readout under the box, e.g. "25 chars • 1 line". */
  stats?: string;
  fontSize?: string;
  lineHeight?: string;
  fontFamily?: string;
  minHeight?: string;
  flex?: number;
};

/**
 * A textarea with a code-editor-style line-number gutter. The gutter and
 * the textarea must share the exact same fontSize/lineHeight (font-family
 * can differ — the gutter's own digits are always monospace) so each
 * number lines up with its row; the gutter's scrollTop is kept in sync on
 * every scroll event since it has no scrollbar of its own.
 */
export const LineNumberedTextarea = forwardRef<HTMLTextAreaElement, Props>(function LineNumberedTextarea(
  {
    value,
    stats,
    fontSize = 'var(--fs-16)',
    lineHeight = '1.6',
    fontFamily = 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace',
    minHeight,
    flex,
    onScroll,
    ...rest
  },
  ref,
) {
  const gutterRef = useRef<HTMLDivElement>(null);
  const lineCount = Math.max(1, String(value ?? '').split('\n').length);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex, minHeight: 0 }}>
      <div style={{
        display: 'flex',
        flex: flex ? 1 : undefined,
        minHeight: minHeight ?? 0,
        border: `1px solid ${GH.borderDefault}`,
        borderRadius: '6px',
        overflow: 'hidden',
        backgroundColor: GH.canvasDefault,
      }}>
        <div
          ref={gutterRef}
          aria-hidden="true"
          style={{
            flexShrink: 0,
            padding: '12px 10px',
            textAlign: 'right',
            color: GH.fgSubtle,
            fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace',
            fontSize,
            lineHeight,
            backgroundColor: GH.canvasSubtle,
            borderRight: `1px solid ${GH.borderMuted}`,
            overflow: 'hidden',
            userSelect: 'none',
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <textarea
          ref={ref}
          value={value}
          onScroll={e => {
            if (gutterRef.current) gutterRef.current.scrollTop = e.currentTarget.scrollTop;
            onScroll?.(e);
          }}
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            outline: 'none',
            color: GH.fgDefault,
            fontFamily,
            fontSize,
            lineHeight,
            padding: '12px',
            resize: 'none',
            boxSizing: 'border-box',
            backgroundColor: 'transparent',
          }}
          {...rest}
        />
      </div>
      {stats && (
        <div style={{ textAlign: 'right', marginTop: '4px', fontSize: 'var(--fs-13)', color: GH.fgSubtle, flexShrink: 0 }}>
          {stats}
        </div>
      )}
    </div>
  );
});

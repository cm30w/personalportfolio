import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react';

interface BlurPanelProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

/** Frosted panel that wraps content, feathered edges, and scales with text size. */
export default function BlurPanel({ children, style, className = '' }: BlurPanelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const before = getComputedStyle(el, '::before');
    const panel = getComputedStyle(el);
    // #region agent log
    fetch('http://127.0.0.1:7691/ingest/46a1531e-b5f7-424f-853f-c4ad2f0a24ce', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'cde014' },
      body: JSON.stringify({
        sessionId: 'cde014',
        location: 'BlurPanel.tsx:mount',
        message: 'blur panel computed styles',
        data: {
          hash: window.location.hash,
          backdropFilter: before.backdropFilter,
          webkitBackdropFilter: (before as CSSStyleDeclaration & { webkitBackdropFilter?: string }).webkitBackdropFilter ?? '',
          beforeBackground: before.backgroundColor,
          panelTransform: panel.transform,
          panelPosition: panel.position,
          parentOverflow: el.parentElement ? getComputedStyle(el.parentElement).overflow : null,
          rect: el.getBoundingClientRect(),
        },
        timestamp: Date.now(),
        hypothesisId: 'H3',
      }),
    }).catch(() => {});
    // #endregion
  }, []);

  return (
    <div ref={ref} className={`blur-panel ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}

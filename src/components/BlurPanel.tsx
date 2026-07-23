import type { CSSProperties, ReactNode } from 'react';

interface BlurPanelProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

/** Frosted panel that wraps content, feathered edges, and scales with text size. */
export default function BlurPanel({ children, style, className = '' }: BlurPanelProps) {
  return (
    <div className={`blur-panel ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}

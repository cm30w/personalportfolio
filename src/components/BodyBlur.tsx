import type { CSSProperties, ReactNode } from 'react';

interface BodyBlurProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Tight frosted backdrop — only behind body copy, not headings. */
export default function BodyBlur({ children, className = '', style }: BodyBlurProps) {
  return (
    <div className={`body-blur ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}

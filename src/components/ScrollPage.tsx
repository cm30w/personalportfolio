import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ScrollPageProps {
  children: ReactNode;
  className?: string;
}

/**
 * Fixed full-viewport page. Children stay direct children of the fixed .page
 * (needed for BlurPanel backdrop-filter). Scroll is simulated with a leading
 * spacer margin — not overflow:auto, which would kill the blur.
 */
export default function ScrollPage({ children, className = '' }: ScrollPageProps) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7691/ingest/46a1531e-b5f7-424f-853f-c4ad2f0a24ce', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'cde014' },
      body: JSON.stringify({
        sessionId: 'cde014',
        location: 'ScrollPage.tsx:mount',
        message: 'scroll page mounted',
        data: { hash: window.location.hash, className },
        timestamp: Date.now(),
        hypothesisId: 'H4',
      }),
    }).catch(() => {});
    // #endregion

    const contentKids = () => {
      const page = pageRef.current;
      if (!page) return [] as HTMLElement[];
      return Array.from(page.children).filter(
        (el) => !el.classList.contains('page--scroll__spacer'),
      ) as HTMLElement[];
    };

    /**
     * Max scroll from intrinsic content height (not getBoundingClientRect).
     * Rect-based math breaks when .social-bar--footer has margin-top:auto —
     * that auto margin grows as you scroll and max becomes unbounded.
     */
    const maxScroll = () => {
      const page = pageRef.current;
      if (!page) return 0;
      const kids = contentKids();
      if (kids.length === 0) return 0;

      const style = getComputedStyle(page);
      const padTop = parseFloat(style.paddingTop) || 0;
      const padBottom = parseFloat(style.paddingBottom) || 0;
      const gap = parseFloat(style.rowGap || style.gap) || 0;

      let contentH = padTop + padBottom;
      kids.forEach((kid, i) => {
        contentH += kid.offsetHeight;
        if (i < kids.length - 1) contentH += gap;
      });

      // Small bottom breathing room, but never past the content itself
      return Math.max(0, contentH - window.innerHeight);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setOffset((y) => {
        const max = maxScroll();
        return Math.min(max, Math.max(0, y + e.deltaY));
      });
    };

    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? 0;
      const dy = touchY - y;
      touchY = y;
      if (dy === 0) return;
      e.preventDefault();
      setOffset((prev) => {
        const max = maxScroll();
        return Math.min(max, Math.max(0, prev + dy));
      });
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const pageAmounts: Record<string, number> = {
        ArrowDown: 60,
        ArrowUp: -60,
        PageDown: window.innerHeight * 0.85,
        PageUp: -window.innerHeight * 0.85,
        Home: Number.NEGATIVE_INFINITY,
        End: Number.POSITIVE_INFINITY,
      };
      const delta = pageAmounts[e.key];
      if (delta === undefined) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      e.preventDefault();
      setOffset((prev) => {
        const max = maxScroll();
        if (e.key === 'Home') return 0;
        if (e.key === 'End') return max;
        return Math.min(max, Math.max(0, prev + delta));
      });
    };

    const onResize = () => {
      setOffset((y) => Math.min(maxScroll(), Math.max(0, y)));
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div
      ref={pageRef}
      className={`page page--scroll ${className}`.trim()}
    >
      <div
        className="page--scroll__spacer"
        aria-hidden="true"
        style={{ marginTop: -offset }}
      />
      {children}
    </div>
  );
}

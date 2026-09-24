import { useEffect, useRef, type ReactNode } from 'react';

interface ScrollPageProps {
  children: ReactNode;
  className?: string;
}

/**
 * Fixed full-viewport page. Children stay direct children of the fixed .page
 * (needed for BlurPanel backdrop-filter). Scroll is simulated with a leading
 * spacer margin — not overflow:auto, which would kill the blur.
 *
 * Wheel/keyboard input eases toward its target and touch flicks carry
 * momentum, so scrolling feels like gliding through water instead of jumping.
 * The offset lives in refs and is written straight to the spacer's style —
 * children never re-render while scrolling.
 */
export default function ScrollPage({ children, className = '' }: ScrollPageProps) {
  const pageRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    let target = 0;    // where input wants to be
    let current = 0;   // what's on screen
    let velocity = 0;  // touch-flick momentum, px per frame
    let rafId = 0;
    let running = false;
    let lastTs = 0;

    const clampTarget = () => {
      target = Math.min(maxScroll(), Math.max(0, target));
    };

    const apply = () => {
      const spacer = spacerRef.current;
      if (spacer) spacer.style.marginTop = `-${current}px`;
    };

    const settle = () => {
      current = target;
      velocity = 0;
      apply();
    };

    const tick = (ts: number) => {
      const dt = Math.min((ts - lastTs) / 1000 || 0.016, 0.05);
      lastTs = ts;

      // Touch momentum decays each frame and hard-stops at the bounds
      if (velocity !== 0) {
        target += velocity;
        velocity *= Math.pow(0.94, dt * 60);
        const max = maxScroll();
        if (target <= 0 || target >= max) velocity = 0;
        clampTarget();
      }

      if (motionQuery.matches) {
        settle();
      } else {
        // Frame-rate-independent ease-out toward the target
        current += (target - current) * (1 - Math.exp(-dt * 10));
        if (Math.abs(target - current) < 0.3 && Math.abs(velocity) < 0.15) settle();
        else apply();
      }

      if (current === target && velocity === 0) {
        running = false;
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (running) return;
      running = true;
      lastTs = performance.now();
      rafId = requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // deltaMode 1 = lines (Firefox with a plugged-in mouse) — normalize to px
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      velocity = 0;
      target += dy;
      clampTarget();
      wake();
    };

    let touchY = 0;
    let touchVel = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0;
      touchVel = 0;
      velocity = 0; // grab the page mid-glide
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? 0;
      const dy = touchY - y;
      touchY = y;
      if (dy === 0) return;
      e.preventDefault();
      touchVel = touchVel * 0.4 + dy * 0.6;
      target += dy;
      clampTarget();
      // Track the finger 1:1 — easing here would feel like lag, not water
      settle();
    };
    const onTouchEnd = () => {
      if (Math.abs(touchVel) < 2 || motionQuery.matches) return;
      velocity = Math.max(-80, Math.min(80, touchVel));
      wake();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable) return;

      const pageAmounts: Record<string, number> = {
        ArrowDown: 60,
        ArrowUp: -60,
        PageDown: window.innerHeight * 0.85,
        PageUp: -window.innerHeight * 0.85,
        Home: Number.NEGATIVE_INFINITY,
        End: Number.POSITIVE_INFINITY,
      };
      let delta = pageAmounts[e.key];
      // Space pages down (Shift+Space back up) — but never when it would
      // activate a focused button or link
      if (e.key === ' ' && tag !== 'BUTTON' && tag !== 'A') {
        delta = window.innerHeight * 0.85 * (e.shiftKey ? -1 : 1);
      }
      if (delta === undefined) return;
      e.preventDefault();
      velocity = 0;
      target += delta;
      clampTarget();
      wake();
    };

    const onResize = () => {
      clampTarget();
      wake();
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
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
        ref={spacerRef}
        className="page--scroll__spacer"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}

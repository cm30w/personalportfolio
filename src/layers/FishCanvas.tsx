import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useBoids } from '../hooks/useBoids';
import type { Boid } from '../hooks/useBoids';

export interface FishCanvasHandle {
  getCanvas: () => HTMLCanvasElement | null;
  /** Startle fish near (x, y) and release a puff of bubbles — wired to clicks. */
  splash: (x: number, y: number) => void;
}

// ─── Body SVG metrics (extracted from viewBox + path analysis) ───────────────
// viewBox: 0 0 375.19 257.57
// Path spans: x [45.33 → 329.86], y [45.38 → 212.24]
const BODY_SVG_W = 375.19;
const BODY_SVG_H = 257.57;
const BODY_CENTER_X = 187.6;  // center of visible body shape in SVG coords
const BODY_CENTER_Y = 128.8;
const BODY_VISIBLE_W = 284.5; // path width (right tip – left tip), used for scaling

// ─── Tail SVG metrics ────────────────────────────────────────────────────────
// viewBox: 0 0 217.5 261.6
// Both lobe paths converge at (172.1, 130.0) — the attachment pivot
const TAIL_SVG_W = 217.5;
const TAIL_SVG_H = 261.6;
const TAIL_ATTACH_X = 172.1;  // pivot x in tail SVG coords
const TAIL_ATTACH_Y = 130.0;  // pivot y in tail SVG coords
// At size=1, how far the pivot is from the body center in fish local coords:
// derived from the *combined* fish frame (23:159): body_center_x=306.93, tail_attach_x=174.77
// offset = (174.77 - 306.93) × (22 / 286.663) = -10.14
const TAIL_PIVOT_FISH = -10.14;

// Sprites are rasterized at 2× and drawn back down at half scale — the extra
// samples smooth the SVG edges noticeably at fish size, for a one-off cost.
const SPRITE_SS = 2;

// Pre-rendered fish sprites: one OffscreenCanvas each for body and tail,
// sized to the boid's exact pixel dimensions so the render loop only blits.
interface FishSprite {
  body: OffscreenCanvas;
  tail: OffscreenCanvas;
  s: number;        // scale factor (canvas units per SVG unit)
  bodyOffX: number; // = -BODY_CENTER_X * s * SPRITE_SS  (draw offset, sprite px)
  bodyOffY: number;
  tailOffX: number; // = -TAIL_ATTACH_X * s * SPRITE_SS
  tailOffY: number;
  pivotX: number;   // = TAIL_PIVOT_FISH * size  (in fish-local coords)
}

function buildSprites(
  boids: Boid[],
  bodyImg: HTMLImageElement,
  tailImg: HTMLImageElement,
): FishSprite[] {
  return boids.map(boid => {
    const s = (22 * boid.size) / BODY_VISIBLE_W;
    const sr = s * SPRITE_SS;

    const bodyW = Math.ceil(BODY_SVG_W * sr);
    const bodyH = Math.ceil(BODY_SVG_H * sr);
    const bodyCanvas = new OffscreenCanvas(bodyW, bodyH);
    bodyCanvas.getContext('2d')!.drawImage(bodyImg, 0, 0, bodyW, bodyH);

    const tailW = Math.ceil(TAIL_SVG_W * sr);
    const tailH = Math.ceil(TAIL_SVG_H * sr);
    const tailCanvas = new OffscreenCanvas(tailW, tailH);
    tailCanvas.getContext('2d')!.drawImage(tailImg, 0, 0, tailW, tailH);

    return {
      body: bodyCanvas,
      tail: tailCanvas,
      s,
      bodyOffX: -BODY_CENTER_X * sr,
      bodyOffY: -BODY_CENTER_Y * sr,
      tailOffX: -TAIL_ATTACH_X * sr,
      tailOffY: -TAIL_ATTACH_Y * sr,
      pivotX: TAIL_PIVOT_FISH * boid.size,
    };
  });
}

// ─── Bubbles — spawned on splashes and occasionally by fish ──────────────────
interface Bubble {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  age: number;    // seconds alive
  ttl: number;    // seconds until pop
  wobble: number; // phase offset for the sideways sway
}

const MAX_BUBBLES = 80;

function spawnBubbles(bubbles: Bubble[], x: number, y: number, count: number, spread: number) {
  for (let i = 0; i < count; i++) {
    bubbles.push({
      x: x + (Math.random() - 0.5) * spread,
      y: y + (Math.random() - 0.5) * spread,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -(0.7 + Math.random() * 1.1),
      r: 1.5 + Math.random() * 3,
      age: 0,
      ttl: 1.6 + Math.random() * 1.2,
      wobble: Math.random() * Math.PI * 2,
    });
  }
  // Oldest pop first if a click flurry overfills the pool
  while (bubbles.length > MAX_BUBBLES) bubbles.shift();
}

function stepAndDrawBubbles(ctx: CanvasRenderingContext2D, bubbles: Bubble[], t: number) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const bub = bubbles[i];
    bub.age += 0.016;
    if (bub.age >= bub.ttl || bub.y < -10) {
      bubbles.splice(i, 1);
      continue;
    }
    bub.vy = Math.max(bub.vy - 0.012, -2.6); // buoyancy
    bub.x += bub.vx + Math.sin(t * 4 + bub.wobble) * 0.25;
    bub.y += bub.vy;

    // Quick fade-in, slow fade-out; bubbles swell slightly as they rise
    const fade = Math.min(1, bub.age * 6) * (1 - bub.age / bub.ttl);
    const r = bub.r * (1 + bub.age * 0.12);

    ctx.beginPath();
    ctx.arc(bub.x, bub.y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.16 * fade})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(255,255,255,${0.62 * fade})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Glint on the upper-left rim
    ctx.beginPath();
    ctx.arc(bub.x - r * 0.35, bub.y - r * 0.35, Math.max(0.6, r * 0.22), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.75 * fade})`;
    ctx.fill();
  }
}

// Draw a single fish using pre-computed sprites and direct transform matrices
// (avoids ctx.save/restore/translate/rotate overhead).
function drawFish(
  ctx: CanvasRenderingContext2D,
  boid: Boid,
  t: number,
  sprite: FishSprite,
) {
  const { x, y, vx, vy } = boid;
  const { body, tail, bodyOffX, bodyOffY, tailOffX, tailOffY, pivotX } = sprite;

  const angle = Math.atan2(vy, vx);
  const speed = Math.sqrt(vx * vx + vy * vy);

  const lateralVel = -vx * Math.sin(angle) + vy * Math.cos(angle);
  const wagFreq = 3.0 + speed * 0.5;
  const wagAngle = Math.sin(t * wagFreq + x * 0.05)
    * clamp(Math.abs(lateralVel) * 0.8 + 0.15, 0.15, 0.45);

  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  // Matrix scale 1/SPRITE_SS maps the supersampled sprite px back to world px
  const k = 1 / SPRITE_SS;

  // Tail: composed transform = rotate(angle) · translate(pivotX, 0) · rotate(wagAngle)
  // Equivalent rotation = angle + wagAngle; translation to pivot in world space:
  const totalAngle = angle + wagAngle;
  const cosT = Math.cos(totalAngle);
  const sinT = Math.sin(totalAngle);
  ctx.setTransform(cosT * k, sinT * k, -sinT * k, cosT * k, x + pivotX * cosA, y + pivotX * sinA);
  ctx.drawImage(tail, tailOffX, tailOffY);

  // Body: just rotate(angle) at boid position
  ctx.setTransform(cosA * k, sinA * k, -sinA * k, cosA * k, x, y);
  ctx.drawImage(body, bodyOffX, bodyOffY);
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

const FishCanvas = forwardRef<FishCanvasHandle>(function FishCanvas(_props, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);
  const bubblesRef = useRef<Bubble[]>([]);
  const { boidsRef, smallBoidsRef, init, step, setMouse, startle, resize } = useBoids(39, 5);

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    splash: (x: number, y: number) => {
      startle(x, y);
      spawnBubbles(bubblesRef.current, x, y, 7 + ((Math.random() * 4) | 0), 26);
    },
  }), [startle]);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingQuality = 'high';
    let t = 0;

    const bodyImg = new Image();
    const tailImg = new Image();

    let cw = window.innerWidth;
    let ch = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cw = canvas.width;
      ch = canvas.height;
      resize(cw, ch);
    };

    handleResize();
    init(canvas.width, canvas.height);

    const handleMouse = (e: MouseEvent) => setMouse(e.clientX, e.clientY);
    const handleTouch = (e: TouchEvent) => {
      if (e.touches[0]) setMouse(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('touchmove', handleTouch);
    window.addEventListener('resize', handleResize);

    // Sprites are built once images are ready.
    let mainSprites: FishSprite[] = [];
    let smallSprites: FishSprite[] = [];

    // Ambient life: every few seconds a random fish lets out a couple of tiny
    // bubbles. Skipped under prefers-reduced-motion — splash bubbles (direct
    // feedback to a click) stay.
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let nextAmbientBubble = 2 + Math.random() * 2;

    function render() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cw, ch);
      t += 0.016;
      step();

      const main = boidsRef.current;
      const small = smallBoidsRef.current;

      if (!motionQuery.matches) {
        nextAmbientBubble -= 0.016;
        if (nextAmbientBubble <= 0 && main.length > 0) {
          nextAmbientBubble = 2.4 + Math.random() * 2.4;
          const b = main[(Math.random() * main.length) | 0];
          const ang = Math.atan2(b.vy, b.vx);
          spawnBubbles(
            bubblesRef.current,
            b.x + Math.cos(ang) * 14 * b.size,
            b.y + Math.sin(ang) * 14 * b.size,
            1 + ((Math.random() * 2) | 0),
            4,
          );
        }
      }

      for (let i = 0; i < main.length; i++) {
        drawFish(ctx, main[i], t, mainSprites[i]);
      }
      for (let i = 0; i < small.length; i++) {
        drawFish(ctx, small[i], t, smallSprites[i]);
      }

      stepAndDrawBubbles(ctx, bubblesRef.current, t);

      // Reset to identity so other canvas operations aren't affected
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      animRef.current = requestAnimationFrame(render);
    }

    let loadedCount = 0;
    const onLoad = () => {
      loadedCount++;
      if (loadedCount === 2) {
        mainSprites = buildSprites(boidsRef.current, bodyImg, tailImg);
        smallSprites = buildSprites(smallBoidsRef.current, bodyImg, tailImg);
        animRef.current = requestAnimationFrame(render);
      }
    };
    bodyImg.addEventListener('load', onLoad);
    tailImg.addEventListener('load', onLoad);
    bodyImg.addEventListener('error', onLoad);
    tailImg.addEventListener('error', onLoad);
    bodyImg.src = `${import.meta.env.BASE_URL}fish-body.svg`;
    tailImg.src = `${import.meta.env.BASE_URL}fish-tail.svg`;

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('touchmove', handleTouch);
      window.removeEventListener('resize', handleResize);
      canvasRef.current = null;
    };
  }, [init, step, setMouse, resize, boidsRef, smallBoidsRef]);

  return null;
});

export default FishCanvas;

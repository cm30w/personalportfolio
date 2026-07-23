import { useRef, useCallback } from 'react';

export interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

const MAX_SPEED = 3.2;
const MIN_SPEED = 0.9;
const CRUISE_MAX_SPEED = MAX_SPEED * 0.5;
const CRUISE_MIN_SPEED = MIN_SPEED * 0.5;
const PERCEPTION = 80;
const SEP_DIST = 28;
const AVOID_RADIUS = 180;
const AVOID_STRENGTH = 0.07;

// Pre-computed squared thresholds to avoid sqrt in hot loops
const PERCEPTION_SQ = PERCEPTION * PERCEPTION;
const SEP_DIST_SQ = SEP_DIST * SEP_DIST;
const AVOID_RADIUS_SQ = AVOID_RADIUS * AVOID_RADIUS;

function initBoids(count: number, w: number, h: number, sizeMin = 1, sizeMax = 1): Boid[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = CRUISE_MIN_SPEED + Math.random() * (CRUISE_MAX_SPEED - CRUISE_MIN_SPEED);
    const cx = w * 0.3 + Math.random() * w * 0.5;
    const cy = h * 0.2 + Math.random() * h * 0.6;
    const size = sizeMin + Math.random() * (sizeMax - sizeMin);
    return {
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
    };
  });
}

function stepBoids(
  boids: Boid[],
  w: number,
  h: number,
  mouseX: number,
  mouseY: number
) {
  const n = boids.length;

  for (let i = 0; i < n; i++) {
    const b = boids[i];
    let sepX = 0, sepY = 0, sepCount = 0;
    let alignX = 0, alignY = 0;
    let cohX = 0, cohY = 0, cohCount = 0;

    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      const other = boids[j];
      const dx = other.x - b.x;
      const dy = other.y - b.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < PERCEPTION_SQ) {
        alignX += other.vx;
        alignY += other.vy;
        cohX += other.x;
        cohY += other.y;
        cohCount++;

        if (distSq < SEP_DIST_SQ && distSq > 0) {
          const dist = Math.sqrt(distSq);
          sepX -= dx / dist;
          sepY -= dy / dist;
          sepCount++;
        }
      }
    }

    let ax = 0, ay = 0;

    if (sepCount > 0) {
      ax += (sepX / sepCount) * 0.05;
      ay += (sepY / sepCount) * 0.05;
    }
    if (cohCount > 0) {
      ax += (cohX / cohCount - b.x) * 0.0005;
      ay += (cohY / cohCount - b.y) * 0.0005;
      ax += (alignX / cohCount - b.vx) * 0.03;
      ay += (alignY / cohCount - b.vy) * 0.03;
    }

    // Mouse avoidance — use squared dist to skip sqrt when outside radius
    const mdx = b.x - mouseX;
    const mdy = b.y - mouseY;
    const mdistSq = mdx * mdx + mdy * mdy;
    const nearMouse = mdistSq < AVOID_RADIUS_SQ;
    if (nearMouse && mdistSq > 0) {
      const mdist = Math.sqrt(mdistSq);
      const strength = AVOID_STRENGTH * (1 - mdist / AVOID_RADIUS) * 5;
      ax += (mdx / mdist) * strength;
      ay += (mdy / mdist) * strength;
    }

    ax += (Math.random() - 0.5) * 0.02;
    ay += (Math.random() - 0.5) * 0.02;

    b.vx += ax;
    b.vy += ay;

    const maxSpeed = nearMouse ? MAX_SPEED : CRUISE_MAX_SPEED;
    const minSpeed = nearMouse ? MIN_SPEED : CRUISE_MIN_SPEED;
    const speedSq = b.vx * b.vx + b.vy * b.vy;
    if (speedSq > maxSpeed * maxSpeed) {
      const inv = maxSpeed / Math.sqrt(speedSq);
      b.vx *= inv;
      b.vy *= inv;
    } else if (speedSq < minSpeed * minSpeed && speedSq > 0) {
      const inv = minSpeed / Math.sqrt(speedSq);
      b.vx *= inv;
      b.vy *= inv;
    }

    b.x += b.vx;
    b.y += b.vy;

    // Wrap around edges
    const margin = 60;
    if (b.x < -margin) b.x = w + margin;
    if (b.x > w + margin) b.x = -margin;
    if (b.y < -margin) b.y = h + margin;
    if (b.y > h + margin) b.y = -margin;
  }
}

export function useBoids(count = 30, smallCount = 4) {
  const boidsRef = useRef<Boid[]>([]);
  const smallBoidsRef = useRef<Boid[]>([]);
  const mouseRef = useRef({ x: -999, y: -999 });
  const sizeRef = useRef({ w: window.innerWidth, h: window.innerHeight });

  const init = useCallback((w: number, h: number) => {
    boidsRef.current = initBoids(count, w, h, 0.8, 1.15);
    smallBoidsRef.current = initBoids(smallCount, w, h, 0.65, 0.78);
    // Scatter small boids to corners
    smallBoidsRef.current.forEach((b, i) => {
      b.x = i % 2 === 0 ? w * 0.05 + Math.random() * 80 : w * 0.85 + Math.random() * 80;
      b.y = i < 2 ? h * 0.7 + Math.random() * 100 : h * 0.1 + Math.random() * 100;
    });
    sizeRef.current = { w, h };
  }, [count, smallCount]);

  const step = useCallback(() => {
    const { w, h } = sizeRef.current;
    const { x: mx, y: my } = mouseRef.current;
    stepBoids(boidsRef.current, w, h, mx, my);
    stepBoids(smallBoidsRef.current, w, h, mx, my);
  }, []);

  const setMouse = useCallback((x: number, y: number) => {
    mouseRef.current = { x, y };
  }, []);

  const resize = useCallback((w: number, h: number) => {
    sizeRef.current = { w, h };
  }, []);

  return {
    boidsRef,
    smallBoidsRef,
    init,
    step,
    setMouse,
    resize,
  };
}

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { FishCanvasHandle } from './FishCanvas';

const VERT_SRC = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

// Wave propagation (ping-pong, no drop injection)
const RIPPLE_FRAG_SRC = `
precision mediump float;
uniform sampler2D u_prev;
uniform sampler2D u_prev2;
uniform vec2 u_res;
uniform float u_time;
varying vec2 v_uv;

void main() {
  vec2 px = 1.0 / u_res;

  float prev2 = texture2D(u_prev2, v_uv).r;

  // 4 cardinal neighbours
  float n  = texture2D(u_prev, v_uv + vec2(0.0,  px.y)).r;
  float s  = texture2D(u_prev, v_uv + vec2(0.0, -px.y)).r;
  float e  = texture2D(u_prev, v_uv + vec2( px.x, 0.0)).r;
  float w  = texture2D(u_prev, v_uv + vec2(-px.x, 0.0)).r;

  // 4 diagonal neighbours — isotropic weighting turns diamonds into circles
  float ne = texture2D(u_prev, v_uv + vec2( px.x,  px.y)).r;
  float nw = texture2D(u_prev, v_uv + vec2(-px.x,  px.y)).r;
  float se = texture2D(u_prev, v_uv + vec2( px.x, -px.y)).r;
  float sw = texture2D(u_prev, v_uv + vec2(-px.x, -px.y)).r;

  // Isotropic sum: cardinal weight 2× diagonal keeps circular dispersion
  float iso  = (n + s + e + w) * 0.5 + (ne + nw + se + sw) * 0.25;
  float next = iso * (2.0 / 3.0) - prev2;
  next *= 0.989;

  // Smooth low-frequency drive — gently excites the simulation without blurriness
  float bg = sin(v_uv.x * 4.71 + u_time * 0.28) * cos(v_uv.y * 3.93 - u_time * 0.22);
  next += bg * 0.003;

  next = clamp(next, -1.0, 1.0);
  gl_FragColor = vec4(next, next, next, 1.0);
}
`;

// Inject a single drop into the height field without propagating waves
const DROP_FRAG_SRC = `
precision mediump float;
uniform sampler2D u_height;
uniform vec2 u_drop;
uniform float u_dropRadius;
uniform float u_dropStrength;
varying vec2 v_uv;

void main() {
  float h = texture2D(u_height, v_uv).r;
  float d = distance(v_uv, u_drop);
  h += smoothstep(u_dropRadius, 0.0, d) * u_dropStrength;
  h = clamp(h, -1.0, 1.0);
  gl_FragColor = vec4(h, h, h, 1.0);
}
`;

// Composite: distort gradient + grid pattern + fish using ripple normals + large-scale water waves
const RENDER_FRAG_SRC = `
precision mediump float;
uniform sampler2D u_ripple;
uniform sampler2D u_background;
uniform sampler2D u_fish;
uniform sampler2D u_pattern;
uniform vec2 u_res;
uniform float u_time;
varying vec2 v_uv;

void main() {
  vec2 px = 1.0 / u_res;

  float hr = texture2D(u_ripple, v_uv + vec2( px.x, 0.0)).r;
  float hl = texture2D(u_ripple, v_uv + vec2(-px.x, 0.0)).r;
  float hu = texture2D(u_ripple, v_uv + vec2(0.0,  px.y)).r;
  float hd = texture2D(u_ripple, v_uv + vec2(0.0, -px.y)).r;
  vec2 normal = vec2(hl - hr, hd - hu) * 0.5;

  // Large-scale pool-water undulation — 3 sine layers at different scales/speeds.
  // Applied directly to UV so the distortion is large and smooth regardless of
  // how many drops are in the simulation.
  float t = u_time;
  float dx = sin(v_uv.x * 2.8  + v_uv.y * 1.3  + t * 0.25) * 0.0275
           + sin(v_uv.x * 5.1  - v_uv.y * 3.7  + t * 0.42) * 0.011
           + sin(v_uv.x * 7.5  + v_uv.y * 6.0  + t * 0.65) * 0.0045;
  float dy = cos(v_uv.x * 1.9  - v_uv.y * 2.4  + t * 0.18) * 0.0275
           + cos(v_uv.x * 4.3  + v_uv.y * 2.1  - t * 0.35) * 0.011
           + cos(v_uv.x * 6.2  - v_uv.y * 7.3  - t * 0.55) * 0.0045;
  vec2 waterDistort = vec2(dx, dy);

  // Fade distortion to zero near edges — prevents clamped-UV stretch artefacts
  float ex = smoothstep(0.0, 0.12, v_uv.x) * smoothstep(1.0, 0.88, v_uv.x);
  float ey = smoothstep(0.0, 0.12, v_uv.y) * smoothstep(1.0, 0.88, v_uv.y);
  float edgeFade = ex * ey;

  // Combine simulation ripple normals with the broad water surface movement
  vec2 distUV = clamp(v_uv + (normal * 0.07 + waterDistort) * edgeFade, 0.0, 1.0);

  vec4 bg   = texture2D(u_background, distUV);
  vec4 fish = texture2D(u_fish, distUV);

  // Grid pattern — zoom in 30%: UV scale 1/1.3 so each tile appears 30% larger.
  // Uses distorted UVs so the water ripple warps the grid naturally.
  vec2 patUV = clamp((distUV - 0.5) / 1.3 + 0.5, 0.0, 1.0);
  // Canvas 2D ImageData (and thus the WebGL texture upload from it) is
  // straight/non-premultiplied alpha, not premultiplied — so pat.rgb is
  // already the correct tile/shadow color as authored in the SVG (mostly
  // white, tinted dark blue where the inner shadow falls). Do NOT divide by
  // alpha here: that used to force every grout pixel to clip to pure white,
  // flattening out the subtle inner-shadow shading from the Figma source.
  vec4 pat = texture2D(u_pattern, patUV);

  // Layer order: gradient → pattern → fish
  vec3 bgWithPat = mix(bg.rgb, pat.rgb, pat.a);
  vec3 scene = mix(bgWithPat, fish.rgb, fish.a);

  // Caustic-like shimmer: only from simulation ripple height/normals, not the sine waves
  float h = texture2D(u_ripple, v_uv).r;
  float shimmer = 1.0 + h * 0.06 + length(normal) * 0.175;
  shimmer = clamp(shimmer, 0.94, 1.09);

  gl_FragColor = vec4(scene * shimmer, 1.0);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vert: string, frag: string) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vert);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(prog));
    return null;
  }
  return prog;
}

function createFBO(gl: WebGLRenderingContext, w: number, h: number) {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return { tex, fbo };
}

function createGradientTex(gl: WebGLRenderingContext): WebGLTexture {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 512;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0,       '#98daf9');
  grad.addColorStop(0.1875,  '#78b8f8');
  grad.addColorStop(0.42788, '#7094f6');
  grad.addColorStop(1.0,     '#3e46a0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 4, 512);
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return tex;
}

function createFishTex(gl: WebGLRenderingContext): WebGLTexture {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 0]),
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return tex;
}

// Longest edge cap for the rasterized pattern texture — keeps VRAM/perf sane
// on very large or very-high-DPR screens while still looking sharp.
const PATTERN_MAX_DIM = 2048;

// Pick a raster size that matches the device's current viewport aspect ratio
// (scaled by DPR, capped on the long edge) so `preserveAspectRatio="xMidYMid
// slice"` crops the grid to a "cover" fit instead of stretching it into an
// arbitrary fixed aspect.
function computePatternRasterSize(): { w: number; h: number } {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = Math.max(1, Math.round(window.innerWidth * dpr));
  let h = Math.max(1, Math.round(window.innerHeight * dpr));
  const longEdge = Math.max(w, h);
  if (longEdge > PATTERN_MAX_DIM) {
    const scale = PATTERN_MAX_DIM / longEdge;
    w = Math.max(1, Math.round(w * scale));
    h = Math.max(1, Math.round(h * scale));
  }
  return { w, h };
}

// Patch the SVG's explicit px dimensions → Blob URL → Image → offscreen
// canvas → upload. Patching explicit width/height guarantees naturalWidth/
// Height are set (percentage-sized SVGs have no intrinsic size) and avoids
// any taint/CORS issues.
function rasterizePatternSVG(
  gl: WebGLRenderingContext,
  tex: WebGLTexture,
  svgText: string,
  w: number,
  h: number,
) {
  const patched = svgText
    .replace(/width="[^"]*"/, `width="${w}"`)
    .replace(/height="[^"]*"/, `height="${h}"`);
  const blobUrl = URL.createObjectURL(
    new Blob([patched], { type: 'image/svg+xml' }),
  );
  const img = new Image();
  img.onload = () => {
    const offscreen = document.createElement('canvas');
    offscreen.width  = w;
    offscreen.height = h;
    offscreen.getContext('2d')!.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(blobUrl);

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, offscreen);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    // NOTE: no generateMipmap() here — the raster size now tracks the
    // viewport (device-size-aware), so it's frequently non-power-of-two.
    // WebGL1 can't mipmap NPOT textures (GL_INVALID_OPERATION), which leaves
    // the texture "incomplete" and sampled as opaque black — silently
    // blacking out the whole gradient+pattern layer. Plain LINEAR filtering
    // with CLAMP_TO_EDGE (already set at creation) works fine for NPOT and
    // is more than sufficient for a single rasterize-on-load/resize texture.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);
  };
  img.onerror = () => {
    URL.revokeObjectURL(blobUrl);
    console.error('Failed to rasterize pattern SVG');
  };
  img.src = blobUrl;
}

function createPatternTex(gl: WebGLRenderingContext): {
  tex: WebGLTexture;
  /** Re-rasterize at the current viewport size (call on resize). */
  refresh: () => void;
} {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  // 1×1 transparent placeholder until the SVG loads
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([255, 255, 255, 0]));
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);

  // Cache the raw SVG text once fetched so `refresh()` can re-rasterize at a
  // new size on resize without re-fetching over the network.
  let svgText: string | null = null;

  const refresh = () => {
    if (!svgText) return;
    const { w, h } = computePatternRasterSize();
    rasterizePatternSVG(gl, tex, svgText, w, h);
  };

  // Respect Vite's configured base path (e.g. GitHub Pages project sites are
  // served under /<repo>/) — a root-absolute path would 404 there.
  fetch(`${import.meta.env.BASE_URL}project-preview-pattern.svg`)
    .then(r => {
      // #region agent log
      fetch('http://127.0.0.1:7691/ingest/46a1531e-b5f7-424f-853f-c4ad2f0a24ce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'cde014' },
        body: JSON.stringify({
          sessionId: 'cde014',
          location: 'WaterCanvas.tsx:pattern-fetch',
          message: 'pattern svg fetch response',
          data: { url: `${import.meta.env.BASE_URL}project-preview-pattern.svg`, ok: r.ok, status: r.status },
          timestamp: Date.now(),
          hypothesisId: 'H1',
        }),
      }).catch(() => {});
      // #endregion
      if (!r.ok) throw new Error(`Pattern SVG fetch failed: ${r.status}`);
      return r.text();
    })
    .then(text => {
      svgText = text;
      refresh();
    })
    .catch(err => console.error(err));

  return { tex, refresh };
}

// Drop stored in screen-pixel space; converted to UV when processed
interface Drop {
  /** Screen-space x (or -1 for ambient UV-space drop) */
  px: number;
  /** Screen-space y (or -1 for ambient) */
  py: number;
  /** Pre-computed UV x (used when px === -1) */
  uvX?: number;
  /** Pre-computed UV y (used when py === -1) */
  uvY?: number;
  /** Radius in simulation pixels */
  radius: number;
  strength: number;
}

interface Props {
  fishRef: RefObject<FishCanvasHandle | null>;
}

export default function WaterCanvas({ fishRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropQueueRef = useRef<Drop[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: false, premultipliedAlpha: false });
    // #region agent log
    fetch('http://127.0.0.1:7691/ingest/46a1531e-b5f7-424f-853f-c4ad2f0a24ce', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'cde014' },
      body: JSON.stringify({
        sessionId: 'cde014',
        location: 'WaterCanvas.tsx:webgl',
        message: gl ? 'webgl context ok' : 'webgl context FAILED',
        data: { href: window.location.href, baseUrl: import.meta.env.BASE_URL },
        timestamp: Date.now(),
        hypothesisId: 'H5',
      }),
    }).catch(() => {});
    // #endregion
    if (!gl) return;

    const rippleProg = createProgram(gl, VERT_SRC, RIPPLE_FRAG_SRC);
    const dropProg   = createProgram(gl, VERT_SRC, DROP_FRAG_SRC);
    const renderProg = createProgram(gl, VERT_SRC, RENDER_FRAG_SRC);
    if (!rippleProg || !dropProg || !renderProg) return;

    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    let W = Math.floor(window.innerWidth / 2);
    let H = Math.floor(window.innerHeight / 2);

    let fboA = createFBO(gl, W, H);
    let fboB = createFBO(gl, W, H);
    let fboC = createFBO(gl, W, H);

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const bgTex      = createGradientTex(gl);
    const fishTex    = createFishTex(gl);
    const pattern    = createPatternTex(gl);
    const patternTex = pattern.tex;

    let animId: number;
    let frame = 0;
    let time = 0.0;

    function bindQuad(prog: WebGLProgram) {
      const loc = gl!.getAttribLocation(prog, 'a_pos');
      gl!.bindBuffer(gl!.ARRAY_BUFFER, buf);
      gl!.enableVertexAttribArray(loc);
      gl!.vertexAttribPointer(loc, 2, gl!.FLOAT, false, 0, 0);
    }

    function injectDrop(drop: Drop) {
      const uvX = drop.px >= 0
        ? drop.px / window.innerWidth
        : (drop.uvX ?? 0.5);
      const uvY = drop.py >= 0
        ? 1.0 - drop.py / window.innerHeight
        : (drop.uvY ?? 0.5);
      const radUV = drop.radius / Math.max(W, H);

      // Read fboA, write into fboC, then rotate A↔C so fboA stays "current"
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fboC.fbo);
      gl!.viewport(0, 0, W, H);
      gl!.useProgram(dropProg);
      bindQuad(dropProg!);

      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, fboA.tex);
      gl!.uniform1i(gl!.getUniformLocation(dropProg!, 'u_height'), 0);
      gl!.uniform2f(gl!.getUniformLocation(dropProg!, 'u_drop'), uvX, uvY);
      gl!.uniform1f(gl!.getUniformLocation(dropProg!, 'u_dropRadius'), radUV);
      gl!.uniform1f(gl!.getUniformLocation(dropProg!, 'u_dropStrength'), drop.strength);

      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);

      // Swap A↔C so fboA holds the updated height field
      const tmp = fboA;
      fboA = fboC;
      fboC = tmp;
    }

    function render() {
      frame++;
      time += 0.016;


      // ── Wave propagation ───────────────────────────────────────────────────
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fboC.fbo);
      gl!.viewport(0, 0, W, H);
      gl!.useProgram(rippleProg);
      bindQuad(rippleProg!);

      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, fboA.tex);
      gl!.uniform1i(gl!.getUniformLocation(rippleProg!, 'u_prev'), 0);

      gl!.activeTexture(gl!.TEXTURE1);
      gl!.bindTexture(gl!.TEXTURE_2D, fboB.tex);
      gl!.uniform1i(gl!.getUniformLocation(rippleProg!, 'u_prev2'), 1);

      gl!.uniform2f(gl!.getUniformLocation(rippleProg!, 'u_res'), W, H);
      gl!.uniform1f(gl!.getUniformLocation(rippleProg!, 'u_time'), time);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);

      // Rotate FBOs: C→A (new prev), A→B (new prev2), B free
      const tmp = fboB;
      fboB = fboA;
      fboA = fboC;
      fboC = tmp;

      // ── Inject pending drops (up to 4 per frame) ──────────────────────────
      const batch = dropQueueRef.current.splice(0, 4);
      for (const drop of batch) injectDrop(drop);

      // ── Upload fish canvas texture ─────────────────────────────────────────
      const fishCanvas = fishRef.current?.getCanvas();
      if (fishCanvas && fishCanvas.width > 0 && fishCanvas.height > 0) {
        gl!.bindTexture(gl!.TEXTURE_2D, fishTex);
        gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, true);
        gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, fishCanvas);
        gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, false);
        gl!.bindTexture(gl!.TEXTURE_2D, null);
      }

      // ── Composite render pass ──────────────────────────────────────────────
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.clearColor(0, 0, 0, 1);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.disable(gl!.BLEND);

      gl!.useProgram(renderProg);
      bindQuad(renderProg!);

      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, fboA.tex);
      gl!.uniform1i(gl!.getUniformLocation(renderProg!, 'u_ripple'), 0);

      gl!.activeTexture(gl!.TEXTURE1);
      gl!.bindTexture(gl!.TEXTURE_2D, bgTex);
      gl!.uniform1i(gl!.getUniformLocation(renderProg!, 'u_background'), 1);

      gl!.activeTexture(gl!.TEXTURE2);
      gl!.bindTexture(gl!.TEXTURE_2D, fishTex);
      gl!.uniform1i(gl!.getUniformLocation(renderProg!, 'u_fish'), 2);

      gl!.activeTexture(gl!.TEXTURE3);
      gl!.bindTexture(gl!.TEXTURE_2D, patternTex);
      gl!.uniform1i(gl!.getUniformLocation(renderProg!, 'u_pattern'), 3);

      gl!.uniform2f(gl!.getUniformLocation(renderProg!, 'u_res'), W, H);
      gl!.uniform1f(gl!.getUniformLocation(renderProg!, 'u_time'), time);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    // Throttle mousemove drops so we don't flood the queue
    let lastMouseMs = 0;
    const handleMouse = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastMouseMs < 32) return; // ~30 drops/sec max
      lastMouseMs = now;
      dropQueueRef.current.push({ px: e.clientX, py: e.clientY, radius: 22, strength: 0.175 });
    };

    // Click / tap: big satisfying splash
    const handleClick = (e: MouseEvent) => {
      dropQueueRef.current.push({ px: e.clientX, py: e.clientY, radius: 55, strength: 0.45 });
    };

    const handleTouch = (e: TouchEvent) => {
      for (let i = 0; i < e.touches.length; i++) {
        dropQueueRef.current.push({
          px: e.touches[i].clientX,
          py: e.touches[i].clientY,
          radius: 30,
          strength: 0.25,
        });
      }
    };

    // Debounce the pattern re-rasterization — resize/orientation-change can
    // fire rapidly, and re-rasterizing is comparatively expensive.
    let patternResizeTimer: number | undefined;

    const handleResize = () => {
      canvas!.width  = window.innerWidth;
      canvas!.height = window.innerHeight;
      W = Math.floor(window.innerWidth / 2);
      H = Math.floor(window.innerHeight / 2);
      fboA = createFBO(gl!, W, H);
      fboB = createFBO(gl!, W, H);
      fboC = createFBO(gl!, W, H);

      window.clearTimeout(patternResizeTimer);
      patternResizeTimer = window.setTimeout(() => pattern.refresh(), 200);
    };

    window.addEventListener('mousemove',  handleMouse);
    window.addEventListener('click',      handleClick);
    window.addEventListener('touchmove',  handleTouch,  { passive: true });
    window.addEventListener('touchstart', handleTouch,  { passive: true });
    window.addEventListener('resize',     handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.clearTimeout(patternResizeTimer);
      window.removeEventListener('mousemove',  handleMouse);
      window.removeEventListener('click',      handleClick);
      window.removeEventListener('touchmove',  handleTouch);
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('resize',     handleResize);
    };
  }, [fishRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

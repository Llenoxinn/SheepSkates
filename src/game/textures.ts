import * as THREE from 'three';
import { IW, IH, PLAZA, POND, RAIL } from './config';
import { pick, rand, rng } from './math';

/* ------------------------------------------------------------------ */
/* Shared helpers                                                       */
/* ------------------------------------------------------------------ */

function canvas(w: number, h: number) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  return { c, ctx: c.getContext('2d', { willReadFrequently: true })! };
}

/** Sobel-filtered height → tangent-space normal map (OpenGL convention, +Y up). */
export function normalFromHeight(src: HTMLCanvasElement, strength: number, invert = false) {
  const w = src.width, h = src.height;
  const data = src.getContext('2d')!.getImageData(0, 0, w, h).data;
  const lum = new Float32Array(w * h);
  for (let i = 0, p = 0; i < lum.length; i++, p += 4) {
    const l = (data[p]! * 0.299 + data[p + 1]! * 0.587 + data[p + 2]! * 0.114) / 255;
    lum[i] = invert ? 1 - l : l;
  }
  const { c, ctx } = canvas(w, h);
  const out = ctx.createImageData(w, h), o = out.data;
  const at = (x: number, y: number) => lum[((y + h) % h) * w + ((x + w) % w)]!;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = (at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1)) - (at(x - 1, y - 1) + 2 * at(x - 1, y) + at(x - 1, y + 1));
    const dy = (at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1)) - (at(x - 1, y - 1) + 2 * at(x, y - 1) + at(x + 1, y - 1));
    let nx = -dx * strength, ny = dy * strength, nz = 1;
    const len = Math.hypot(nx, ny, nz); nx /= len; ny /= len; nz /= len;
    const p = (y * w + x) * 4;
    o[p] = (nx * 0.5 + 0.5) * 255; o[p + 1] = (ny * 0.5 + 0.5) * 255; o[p + 2] = (nz * 0.5 + 0.5) * 255; o[p + 3] = 255;
  }
  ctx.putImageData(out, 0, 0);
  return c;
}

function colorTex(c: HTMLCanvasElement, aniso: number) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso;
  return t;
}
function dataTex(c: HTMLCanvasElement, aniso: number) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace; t.anisotropy = aniso;
  return t;
}

function perimeter(x: number, y: number, w: number, h: number, r: number, step: number) {
  const pts: [number, number, number, number][] = [];
  const seg = (x0: number, y0: number, x1: number, y1: number, nx: number, ny: number) => {
    const L = Math.hypot(x1 - x0, y1 - y0);
    for (let s = 0; s < L; s += step) { const k = s / L; pts.push([x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, nx, ny]); }
  };
  const arc = (cx: number, cy: number, a0: number, a1: number) => {
    const L = r * Math.abs(a1 - a0);
    for (let s = 0; s < L; s += step) { const a = a0 + (a1 - a0) * s / L; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, Math.cos(a), Math.sin(a)]); }
  };
  seg(x + r, y, x + w - r, y, 0, -1); arc(x + w - r, y + r, -Math.PI / 2, 0);
  seg(x + w, y + r, x + w, y + h - r, 1, 0); arc(x + w - r, y + h - r, 0, Math.PI / 2);
  seg(x + w - r, y + h, x + r, y + h, 0, 1); arc(x + r, y + h - r, Math.PI / 2, Math.PI);
  seg(x, y + h - r, x, y + r, -1, 0); arc(x + r, y + r, Math.PI, Math.PI * 1.5);
  return pts;
}

/* ------------------------------------------------------------------ */
/* Painted island (albedo + derived normal map)                         */
/* ------------------------------------------------------------------ */

export type IslandTextures = { map: THREE.Texture; normalMap: THREE.Texture; inset: number; radius: number };

export function paintIsland(aniso: number): IslandTextures {
  const W = 3072, H = Math.round(W * IH / IW), ppu = W / IW;
  const P = (x: number, z: number): [number, number] => [(x + IW / 2) * ppu, (z + IH / 2) * ppu];
  const { c: cv, ctx } = canvas(W, H);
  const m = 56, R = 225;
  const islandPath = () => { ctx.beginPath(); ctx.roundRect(m, m, W - 2 * m, H - 2 * m, R); };

  // 1. field patches: warped voronoi at half res with hedge lines between cells
  const hw = W >> 1, hh = H >> 1;
  const { c: off, ctx: octx } = canvas(hw, hh);
  const img = octx.createImageData(hw, hh);
  const r = rng(11);
  const cols = [[134, 185, 75], [119, 173, 65], [147, 194, 87], [110, 162, 60], [160, 200, 98], [127, 180, 70], [214, 190, 92], [126, 176, 66], [142, 190, 80]];
  const seeds = Array.from({ length: 15 }, (_, i) => ({ x: r() * hw, y: r() * hh, c: cols[i % cols.length]! }));
  seeds[2] = { x: hw * 0.86, y: hh * 0.86, c: [218, 192, 96] }; // golden field, bottom-right
  const k = hw / 1024;
  for (let y = 0; y < hh; y++) for (let x = 0; x < hw; x++) {
    const wx = x + Math.sin(y * 0.045 / k) * 6 * k + Math.sin((x + y) * 0.021 / k) * 5 * k, wy = y + Math.cos(x * 0.04 / k) * 6 * k;
    let d1 = 1e9, d2 = 1e9, c = seeds[0]!.c;
    for (const s of seeds) { const d = (wx - s.x) ** 2 + (wy - s.y) ** 2; if (d < d1) { d2 = d1; d1 = d; c = s.c; } else if (d < d2) d2 = d; }
    const edge = Math.sqrt(d2) - Math.sqrt(d1), n = (Math.random() - 0.5) * 14, i = (y * hw + x) * 4;
    const hedge = edge < 2.6 * k;
    img.data[i] = (hedge ? 62 : c[0]!) + n; img.data[i + 1] = (hedge ? 118 : c[1]!) + n; img.data[i + 2] = (hedge ? 44 : c[2]!) + n; img.data[i + 3] = 255;
  }
  octx.putImageData(img, 0, 0);
  ctx.save(); islandPath(); ctx.clip();
  ctx.drawImage(off, 0, 0, W, H);

  // 2. painterly grass strokes (upright blades)
  ctx.lineCap = 'round';
  const strokeCols = ['rgba(58,105,38,.34)', 'rgba(158,205,96,.32)', 'rgba(104,160,56,.3)', 'rgba(210,226,128,.22)', 'rgba(80,130,46,.3)'];
  for (let i = 0; i < 38000; i++) {
    const x = rand(0, W), y = rand(0, H), a = -Math.PI / 2 + rand(-0.6, 0.6), l = rand(6, 15);
    ctx.strokeStyle = pick(strokeCols); ctx.lineWidth = rand(2, 3.6);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke();
  }

  // 3. dirt paths
  const path = (pts: [number, number][], w: number) => {
    const draw = (lw: number, col: string) => {
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
      ctx.moveTo(...P(...pts[0]!)); ctx.bezierCurveTo(...P(...pts[1]!), ...P(...pts[2]!), ...P(...pts[3]!)); ctx.stroke();
    };
    draw(w * ppu + 12, 'rgba(120,150,60,.5)'); draw(w * ppu, '#d8bf8a'); draw(w * ppu * 0.45, '#e8d6a8');
  };
  path([[-2.6, 4.6], [-3.4, 6.6], [-1.6, 7.6], [-2.4, 9.6]], 0.75);
  path([[5, -4.0], [6.8, -5.8], [4.6, -7.4], [6.2, -9.6]], 0.7);
  path([[-4.4, 2.6], [-5.4, 2.9], [-5.9, 2.7], [-6.6, 3.0]], 0.6);
  for (let i = 0; i < 2600; i++) { // pebble speckle (only shows on paths thanks to low alpha)
    ctx.fillStyle = 'rgba(150,120,80,.18)'; ctx.fillRect(rand(0, W), rand(0, H), 2, 2);
  }

  // 4. flowers
  for (let i = 0; i < 3000; i++) {
    ctx.fillStyle = pick(['#f6dc5e', '#fff8e0', '#f6dc5e', '#f7b6c8', '#ffffff']);
    ctx.globalAlpha = rand(0.55, 0.95);
    ctx.beginPath(); ctx.arc(rand(0, W), rand(0, H), rand(1.4, 3.2), 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // 5. pond with sandy shore, ripples and reeds
  {
    const [cx, cy] = P(POND.x, POND.z);
    ctx.fillStyle = '#d9c58f'; ctx.beginPath(); ctx.ellipse(cx, cy, (POND.rx + 0.35) * ppu, (POND.rz + 0.35) * ppu, 0, 0, 7); ctx.fill();
    const g = ctx.createRadialGradient(cx - 30, cy - 15, 15, cx, cy, POND.rx * ppu);
    g.addColorStop(0, '#8cc3ee'); g.addColorStop(1, '#4f8fcf');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, POND.rx * ppu, POND.rz * ppu, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 3.5;
    for (let i = 0; i < 22; i++) {
      const a = rand(0, 6.28), rr = rand(0.2, 0.8);
      ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * POND.rx * ppu * rr, cy + Math.sin(a) * POND.rz * ppu * rr, rand(12, 32), rand(3, 7), 0, 0, 3.14); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(50,95,40,.8)'; ctx.lineWidth = 3;
    for (let i = 0; i < 140; i++) {
      const a = rand(0, 6.28), x = cx + Math.cos(a) * (POND.rx + 0.25) * ppu, y = cy + Math.sin(a) * (POND.rz + 0.25) * ppu;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + rand(-4, 4), y - rand(9, 20)); ctx.stroke();
    }
  }

  // 6. darker trampled grass under the concrete slab edge (the slab itself is a PBR mesh)
  {
    const [x0, y0] = P(PLAZA.x0, PLAZA.z0), [x1, y1] = P(PLAZA.x1, PLAZA.z1);
    ctx.fillStyle = 'rgba(70,110,40,.45)'; ctx.beginPath();
    ctx.roundRect(x0 - 10, y0 - 6, x1 - x0 + 20, y1 - y0 + 20, PLAZA.radius * ppu + 8); ctx.fill();
  }
  ctx.restore();

  // 7. fuzzy grass fringe around the island edge
  const fr = ['#5c9a38', '#7cb547', '#4a8530', '#92c45a', '#6aa83f'];
  for (const [px, py, nx, ny] of perimeter(m, m, W - 2 * m, H - 2 * m, R, 2.4)) for (let q = 0; q < 2; q++) {
    const len = rand(8, 34), back = rand(6, 22), tx = -ny, ty = nx, j = rand(-6, 6);
    ctx.strokeStyle = pick(fr); ctx.lineWidth = rand(2.2, 4.4);
    ctx.beginPath(); ctx.moveTo(px - nx * back + tx * j, py - ny * back + ty * j);
    ctx.lineTo(px + nx * len + tx * (j + rand(-8, 8)), py + ny * len + ty * (j + rand(-8, 8))); ctx.stroke();
  }

  const map = colorTex(cv, aniso);
  const normalMap = dataTex(normalFromHeight(cv, 2.2), aniso);
  return { map, normalMap, inset: m / ppu, radius: R / ppu };
}

/* ------------------------------------------------------------------ */
/* Painted decals on the concrete plaza                                 */
/* ------------------------------------------------------------------ */

export function paintPlazaDecal(aniso: number) {
  const w = PLAZA.x1 - PLAZA.x0, d = PLAZA.z1 - PLAZA.z0, ppu = 120;
  const { c, ctx } = canvas(Math.round(w * ppu), Math.round(d * ppu));
  const P = (x: number, z: number): [number, number] => [(x - PLAZA.x0) * ppu, (z - PLAZA.z0) * ppu];
  // expansion joints
  ctx.strokeStyle = 'rgba(110,95,75,.38)'; ctx.lineWidth = 3;
  for (let x = PLAZA.x0 + 2.2; x < PLAZA.x1; x += 2.2) { const [px] = P(x, 0); ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, c.height); ctx.stroke(); }
  for (let z = PLAZA.z0 + 2.2; z < PLAZA.z1; z += 2.2) { const [, py] = P(0, z); ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(c.width, py); ctx.stroke(); }
  // pink "BAA" floor art
  const [cx, cy] = P(2.0, 0.7);
  ctx.fillStyle = 'rgba(255,143,163,.42)'; ctx.beginPath(); ctx.arc(cx, cy, 1.35 * ppu, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(255,143,163,.7)'; ctx.lineWidth = 7; ctx.setLineDash([20, 16]);
  ctx.beginPath(); ctx.arc(cx, cy, 1.75 * ppu, 0, 7); ctx.stroke(); ctx.setLineDash([]);
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.12);
  ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = `700 ${0.8 * ppu}px Fredoka, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('BAA', 0, 6); ctx.restore();
  // yellow curb dashes along the rail
  const [rx0, ry] = P(RAIL.a.x - 0.3, RAIL.a.z + 0.55), [rx1] = P(RAIL.b.x + 0.3, 0);
  ctx.fillStyle = 'rgba(255,209,102,.75)';
  for (let x = rx0; x < rx1; x += 42) ctx.fillRect(x, ry, 24, 8);
  // skid marks + scuffs (wear tells the story of a used park)
  ctx.lineCap = 'round';
  for (let i = 0; i < 26; i++) {
    const x = rand(0, c.width), y = rand(0, c.height), a = rand(0, 6.28), l = rand(30, 120);
    ctx.strokeStyle = `rgba(60,50,45,${rand(0.05, 0.12)})`; ctx.lineWidth = rand(4, 8);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * l * 0.6 + rand(-20, 20), y + Math.sin(a) * l * 0.6 + rand(-20, 20), x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke();
  }
  return colorTex(c, aniso);
}

/* ------------------------------------------------------------------ */
/* Wool fibre normal map (tileable curls)                               */
/* ------------------------------------------------------------------ */

export function woolNormal(aniso: number) {
  const S = 512, { c, ctx } = canvas(S, S);
  ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, S, S);
  const r = rng(5);
  for (let i = 0; i < 1400; i++) {
    const x = r() * S, y = r() * S, rad = 4 + r() * 10;
    for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) { // tile seamlessly
      const g = ctx.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rad);
      g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x + ox, y + oy, rad, 0, 7); ctx.fill();
    }
  }
  ctx.lineCap = 'round';
  for (let i = 0; i < 900; i++) { // crimped fibres
    const x = r() * S, y = r() * S, a = r() * 6.28;
    ctx.strokeStyle = `rgba(${r() < 0.5 ? '255,255,255' : '0,0,0'},.18)`; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(x, y, 3 + r() * 5, a, a + 2.4); ctx.stroke();
  }
  const t = dataTex(normalFromHeight(c, 3), aniso);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3);
  return t;
}

/* ------------------------------------------------------------------ */
/* Small utility textures                                               */
/* ------------------------------------------------------------------ */

export function radialTex(inner: string, outer: string, size = 128) {
  const { c, ctx } = canvas(size, size), h = size / 2;
  const g = ctx.createRadialGradient(h, h, size * 0.03, h, h, h);
  g.addColorStop(0, inner); g.addColorStop(1, outer);
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

/** Configure a loaded PBR set: color maps sRGB, data maps linear, tiled with anisotropy. */
export function setupPbr(maps: { map: THREE.Texture; normalMap: THREE.Texture; roughnessMap: THREE.Texture }, repeat: number, aniso: number) {
  maps.map.colorSpace = THREE.SRGBColorSpace;
  maps.normalMap.colorSpace = THREE.NoColorSpace;
  maps.roughnessMap.colorSpace = THREE.NoColorSpace;
  for (const t of Object.values(maps)) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); t.anisotropy = aniso; t.needsUpdate = true;
  }
  return maps;
}

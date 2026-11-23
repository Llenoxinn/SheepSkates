import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BOARD_ART_SPECS, getDeckArtMat, getGripArtMat, getPlyArtMat, type BoardArt } from './boardArt';
import { clamp } from './math';

export type BoardStyle = 'street' | 'cruiser' | 'oldschool' | 'pintail';

export const BOARD_STYLES = ['street', 'cruiser', 'oldschool', 'pintail'] as const;

export interface BoardSpec {
  id: BoardStyle;
  label: string;
  subtitle: string;
  dimsLabel: string;
  wheelRadius: number;
  wheelWidth: number;
  wheelX: number;
  wheelY: number;
  truckZ: readonly [number, number];
  hangerW: number;
  reverseKingpin?: boolean;
}

export const BOARD_SPECS: Record<BoardStyle, BoardSpec> = {
  street: {
    id: 'street',
    label: 'Street',
    subtitle: 'Classic Popsicle',
    dimsLabel: '0.72 × 1.02 m',
    wheelRadius: 0.056,
    wheelWidth: 0.05,
    wheelX: 0.165,
    wheelY: -0.095,
    truckZ: [-0.32, 0.32],
    hangerW: 0.28,
  },
  cruiser: {
    id: 'cruiser',
    label: 'Cruiser',
    subtitle: 'Retro Fish',
    dimsLabel: '0.72 × 1.02 m',
    wheelRadius: 0.063,
    wheelWidth: 0.062,
    wheelX: 0.178,
    wheelY: -0.088,
    truckZ: [-0.29, 0.3],
    hangerW: 0.3,
  },
  oldschool: {
    id: 'oldschool',
    label: 'Old School',
    subtitle: '80s Pool',
    dimsLabel: '0.74 × 1.02 m',
    wheelRadius: 0.062,
    wheelWidth: 0.058,
    wheelX: 0.212,
    wheelY: -0.089,
    truckZ: [-0.32, 0.32],
    hangerW: 0.36,
  },
  pintail: {
    id: 'pintail',
    label: 'Pintail',
    subtitle: 'Meadow Longboard',
    dimsLabel: '0.72 × 1.24 m',
    wheelRadius: 0.066,
    wheelWidth: 0.062,
    wheelX: 0.185,
    wheelY: -0.085,
    truckZ: [-0.43, 0.43],
    hangerW: 0.31,
    reverseKingpin: true,
  },
};

export function isBoardStyle(v: unknown): v is BoardStyle {
  return v === 'street' || v === 'cruiser' || v === 'oldschool' || v === 'pintail';
}

/* ------------------------------------------------------------------ */
/* Parametric bevel-lofted skateboard deck & grip builders            */
/* ------------------------------------------------------------------ */

type DeckProfile = {
  zMin: number;
  zMax: number;
  zStations: number[];
  outerW: (z: number) => number;
  innerW: (z: number) => number;
  kickY: (z: number) => number;
};

/** Monotone cubic Hermite spline (Fritsch-Carlson) over ascending (z, w) knots. */
function makePchip(knots: readonly (readonly [number, number])[]): (z: number) => number {
  const n = knots.length;
  const xs = knots.map(k => k[0]);
  const ys = knots.map(k => k[1]);
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1]! - ys[i]!) / (xs[i + 1]! - xs[i]!));
  const m = new Array<number>(n).fill(0);
  m[0] = d[0]!;
  m[n - 1] = d[n - 2]!;
  for (let i = 1; i < n - 1; i++) {
    const a = d[i - 1]!, b = d[i]!;
    m[i] = a * b <= 0 ? 0 : (a + b) * 0.5;
  }
  for (let i = 0; i < n - 1; i++) {
    const di = d[i]!;
    if (Math.abs(di) < 1e-8) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i]! / di, b = m[i + 1]! / di;
    const s = a * a + b * b;
    if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * di; m[i + 1] = t * b * di; }
  }
  return (z: number) => {
    if (z <= xs[0]!) return ys[0]!;
    if (z >= xs[n - 1]!) return ys[n - 1]!;
    let lo = 0, hi = n - 2;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (z < xs[mid]!) hi = mid - 1;
      else if (z > xs[mid + 1]!) lo = mid + 1;
      else { lo = mid; break; }
    }
    const h = xs[lo + 1]! - xs[lo]!, t = (z - xs[lo]!) / h, t2 = t * t, t3 = t2 * t;
    const h00 = 2 * t3 - 3 * t2 + 1, h10 = t3 - 2 * t2 + t, h01 = -2 * t3 + 3 * t2, h11 = t3 - t2;
    return Math.max(0, h00 * ys[lo]! + h10 * h * m[lo]! + h01 * ys[lo + 1]! + h11 * h * m[lo + 1]!);
  };
}

const CRUISER_OUTER = makePchip([
  [-0.54, 0.134], [-0.5, 0.156], [-0.44, 0.175], [-0.34, 0.186], [-0.24, 0.188], [-0.14, 0.192],
  [0.04, 0.212], [0.2, 0.23], [0.3, 0.222], [0.4, 0.19], [0.46, 0.125], [0.5, 0],
]);

const OLDSCHOOL_OUTER = makePchip([
  [-0.54, 0.175], [-0.535, 0.185], [-0.51, 0.215], [-0.46, 0.238], [-0.32, 0.244], [-0.18, 0.232],
  [-0.02, 0.212], [0.14, 0.246], [0.26, 0.252], [0.36, 0.222], [0.46, 0.162], [0.54, 0.088], [0.58, 0],
]);

function buildStations(zMin: number, zMax: number, extras: number[], step = 0.032): number[] {
  const s = [zMin, zMax, ...extras];
  for (let z = zMin + step; z < zMax; z += step) s.push(z);
  for (const e of [0.008, 0.02, 0.04, 0.07]) {
    if (zMin + e < zMax) s.push(zMin + e);
    if (zMax - e > zMin) s.push(zMax - e);
  }
  s.sort((a, b) => a - b);
  const out: number[] = [];
  for (const v of s) if (v >= zMin - 1e-6 && v <= zMax + 1e-6 && (!out.length || v - out[out.length - 1]! > 1e-4)) out.push(clamp(v, zMin, zMax));
  return out;
}

function makeDeckProfile(style: BoardStyle): DeckProfile {
  if (style === 'street') {
    const outerW = (z: number) => {
      const az = Math.abs(z);
      return az <= 0.32 ? 0.21 : 0.21 * Math.sqrt(Math.max(0, 1 - ((az - 0.32) / 0.22) ** 2));
    };
    const kickY = (z: number) => (Math.abs(z) <= 0.32 ? 0 : 0.052 * ((Math.abs(z) - 0.32) / 0.22) ** 2);
    return { zMin: -0.54, zMax: 0.54, zStations: buildStations(-0.54, 0.54, [-0.32, 0.32]), outerW, innerW: () => 0, kickY };
  }
  if (style === 'cruiser') {
    const innerW = (z: number) => (z >= -0.39 ? 0 : 0.114 * Math.pow((-0.39 - z) / 0.15, 0.85));
    const kickY = (z: number) => (z > 0.34 ? 0.016 * ((z - 0.34) / 0.16) ** 2 : z < -0.3 ? 0.06 * ((-0.3 - z) / 0.24) ** 2 : 0);
    return {
      zMin: -0.54, zMax: 0.5,
      zStations: buildStations(-0.54, 0.5, [-0.48, -0.43, -0.39, -0.3, 0.34]),
      outerW: CRUISER_OUTER, innerW, kickY,
    };
  }
  if (style === 'oldschool') {
    const kickY = (z: number) => (z > 0.36 ? 0.022 * ((z - 0.36) / 0.22) ** 2 : z < -0.29 ? 0.068 * ((-0.29 - z) / 0.25) ** 2 : 0);
    return {
      zMin: -0.54, zMax: 0.58,
      zStations: buildStations(-0.54, 0.58, [-0.535, -0.51, -0.29, 0.36]),
      outerW: OLDSCHOOL_OUTER, innerW: () => 0, kickY,
    };
  }
  const outerW = (z: number) => {
    const s = clamp((z + 0.62) / 1.24, 0, 1);
    return 0.225 * Math.pow(Math.max(0, Math.sin(Math.PI * Math.pow(s, 1.14))), 0.72);
  };
  const kickY = (z: number) => (Math.abs(z) <= 0.3 ? 0 : 0.012 * ((Math.abs(z) - 0.3) / 0.32) ** 2);
  return { zMin: -0.62, zMax: 0.62, zStations: buildStations(-0.62, 0.62, [-0.3, 0.3]), outerW, innerW: () => 0, kickY };
}

function makeGripProfile(style: BoardStyle, base: DeckProfile): DeckProfile {
  const inset = 0.015;
  if (style !== 'cruiser') {
    const zMin = base.zMin + 0.018, zMax = base.zMax - 0.018;
    const outerW = (z: number) => {
      if (z <= zMin || z >= zMax) return 0;
      const tip = Math.min(1, Math.min(z - zMin, zMax - z) / 0.026);
      return Math.max(0, base.outerW(z) - inset) * Math.sqrt(tip);
    };
    return { zMin, zMax, zStations: buildStations(zMin, zMax, [-0.32, -0.29, 0.3, 0.36]), outerW, innerW: () => 0, kickY: base.kickY };
  }
  const zMin = -0.526, zMax = base.zMax - 0.018;
  const innerW = (z: number) => (z >= -0.376 ? 0 : z >= -0.39 ? ((-0.376 - z) / 0.014) * inset : base.innerW(z) + inset);
  const outerW = (z: number) => {
    if (z >= zMax) return 0;
    const w = Math.max(0, base.outerW(z) - inset);
    return z <= zMin ? innerW(z) : Math.max(innerW(z), w);
  };
  return { zMin, zMax, zStations: buildStations(zMin, zMax, [-0.45, -0.39, -0.376, -0.3, 0.34]), outerW, innerW, kickY: base.kickY };
}

function pushTri(
  pos: number[], norm: number[], uv: number[],
  ax: number, ay: number, az: number, anx: number, any: number, anz: number, au: number, av: number,
  bx: number, by: number, bz: number, bnx: number, bny: number, bnz: number, bu: number, bv: number,
  cx: number, cy: number, cz: number, cnx: number, cny: number, cnz: number, cu: number, cv: number,
) {
  const ux = bx - ax, uy = by - ay, uz = bz - az;
  const vx = cx - ax, vy = cy - ay, vz = cz - az;
  const crx = uy * vz - uz * vy, cry = uz * vx - ux * vz, crz = ux * vy - uy * vx;
  if (crx * crx + cry * cry + crz * crz < 1e-16) return;
  pos.push(ax, ay, az, bx, by, bz, cx, cy, cz);
  norm.push(anx, any, anz, bnx, bny, bnz, cnx, cny, cnz);
  uv.push(au, av, bu, bv, cu, cv);
}

function buildLoftedBoardGeo(p: DeckProfile, yBot: number, yTop: number, bevel: number, groupMode: 'deck' | 'grip'): THREE.BufferGeometry {
  const pos: number[] = [], norm: number[] = [], uv: number[] = [];
  const slope = (z: number) => (p.kickY(Math.min(p.zMax, z + 0.002)) - p.kickY(Math.max(p.zMin, z - 0.002))) / 0.004;
  const capNorm = (z: number, up: number): [number, number, number] => {
    const sl = slope(z), len = Math.hypot(1, sl) || 1;
    return [0, up / len, (-up * sl) / len];
  };
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  let maxW = 0.01;
  for (const z of p.zStations) maxW = Math.max(maxW, p.outerW(z));
  const zSpan = Math.max(1e-4, p.zMax - p.zMin);
  const uTop = (x: number) => clamp(0.5 - x / (2 * maxW), 0, 1);
  const uBot = (x: number) => clamp(0.5 + x / (2 * maxW), 0, 1);
  const vZ = (z: number) => clamp((z - p.zMin) / zSpan, 0, 1);

  // 1a. Top cap (yTop, +Y normal — group 0 on both deck and grip)
  for (let i = 0; i < p.zStations.length - 1; i++) {
    const z0 = p.zStations[i]!, z1 = p.zStations[i + 1]!;
    const out0 = p.outerW(z0), in0 = p.innerW(z0), out1 = p.outerW(z1), in1 = p.innerW(z1);
    const k0 = p.kickY(z0), k1 = p.kickY(z1);
    const [tnx0, tny0, tnz0] = capNorm(z0, 1), [tnx1, tny1, tnz1] = capNorm(z1, 1);
    const halves: readonly [number, number, number, number][] = [[-out0, -in0, -out1, -in1], [in0, out0, in1, out1]];
    for (const [l0, r0, l1, r1] of halves) {
      if (Math.max(r0 - l0, r1 - l1) <= 1e-6) continue;
      for (let j = 0; j < 2; j++) {
        const t0 = j * 0.5, t1 = (j + 1) * 0.5;
        const ax = lerp(l0, r0, t0), bx = lerp(l0, r0, t1), dx = lerp(l1, r1, t0), cx = lerp(l1, r1, t1);
        pushTri(pos, norm, uv, ax, yTop + k0, z0, tnx0, tny0, tnz0, uTop(ax), vZ(z0), dx, yTop + k1, z1, tnx1, tny1, tnz1, uTop(dx), vZ(z1), cx, yTop + k1, z1, tnx1, tny1, tnz1, uTop(cx), vZ(z1));
        pushTri(pos, norm, uv, ax, yTop + k0, z0, tnx0, tny0, tnz0, uTop(ax), vZ(z0), cx, yTop + k1, z1, tnx1, tny1, tnz1, uTop(cx), vZ(z1), bx, yTop + k0, z0, tnx0, tny0, tnz0, uTop(bx), vZ(z0));
      }
    }
  }
  const topVerts = pos.length / 3;

  // 1b. Bottom cap (yBot, -Y normal — underside artwork)
  for (let i = 0; i < p.zStations.length - 1; i++) {
    const z0 = p.zStations[i]!, z1 = p.zStations[i + 1]!;
    const out0 = p.outerW(z0), in0 = p.innerW(z0), out1 = p.outerW(z1), in1 = p.innerW(z1);
    const k0 = p.kickY(z0), k1 = p.kickY(z1);
    const [tnx0, tny0, tnz0] = capNorm(z0, 1), [tnx1, tny1, tnz1] = capNorm(z1, 1);
    const halves: readonly [number, number, number, number][] = [[-out0, -in0, -out1, -in1], [in0, out0, in1, out1]];
    for (const [l0, r0, l1, r1] of halves) {
      if (Math.max(r0 - l0, r1 - l1) <= 1e-6) continue;
      for (let j = 0; j < 2; j++) {
        const t0 = j * 0.5, t1 = (j + 1) * 0.5;
        const ax = lerp(l0, r0, t0), bx = lerp(l0, r0, t1), dx = lerp(l1, r1, t0), cx = lerp(l1, r1, t1);
        pushTri(pos, norm, uv, ax, yBot + k0, z0, -tnx0, -tny0, -tnz0, uBot(ax), vZ(z0), bx, yBot + k0, z0, -tnx0, -tny0, -tnz0, uBot(bx), vZ(z0), cx, yBot + k1, z1, -tnx1, -tny1, -tnz1, uBot(cx), vZ(z1));
        pushTri(pos, norm, uv, ax, yBot + k0, z0, -tnx0, -tny0, -tnz0, uBot(ax), vZ(z0), cx, yBot + k1, z1, -tnx1, -tny1, -tnz1, uBot(cx), vZ(z1), dx, yBot + k1, z1, -tnx1, -tny1, -tnz1, uBot(dx), vZ(z1));
      }
    }
  }
  const capVerts = pos.length / 3;

  // 2. Closed perimeter polygon (CCW in XZ viewed from +Y)
  const rawPts: [number, number][] = [];
  for (const z of p.zStations) rawPts.push([p.outerW(z), z]);
  for (let i = p.zStations.length - 1; i >= 0; i--) rawPts.push([-p.outerW(p.zStations[i]!), p.zStations[i]!]);
  for (const z of p.zStations) if (p.innerW(z) > 1e-5) rawPts.push([-p.innerW(z), z]);
  const notchIdx = p.zStations.findIndex(z => p.innerW(z) > 1e-5);
  if (notchIdx >= 0) {
    const firstAfter = p.zStations.findIndex(z => p.innerW(z) <= 1e-5);
    if (firstAfter >= 0) rawPts.push([0, p.zStations[firstAfter]!]);
  }
  for (let i = p.zStations.length - 1; i >= 0; i--) if (p.innerW(p.zStations[i]!) > 1e-5) rawPts.push([p.innerW(p.zStations[i]!), p.zStations[i]!]);

  const pts: [number, number][] = [];
  for (const pt of rawPts) {
    const prev = pts[pts.length - 1];
    if (!prev || Math.hypot(pt[0] - prev[0], pt[1] - prev[1]) > 1e-5) pts.push(pt);
  }
  if (pts.length > 1 && Math.hypot(pts[0]![0] - pts[pts.length - 1]![0], pts[0]![1] - pts[pts.length - 1]![1]) <= 1e-5) pts.pop();

  const N = pts.length;
  const nx = new Float64Array(N), nz = new Float64Array(N), perimU = new Float64Array(N + 1);
  for (let i = 0; i < N; i++) {
    const a = pts[(i - 1 + N) % N]!, b = pts[i]!, c = pts[(i + 1) % N]!;
    const t1x = b[0] - a[0], t1z = b[1] - a[1], l1 = Math.hypot(t1x, t1z) || 1;
    const t2x = c[0] - b[0], t2z = c[1] - b[1], l2 = Math.hypot(t2x, t2z) || 1;
    const n1x = t1z / l1, n1z = -t1x / l1, n2x = t2z / l2, n2z = -t2x / l2;
    const sx = n1x + n2x, sz = n1z + n2z, sl = Math.hypot(sx, sz);
    nx[i] = sl > 1e-4 ? sx / sl : n2x;
    nz[i] = sl > 1e-4 ? sz / sl : n2z;
    perimU[i + 1] = perimU[i]! + l2 * 2.2;
  }

  const bevH = Math.min(0.007, (yTop - yBot) * 0.25);
  const rings = [
    { dr: 0, dy: yBot, v: 0 },
    { dr: bevel, dy: yBot + bevH, v: 0.16 },
    { dr: bevel, dy: yTop - bevH, v: 0.84 },
    { dr: 0, dy: yTop, v: 1 },
  ] as const;

  for (let r = 0; r < 3; r++) {
    const ra = rings[r]!, rb = rings[r + 1]!;
    const dr = rb.dr - ra.dr, dy = rb.dy - ra.dy, rl = Math.hypot(dr, dy) || 1;
    const nr = dy / rl, ny = -dr / rl;
    for (let i = 0; i < N; i++) {
      const i1 = (i + 1) % N;
      const x0 = pts[i]![0], z0 = pts[i]![1], k0 = p.kickY(z0), u0 = perimU[i]!;
      const x1 = pts[i1]![0], z1 = pts[i1]![1], k1 = p.kickY(z1), u1 = perimU[i + 1]!;
      const ax = x0 + nx[i]! * ra.dr, ay = ra.dy + k0, az = z0 + nz[i]! * ra.dr;
      const bx = x0 + nx[i]! * rb.dr, by = rb.dy + k0, bz = z0 + nz[i]! * rb.dr;
      const cx = x1 + nx[i1]! * rb.dr, cy = rb.dy + k1, cz = z1 + nz[i1]! * rb.dr;
      const dx = x1 + nx[i1]! * ra.dr, dyv = ra.dy + k1, dz = z1 + nz[i1]! * ra.dr;
      const n0z = nz[i]! * nr - ny * slope(z0), n0x = nx[i]! * nr, nl0 = Math.hypot(n0x, ny, n0z) || 1;
      const n1z = nz[i1]! * nr - ny * slope(z1), n1x = nx[i1]! * nr, nl1 = Math.hypot(n1x, ny, n1z) || 1;
      pushTri(pos, norm, uv, ax, ay, az, n0x / nl0, ny / nl0, n0z / nl0, u0, ra.v, bx, by, bz, n0x / nl0, ny / nl0, n0z / nl0, u0, rb.v, cx, cy, cz, n1x / nl1, ny / nl1, n1z / nl1, u1, rb.v);
      pushTri(pos, norm, uv, ax, ay, az, n0x / nl0, ny / nl0, n0z / nl0, u0, ra.v, cx, cy, cz, n1x / nl1, ny / nl1, n1z / nl1, u1, rb.v, dx, dyv, dz, n1x / nl1, ny / nl1, n1z / nl1, u1, ra.v);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(norm, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  const totalVerts = pos.length / 3;
  if (groupMode === 'deck') {
    g.addGroup(0, capVerts, 0);
    g.addGroup(capVerts, totalVerts - capVerts, 1);
  } else {
    g.addGroup(0, topVerts, 0);
    g.addGroup(topVerts, totalVerts - topVerts, 1);
  }
  g.computeBoundingSphere();
  return g;
}

/* ------------------------------------------------------------------ */
/* Hardware geometry builders (merged once per style)                 */
/* ------------------------------------------------------------------ */

function prepPart(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const ng = g.index ? g.toNonIndexed() : g;
  if (!ng.getAttribute('normal')) ng.computeVertexNormals();
  if (!ng.getAttribute('uv')) {
    ng.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(ng.getAttribute('position').count * 2), 2));
  }
  for (const k of Object.keys(ng.attributes)) {
    if (k !== 'position' && k !== 'normal' && k !== 'uv') ng.deleteAttribute(k);
  }
  return ng;
}

function buildWheelGeo(r: number, w: number): THREE.BufferGeometry {
  const tirePts = [
    new THREE.Vector2(r * 0.56, -w * 0.44),
    new THREE.Vector2(r * 0.88, -w * 0.48),
    new THREE.Vector2(r, -w * 0.3),
    new THREE.Vector2(r, w * 0.3),
    new THREE.Vector2(r * 0.88, w * 0.48),
    new THREE.Vector2(r * 0.56, w * 0.44),
  ];
  const tire = new THREE.LatheGeometry(tirePts, 24);
  tire.rotateZ(Math.PI / 2);

  const hub = new THREE.CylinderGeometry(r * 0.57, r * 0.57, w * 0.9, 20);
  hub.rotateZ(Math.PI / 2);

  const dotParts: THREE.BufferGeometry[] = [];
  const depth = 0.008 * (r / 0.056);
  const orbit = r * 0.36;
  for (const side of [-1, 1]) {
    const nut = new THREE.CylinderGeometry(r * 0.13, r * 0.13, depth * 1.4, 6);
    nut.rotateZ(Math.PI / 2);
    nut.translate(side * w * 0.452, 0, 0);
    dotParts.push(prepPart(nut));
    for (let i = 0; i < 3; i++) {
      const ang = (i * Math.PI * 2) / 3;
      const dotR = (i === 0 ? 0.145 : 0.115) * r;
      const dot = new THREE.CylinderGeometry(dotR, dotR, depth, 12);
      dot.rotateZ(Math.PI / 2);
      dot.translate(side * w * 0.454, Math.cos(ang) * orbit, Math.sin(ang) * orbit);
      dotParts.push(prepPart(dot));
    }
  }
  const dots = mergeGeometries(dotParts)!;
  return mergeGeometries([prepPart(tire), prepPart(hub), prepPart(dots)], true)!;
}

const _up = new THREE.Vector3(0, 1, 0);
const _dir = new THREE.Vector3();
const _mid = new THREE.Vector3();
const _q = new THREE.Quaternion();
function strutBetween(rTop: number, rBot: number, a: THREE.Vector3, b: THREE.Vector3, seg = 10): THREE.BufferGeometry {
  const len = a.distanceTo(b);
  const g = new THREE.CylinderGeometry(rTop, rBot, len, seg);
  _dir.copy(b).sub(a).normalize();
  _q.setFromUnitVectors(_up, _dir);
  _mid.copy(a).add(b).multiplyScalar(0.5);
  g.applyQuaternion(_q);
  g.translate(_mid.x, _mid.y, _mid.z);
  return prepPart(g);
}

function buildTruckGeo(spec: BoardSpec): THREE.BufferGeometry {
  const wy = spec.wheelY;
  const tiltZ = spec.reverseKingpin ? 0.024 : -0.022;
  const base = new RoundedBoxGeometry(0.115, 0.014, 0.145, 2, 0.004);
  base.translate(0, -0.031, 0);

  const yoke = new THREE.CylinderGeometry(0.023, 0.023, 0.05, 12);
  yoke.rotateZ(Math.PI / 2);
  yoke.translate(0, wy, 0);

  const axle = new THREE.CylinderGeometry(0.0085, 0.0085, spec.wheelX * 2 + 0.012, 10);
  axle.rotateZ(Math.PI / 2);
  axle.translate(0, wy, 0);

  const wings: THREE.BufferGeometry[] = [];
  for (const s of [-1, 1]) {
    const wing = new THREE.CylinderGeometry(0.015, 0.022, spec.hangerW * 0.5, 10);
    wing.rotateZ((s * Math.PI) / 2);
    wing.translate(s * spec.hangerW * 0.25, wy, 0);
    wings.push(prepPart(wing));
  }
  const pivotArm = strutBetween(0.014, 0.017, new THREE.Vector3(0, -0.035, -tiltZ * 1.1), new THREE.Vector3(0, wy, 0));
  const metal = mergeGeometries([prepPart(base), prepPart(yoke), prepPart(axle), pivotArm, ...wings])!;

  const kpA = new THREE.Vector3(0, -0.036, tiltZ);
  const kpB = new THREE.Vector3(0, wy + 0.009, 0);
  const kingpin = strutBetween(0.019, 0.022, kpA, kpB);
  const collar = strutBetween(0.025, 0.025, kpA.clone().lerp(kpB, 0.28), kpA.clone().lerp(kpB, 0.72));
  const bushing = mergeGeometries([kingpin, collar])!;

  return mergeGeometries([prepPart(metal), prepPart(bushing)], true)!;
}

/* ------------------------------------------------------------------ */
/* Pooled registries (built once per style / color)                   */
/* ------------------------------------------------------------------ */

const BOARD_GEO: Record<BoardStyle, { deck: THREE.BufferGeometry; grip: THREE.BufferGeometry; truck: THREE.BufferGeometry; wheel: THREE.BufferGeometry }> = {
  street: buildStyleGeos('street'),
  cruiser: buildStyleGeos('cruiser'),
  oldschool: buildStyleGeos('oldschool'),
  pintail: buildStyleGeos('pintail'),
};

function buildStyleGeos(style: BoardStyle) {
  const spec = BOARD_SPECS[style];
  const prof = makeDeckProfile(style);
  const gripProf = makeGripProfile(style, prof);
  return {
    deck: buildLoftedBoardGeo(prof, -0.025, 0.021, 0.005, 'deck'),
    grip: buildLoftedBoardGeo(gripProf, 0.02, 0.026, 0.002, 'grip'),
    truck: buildTruckGeo(spec),
    wheel: buildWheelGeo(spec.wheelRadius, spec.wheelWidth),
  };
}

const GRIP_EDGE_MAT = new THREE.MeshStandardMaterial({ color: '#32303a', roughness: 0.95 });
const BUSHING_MAT = new THREE.MeshStandardMaterial({ color: '#45404b', roughness: 0.78 });

const TRUCK_METAL_MATS = {
  street: new THREE.MeshStandardMaterial({ color: '#c6cbd4', metalness: 0.82, roughness: 0.28 }),
  oldschool: new THREE.MeshStandardMaterial({ color: '#2f2c35', metalness: 0.35, roughness: 0.6 }),
  pintail: new THREE.MeshStandardMaterial({ color: '#d6a856', metalness: 0.78, roughness: 0.3 }),
  cruiserMint: new THREE.MeshPhysicalMaterial({ color: '#89d9c0', roughness: 0.36, metalness: 0.22, clearcoat: 0.35 }),
  cruiserCoral: new THREE.MeshPhysicalMaterial({ color: '#ff9886', roughness: 0.36, metalness: 0.22, clearcoat: 0.35 }),
};

function truckMatFor(style: BoardStyle, art: BoardArt): THREE.Material {
  if (style === 'cruiser') return BOARD_ART_SPECS[art].cruiserTruck === 'mint' ? TRUCK_METAL_MATS.cruiserMint : TRUCK_METAL_MATS.cruiserCoral;
  return TRUCK_METAL_MATS[style];
}

const wheelMatPool = new Map<string, THREE.MeshStandardMaterial[]>();
const _mixCol = new THREE.Color();
const _targetCol = new THREE.Color();
function getWheelMats(style: BoardStyle, art: BoardArt): THREE.MeshStandardMaterial[] {
  const key = `${style}:${art}`;
  const hit = wheelMatPool.get(key);
  if (hit) return hit;
  const s = BOARD_ART_SPECS[art];
  const mix = (hex: string, target: string, k: number) => `#${_mixCol.set(hex).lerp(_targetCol.set(target), k).getHexString()}`;
  const mk = (tire: string, hub: string, dots: string) => [
    new THREE.MeshStandardMaterial({ color: tire, roughness: 0.44 }),
    new THREE.MeshStandardMaterial({ color: hub, roughness: 0.38, metalness: 0.15 }),
    new THREE.MeshStandardMaterial({ color: dots, roughness: 0.35, metalness: 0.2 }),
  ];
  const mats = style === 'street'
    ? mk('#f7efe0', s.baseHex, '#2b262a')
    : style === 'cruiser'
      ? mk(s.wheelTint, '#fbf5e8', '#3a2f2b')
      : style === 'oldschool'
        ? mk('#f0e7d4', '#302c35', s.accentHex)
        : mk(mix(s.wheelTint, '#f4cf86', 0.35), '#faf2e2', '#4a3525');
  wheelMatPool.set(key, mats);
  return mats;
}

/** Populates a board Group from pooled geometries and materials. Returns wheel radius. */
export function populateBoardGroup(board: THREE.Group, style: BoardStyle, art: BoardArt, wheelsOut: THREE.Mesh[]): number {
  const spec = BOARD_SPECS[style];
  const geo = BOARD_GEO[style];
  board.clear();
  wheelsOut.length = 0;

  board.add(new THREE.Mesh(geo.deck, [getDeckArtMat(art), getPlyArtMat(art)]));
  board.add(new THREE.Mesh(geo.grip, [getGripArtMat(art), GRIP_EDGE_MAT]));

  const truckMats = [truckMatFor(style, art), BUSHING_MAT];
  const wheelMats = getWheelMats(style, art);
  spec.truckZ.forEach((zz, idx) => {
    const truck = new THREE.Mesh(geo.truck, truckMats);
    truck.position.set(0, 0, zz);
    if (spec.reverseKingpin && idx === 0) truck.rotation.y = Math.PI;
    board.add(truck);
    for (const sx of [-1, 1]) {
      const wheel = new THREE.Mesh(geo.wheel, wheelMats);
      wheel.position.set(sx * spec.wheelX, spec.wheelY, zz);
      board.add(wheel);
      wheelsOut.push(wheel);
    }
  });

  board.traverse(n => {
    if ((n as THREE.Mesh).isMesh) { n.castShadow = true; n.receiveShadow = true; }
  });
  return spec.wheelRadius;
}

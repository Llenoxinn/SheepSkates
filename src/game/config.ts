import { Vector3 } from 'three';

/** Island footprint in world units (≈ metres). */
export const IW = 26;
export const IH = 18;
export const PLAZA = { x0: -4.5, x1: 8.5, z0: -4.2, z1: 4.8, radius: 1.6 } as const;
export const POND = { x: -8.7, z: 3.3, rx: 2.5, rz: 1.75 } as const;
export const RAIL = { a: new Vector3(-0.8, 0, -2.6), b: new Vector3(4.8, 0, -2.6), top: 0.5 } as const;
export const SHEEP_SCALE = 1.25;
/** Board-group height while sliding on the rail. */
export const RAIL_Y = RAIL.top - 0.135 * SHEEP_SCALE;
export const PLAZA_TOP = 0.012;
export const GRAVITY = 18;
export const BOUNDS = { x: 12.1, z: 8.1 } as const;

export const BOARD_COLORS = ['#ff8fa3', '#6fd0b4', '#ffd166', '#a59cf5', '#7cc6fe', '#ff9f68', '#c3e88d'] as const;
export const NAMES = ['Woolbert', 'Baarbara', 'Lambo', 'Mutton Chop', 'Cotton', 'Clover', 'Nimbus', 'Biscuit', 'Tofu', 'Marsh', 'Dumpling', 'Fleecy', 'Pebble', 'Noodle', 'Juniper', 'Mochi'] as const;

/* ---------- layout data (single source of truth for meshes + collisions) ---------- */
export type TreeDef = { x: number; z: number; s: number; color: string };
export const TREES: TreeDef[] = [
  { x: -11.2, z: -6.6, s: 1.1, color: '#5aa63c' }, { x: -6.8, z: -7.2, s: 0.9, color: '#4f9a35' },
  { x: 10.6, z: -6.8, s: 1.2, color: '#5aa63c' }, { x: 11.3, z: 6.3, s: 1.05, color: '#4f9a35' },
  { x: -11.4, z: 0.4, s: 0.85, color: '#ee93b5' }, { x: -6.2, z: 7.0, s: 0.95, color: '#62ad43' },
  { x: 5.2, z: 7.3, s: 0.8, color: '#5aa63c' }, { x: 11.4, z: -1.4, s: 0.75, color: '#7dbb4a' },
  { x: -2.6, z: -7.4, s: 0.7, color: '#62ad43' }, { x: 8.6, z: 7.6, s: 0.6, color: '#e9a2c0' },
  { x: -11.2, z: 6.6, s: 0.7, color: '#5aa63c' },
];
export const BUSHES: [number, number][] = [[-9, -3.8], [-3.6, -6.2], [9.8, 3.4], [2.2, 6.6], [-7.4, -4.6], [10.4, -4.0]];
export const CONES: [number, number][] = [[0.4, 1.0], [5.4, 0.2], [-1.4, -0.8], [4.4, -0.9], [1.0, 4.0]];
export const QUARTER_PIPES = [
  { x: -2.9, z: 0.3, rotY: Math.PI, color: '#9fd8c6' },
  { x: 6.9, z: 0.3, rotY: 0, color: '#f6c9a0' },
] as const;
export const LEDGE = { x: 2.6, z: 2.7, w: 2.6, h: 0.38, d: 0.85, color: '#b8b0f2' } as const;

export type Obstacle = { x: number; z: number; r: number; h: number; tag?: 'rail' };
/** Collision circles. h < 0 means "always solid" (water). */
export const OBSTACLES: Obstacle[] = (() => {
  const o: Obstacle[] = [
    { x: POND.x - 1.0, z: POND.z, r: 1.7, h: -1 },
    { x: POND.x + 1.0, z: POND.z, r: 1.7, h: -1 },
  ];
  for (const t of TREES) o.push({ x: t.x, z: t.z, r: 0.8 * t.s, h: 3 });
  for (const [x, z] of BUSHES) o.push({ x, z, r: 0.55, h: 0.6 });
  for (const zz of [-0.9, 0.3, 1.5]) o.push({ x: -3.7, z: zz, r: 0.95, h: 1.2 }, { x: 7.7, z: zz, r: 0.95, h: 1.2 });
  for (const dx of [-1, 0, 1]) o.push({ x: LEDGE.x + dx, z: LEDGE.z, r: 0.62, h: 0.4 });
  for (let x = RAIL.a.x; x <= RAIL.b.x + 0.01; x += 0.8) o.push({ x, z: RAIL.a.z, r: 0.3, h: 0.56, tag: 'rail' });
  return o;
})();

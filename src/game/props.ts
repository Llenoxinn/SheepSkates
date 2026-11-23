import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { CONES, isOnPlaza, LEDGE, PLAZA_TOP, QUARTER_PIPES, RAIL, RAIL_Y, TREES, type Obstacle } from './config';
import { clamp, easeInBack, easeOutBack, rng } from './math';
import { envState } from './weather';

export type PropKind = 'ramp' | 'rail' | 'ledge' | 'cone' | 'bench' | 'tree';

export type PropDef = {
  kind: PropKind;
  x: number;
  z: number;
  rotY?: number;
  scale?: number;
  color?: string;
  length?: number;
};

export type RailSegment = {
  id: number;
  a: THREE.Vector3;
  b: THREE.Vector3;
  dir: THREE.Vector3;
  length: number;
  top: number;
  railY: number;
};

export type PropSpec = {
  label: string;
  defaultColor: string;
  defaultLength?: number;
  defaultScale?: number;
  ringRadius: number;
};

export const PROP_SPECS: Record<PropKind, PropSpec> = {
  ramp: { label: 'Quarter Pipe', defaultColor: '#9fd8c6', ringRadius: 1.85 },
  rail: { label: 'Grind Rail', defaultColor: '#ff8c7a', defaultLength: 4.4, ringRadius: 1.55 },
  ledge: { label: 'Funbox Ledge', defaultColor: '#b8b0f2', ringRadius: 1.45 },
  cone: { label: 'Traffic Cone', defaultColor: '#ff9a4d', ringRadius: 0.55 },
  bench: { label: 'Park Bench', defaultColor: '#d9a773', defaultLength: 2.2, ringRadius: 1.25 },
  tree: { label: 'Meadow Tree', defaultColor: '#5aa63c', defaultScale: 0.95, ringRadius: 0.95 },
};

export const DEFAULT_PARK_PROPS: PropDef[] = [
  ...TREES.map(t => ({ kind: 'tree' as const, x: t.x, z: t.z, scale: t.s, color: t.color })),
  ...QUARTER_PIPES.map(q => ({ kind: 'ramp' as const, x: q.x, z: q.z, rotY: q.rotY, color: q.color })),
  { kind: 'ledge', x: LEDGE.x, z: LEDGE.z, rotY: 0, color: LEDGE.color },
  { kind: 'rail', x: (RAIL.a.x + RAIL.b.x) / 2, z: RAIL.a.z, rotY: 0, length: RAIL.b.x - RAIL.a.x, color: '#ff8c7a' },
  ...CONES.map(([x, z]) => ({ kind: 'cone' as const, x, z, rotY: 0, color: '#ff9a4d' })),
];

/* ------------------------------------------------------------------ */
/* Shared geometries & materials (pooled across all instances)        */
/* ------------------------------------------------------------------ */

const RAMP_R = 1.1;
const RAMP_DECK = 0.55;
const RAMP_W = 3.3;

function buildRampGeo() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  for (let i = 1; i <= 24; i++) {
    const t = (i / 24) * (Math.PI / 2);
    s.lineTo(RAMP_R * Math.sin(t), RAMP_R * (1 - Math.cos(t)));
  }
  s.lineTo(RAMP_R + RAMP_DECK, RAMP_R);
  s.lineTo(RAMP_R + RAMP_DECK, 0);
  s.lineTo(0, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: RAMP_W, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 });
  g.translate(0, 0, -RAMP_W / 2);
  return g;
}

const PROP_GEO = {
  rampBody: buildRampGeo(),
  rampCoping: new THREE.CylinderGeometry(0.05, 0.05, RAMP_W + 0.06, 16),
  railBar: new THREE.CylinderGeometry(0.055, 0.055, 1, 20),
  railPost: new THREE.CylinderGeometry(0.045, 0.045, RAIL.top, 12),
  railBase: new THREE.CylinderGeometry(0.14, 0.16, 0.04, 20),
  ledgeBody: new RoundedBoxGeometry(LEDGE.w, LEDGE.h, LEDGE.d, 3, 0.06),
  ledgeCoping: new THREE.CylinderGeometry(0.024, 0.024, LEDGE.w - 0.08, 12),
  coneBase: new RoundedBoxGeometry(0.34, 0.04, 0.34, 2, 0.015),
  coneBody: new THREE.ConeGeometry(0.14, 0.42, 24),
  coneBand: new THREE.CylinderGeometry(0.087, 0.1, 0.07, 24),
  benchPlank: new RoundedBoxGeometry(2.2, 0.065, 0.25, 2, 0.02),
  benchEdge: new THREE.CylinderGeometry(0.02, 0.02, 2.16, 10),
  benchLeg: new RoundedBoxGeometry(0.1, 0.39, 0.48, 2, 0.02),
  benchBrace: new RoundedBoxGeometry(1.56, 0.05, 0.06, 2, 0.015),
  treeTrunk: new THREE.CylinderGeometry(0.1, 0.15, 0.7, 10),
  treeBlob: new THREE.IcosahedronGeometry(1, 3),
  unitBox: new THREE.BoxGeometry(1, 1, 1),
};

type SeasonalTreeMat = {
  mat: THREE.MeshStandardMaterial;
  spring: THREE.Color;
  summer: THREE.Color;
  autumn: THREE.Color;
  winter: THREE.Color;
};

let plywoodMaps: { normalMap: THREE.Texture; roughnessMap: THREE.Texture } | null = null;
const rampMats = new Map<string, THREE.MeshStandardMaterial>();
const treeMats = new Map<string, SeasonalTreeMat>();
const ledgeMats = new Map<string, THREE.MeshStandardMaterial>();
const railMats = new Map<string, THREE.MeshStandardMaterial>();
const _treeCol = new THREE.Color();

const SPRING_TREE_PALETTE = ['#f5a2c2', '#f8c3d8', '#ffe7f1', '#77cb58', '#f292b7'] as const;
const AUTUMN_TREE_PALETTE = ['#eb762d', '#f2993a', '#e8b339', '#d25138', '#e68432'] as const;

function getSeasonalTreeMat(
  summerHex: string,
  treeSeed: number,
  shadeOffset: number,
  isCrown: boolean,
): THREE.MeshStandardMaterial {
  const bucket = Math.abs(treeSeed) % 5;
  const key = `${summerHex}:${bucket}:${isCrown ? 1 : 0}`;
  const existing = treeMats.get(key);
  if (existing) return existing.mat;

  const summer = new THREE.Color(summerHex);
  const isPinkBase = summer.r > summer.g;
  const springBaseHex = isPinkBase ? '#f7a5c5' : SPRING_TREE_PALETTE[bucket]!;
  const spring = new THREE.Color(springBaseHex).offsetHSL(0, 0, shadeOffset);
  const autumn = new THREE.Color(AUTUMN_TREE_PALETTE[bucket]!).offsetHSL(0, 0, shadeOffset);
  const winter = isCrown
    ? new THREE.Color('#ebf2fa').offsetHSL(0, 0, shadeOffset * 0.25)
    : new THREE.Color('#648b83').offsetHSL(0, 0, shadeOffset * 0.5);

  const mat = new THREE.MeshStandardMaterial({ color: summer, roughness: 0.85 });
  treeMats.set(key, { mat, spring, summer, autumn, winter });
  return mat;
}

export function updateSeasonalProps(): void {
  const { spring: ws, summer: wsu, autumn: wa, winter: ww } = envState;
  for (const entry of treeMats.values()) {
    _treeCol.setRGB(
      entry.spring.r * ws + entry.summer.r * wsu + entry.autumn.r * wa + entry.winter.r * ww,
      entry.spring.g * ws + entry.summer.g * wsu + entry.autumn.g * wa + entry.winter.g * ww,
      entry.spring.b * ws + entry.summer.b * wsu + entry.autumn.b * wa + entry.winter.b * ww,
    );
    entry.mat.color.copy(_treeCol);
  }
}

const PROP_MAT = {
  coping: new THREE.MeshStandardMaterial({ color: '#c9ced8', metalness: 0.9, roughness: 0.28 }),
  railPost: new THREE.MeshStandardMaterial({ color: '#f2eee6', roughness: 0.5 }),
  coneOrange: new THREE.MeshStandardMaterial({ color: '#ff9a4d', roughness: 0.55 }),
  coneWhite: new THREE.MeshStandardMaterial({ color: '#fff7ea', roughness: 0.55 }),
  benchWood: new THREE.MeshStandardMaterial({ color: '#d9a773', roughness: 0.9, normalScale: new THREE.Vector2(1.1, 1.1) }),
  benchLeg: new THREE.MeshStandardMaterial({ color: '#4a3b35', roughness: 0.65 }),
  treeTrunk: new THREE.MeshStandardMaterial({ color: '#7a5636', roughness: 1 }),
  hit: new THREE.MeshBasicMaterial({ visible: false }),
  ghostValid: new THREE.MeshStandardMaterial({
    color: '#5eead4', emissive: '#2563eb', emissiveIntensity: 0.42,
    roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.68, depthWrite: false,
  }),
  ghostValidAccent: new THREE.MeshStandardMaterial({
    color: '#bae6fd', emissive: '#0ea5e9', emissiveIntensity: 0.35,
    roughness: 0.2, metalness: 0.2, transparent: true, opacity: 0.78, depthWrite: false,
  }),
  ghostInvalid: new THREE.MeshStandardMaterial({
    color: '#fda4af', emissive: '#e11d48', emissiveIntensity: 0.52,
    roughness: 0.3, metalness: 0.05, transparent: true, opacity: 0.68, depthWrite: false,
  }),
  ghostInvalidAccent: new THREE.MeshStandardMaterial({
    color: '#fecdd3', emissive: '#f43f5e', emissiveIntensity: 0.42,
    roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.78, depthWrite: false,
  }),
};

function getRampMat(color: string) {
  let m = rampMats.get(color);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: 1,
      normalScale: new THREE.Vector2(1.6, 1.6),
      ...(plywoodMaps ?? {}),
    });
    rampMats.set(color, m);
  }
  return m;
}

function getPooledStandard(map: Map<string, THREE.MeshStandardMaterial>, color: string, props: THREE.MeshStandardMaterialParameters) {
  let m = map.get(color);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ ...props, color });
    map.set(color, m);
  }
  return m;
}

export function applyPlywoodTextures(maps: { normalMap: THREE.Texture; roughnessMap: THREE.Texture }): void {
  plywoodMaps = maps;
  for (const m of rampMats.values()) {
    m.normalMap = maps.normalMap;
    m.roughnessMap = maps.roughnessMap;
    m.needsUpdate = true;
  }
  PROP_MAT.benchWood.normalMap = maps.normalMap;
  PROP_MAT.benchWood.roughnessMap = maps.roughnessMap;
  PROP_MAT.benchWood.needsUpdate = true;
}

const TREE_BLOBS: readonly (readonly [number, number, number, number])[] = [
  [0, 0.55, 0, 0.62], [0.42, 0.4, 0.15, 0.45], [-0.38, 0.42, 0.2, 0.48],
  [0.1, 0.45, -0.4, 0.46], [-0.15, 0.9, -0.05, 0.45], [0.25, 0.82, 0.25, 0.38], [-0.1, 0.3, 0.42, 0.4],
];

function makeCorners(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number): THREE.Vector3[] {
  const out: THREE.Vector3[] = [];
  for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [z0, z1]) out.push(new THREE.Vector3(x, y, z));
  return out;
}

let nextPropId = 1;

export class ParkProp {
  readonly id = nextPropId++;
  readonly kind: PropKind;
  readonly label: string;
  readonly dimsLabel: string;
  readonly ringRadius: number;
  readonly scale: number;
  readonly color: string;
  readonly length: number;

  x: number;
  z: number;
  rotY: number;

  readonly root = new THREE.Group();
  readonly visual = new THREE.Group();
  readonly hit: THREE.Mesh;
  readonly boxCorners: readonly THREE.Vector3[];

  // Cone / tree dynamic sub-groups
  readonly conePivot: THREE.Group | null = null;
  private canopy: THREE.Group | null = null;
  private swayPhase = Math.random() * Math.PI * 2;
  tilt = 0;
  tv = 0;
  axis = new THREE.Vector3(1, 0, 0);
  cd = 0;

  // Toybox animation & lifecycle
  sqV = 0;
  private sq = 0;
  popT = 1;
  dying = false;
  gone = false;
  private dieT = 0;
  hoverK = 0;
  hoverLift = 0;
  private ghostLook: 'off' | 'valid' | 'invalid' = 'off';

  constructor(def: PropDef) {
    this.kind = def.kind;
    const spec = PROP_SPECS[def.kind];
    this.label = spec.label;
    this.color = def.color ?? spec.defaultColor;
    this.scale = def.scale ?? spec.defaultScale ?? 1;
    this.length = def.length ?? spec.defaultLength ?? 4.4;
    this.x = def.x;
    this.z = def.z;
    this.rotY = def.rotY ?? 0;
    this.ringRadius = def.kind === 'tree' ? spec.ringRadius * this.scale : spec.ringRadius;
    this.root.add(this.visual);

    if (def.kind === 'ramp') {
      this.dimsLabel = '3.3 × 1.1 m';
      const body = new THREE.Mesh(PROP_GEO.rampBody, getRampMat(this.color));
      const coping = new THREE.Mesh(PROP_GEO.rampCoping, PROP_MAT.coping);
      coping.rotation.x = Math.PI / 2;
      coping.position.set(RAMP_R, RAMP_R + 0.02, 0);
      this.visual.add(body, coping);
      this.boxCorners = makeCorners(0, RAMP_R + RAMP_DECK, 0, RAMP_R + 0.06, -RAMP_W / 2, RAMP_W / 2);
      this.hit = this.makeHit(1.75, 1.22, 3.4, 0.85, 0.61, 0);
    } else if (def.kind === 'rail') {
      const L = this.length;
      this.dimsLabel = `${L.toFixed(1)} × 0.50 m`;
      const bar = new THREE.Mesh(PROP_GEO.railBar, getPooledStandard(railMats, this.color, { roughness: 0.3, metalness: 0.35 }));
      bar.rotation.z = Math.PI / 2;
      bar.scale.set(1, L + 0.2, 1);
      bar.position.y = RAIL.top;
      this.visual.add(bar);
      for (const px of [-L / 2 + 0.15, 0, L / 2 - 0.15]) {
        const post = new THREE.Mesh(PROP_GEO.railPost, PROP_MAT.railPost);
        post.position.set(px, RAIL.top / 2, 0);
        const base = new THREE.Mesh(PROP_GEO.railBase, PROP_MAT.railPost);
        base.position.set(px, 0.02, 0);
        this.visual.add(post, base);
      }
      this.boxCorners = makeCorners(-L / 2 - 0.12, L / 2 + 0.12, 0, 0.58, -0.2, 0.2);
      this.hit = this.makeHit(L + 0.3, 0.65, 0.5, 0, 0.32, 0);
    } else if (def.kind === 'ledge') {
      this.dimsLabel = `${LEDGE.w} × ${LEDGE.d} m`;
      const box = new THREE.Mesh(PROP_GEO.ledgeBody, getPooledStandard(ledgeMats, this.color, { roughness: 0.6 }));
      box.position.y = LEDGE.h / 2;
      this.visual.add(box);
      for (const sz of [-1, 1]) {
        const strip = new THREE.Mesh(PROP_GEO.ledgeCoping, PROP_MAT.coping);
        strip.rotation.z = Math.PI / 2;
        strip.position.set(0, LEDGE.h - 0.015, sz * (LEDGE.d / 2 - 0.025));
        this.visual.add(strip);
      }
      this.boxCorners = makeCorners(-LEDGE.w / 2, LEDGE.w / 2, 0, LEDGE.h + 0.02, -LEDGE.d / 2, LEDGE.d / 2);
      this.hit = this.makeHit(LEDGE.w + 0.08, LEDGE.h + 0.1, LEDGE.d + 0.08, 0, (LEDGE.h + 0.1) / 2, 0);
    } else if (def.kind === 'cone') {
      this.dimsLabel = '0.34 × 0.46 m';
      const pivot = new THREE.Group();
      const b = new THREE.Mesh(PROP_GEO.coneBase, PROP_MAT.coneOrange);
      b.position.y = 0.02;
      const c = new THREE.Mesh(PROP_GEO.coneBody, PROP_MAT.coneOrange);
      c.position.y = 0.25;
      const w = new THREE.Mesh(PROP_GEO.coneBand, PROP_MAT.coneWhite);
      w.position.y = 0.25;
      pivot.add(b, c, w);
      this.visual.add(pivot);
      this.conePivot = pivot;
      this.boxCorners = makeCorners(-0.2, 0.2, 0, 0.48, -0.2, 0.2);
      this.hit = this.makeHit(0.46, 0.54, 0.46, 0, 0.27, 0);
    } else if (def.kind === 'bench') {
      this.dimsLabel = '2.2 × 0.58 m';
      for (const sz of [-0.14, 0.14]) {
        const plank = new THREE.Mesh(PROP_GEO.benchPlank, PROP_MAT.benchWood);
        plank.position.set(0, 0.425, sz);
        this.visual.add(plank);
      }
      for (const sz of [-0.275, 0.275]) {
        const edge = new THREE.Mesh(PROP_GEO.benchEdge, PROP_MAT.coping);
        edge.rotation.z = Math.PI / 2;
        edge.position.set(0, 0.44, sz);
        this.visual.add(edge);
      }
      for (const sx of [-0.78, 0.78]) {
        const leg = new THREE.Mesh(PROP_GEO.benchLeg, PROP_MAT.benchLeg);
        leg.position.set(sx, 0.195, 0);
        this.visual.add(leg);
      }
      const brace = new THREE.Mesh(PROP_GEO.benchBrace, PROP_MAT.benchLeg);
      brace.position.set(0, 0.14, 0);
      this.visual.add(brace);
      this.boxCorners = makeCorners(-1.1, 1.1, 0, 0.48, -0.3, 0.3);
      this.hit = this.makeHit(2.26, 0.54, 0.66, 0, 0.27, 0);
    } else {
      const s = this.scale;
      this.dimsLabel = `${(1.2 * s).toFixed(1)} × ${(1.8 * s).toFixed(1)} m`;
      const trunk = new THREE.Mesh(PROP_GEO.treeTrunk, PROP_MAT.treeTrunk);
      trunk.scale.setScalar(s);
      trunk.position.y = 0.35 * s;
      const canopy = new THREE.Group();
      canopy.position.y = 0.7 * s;
      const r = rng((Math.round(this.x * 100) + Math.round(this.z * 7)) | 0);
      const treeSeed = Math.round(this.x * 13 + this.z * 31);
      const baseCol = new THREE.Color(this.color);
      for (const [bx, by, bz, br] of TREE_BLOBS) {
        const shadeOffset = (r() - 0.5) * 0.08;
        const shade = baseCol.clone().offsetHSL(0, 0, shadeOffset);
        const hex = `#${shade.getHexString()}`;
        const mat = getSeasonalTreeMat(hex, treeSeed, shadeOffset, by >= 0.55);
        const blob = new THREE.Mesh(PROP_GEO.treeBlob, mat);
        blob.position.set(bx * s, by * s, bz * s);
        blob.scale.setScalar(br * s);
        canopy.add(blob);
      }
      this.canopy = canopy;
      this.visual.add(trunk, canopy);
      this.boxCorners = makeCorners(-0.75 * s, 0.75 * s, 0, 1.85 * s, -0.75 * s, 0.75 * s);
      this.hit = this.makeHit(1.4 * s, 1.9 * s, 1.4 * s, 0, 0.95 * s, 0);
    }

    this.visual.traverse(n => {
      if ((n as THREE.Mesh).isMesh) {
        const mesh = n as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData.origMat = mesh.material;
      }
    });
    this.root.add(this.hit);
    this.setTransform(this.x, this.z, this.rotY);
  }

  private makeHit(w: number, h: number, d: number, px: number, py: number, pz: number): THREE.Mesh {
    const m = new THREE.Mesh(PROP_GEO.unitBox, PROP_MAT.hit);
    m.scale.set(w, h, d);
    m.position.set(px, py, pz);
    m.userData.prop = this;
    return m;
  }

  setTransform(x: number, z: number, rotY: number, lift = this.hoverLift): void {
    this.x = x;
    this.z = z;
    this.rotY = rotY;
    this.hoverLift = lift;
    const baseY = this.kind === 'cone' && isOnPlaza(x, z) ? PLAZA_TOP : 0;
    this.root.position.set(x, baseY + lift, z);
    this.root.rotation.y = rotY;
  }

  /** Toggle pooled translucent hologram appearance for glide placement or invalid hover feedback. */
  setGhostLook(mode: 'off' | 'valid' | 'invalid'): void {
    if (this.ghostLook === mode) return;
    this.ghostLook = mode;
    this.visual.traverse(n => {
      if (!(n as THREE.Mesh).isMesh) return;
      const mesh = n as THREE.Mesh;
      const origMat = mesh.userData.origMat as THREE.Material | undefined;
      if (mode === 'off') {
        if (origMat) mesh.material = origMat;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return;
      }
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      const isAccent =
        origMat === PROP_MAT.coping ||
        origMat === PROP_MAT.railPost ||
        origMat === PROP_MAT.coneWhite ||
        origMat === PROP_MAT.benchLeg ||
        origMat === PROP_MAT.treeTrunk;
      mesh.material =
        mode === 'valid'
          ? (isAccent ? PROP_MAT.ghostValidAccent : PROP_MAT.ghostValid)
          : (isAccent ? PROP_MAT.ghostInvalidAccent : PROP_MAT.ghostInvalid);
    });
  }

  spawnPop(): void {
    this.popT = 0;
    this.root.scale.setScalar(0.001);
  }

  kill(): void {
    this.dying = true;
    this.dieT = 0;
  }

  revive(): void {
    this.dying = false;
    this.gone = false;
    this.root.visible = true;
    this.spawnPop();
  }

  update(dt: number, t: number): void {
    if (this.dying) {
      this.dieT += dt;
      const k = Math.min(1, this.dieT / 0.22);
      this.root.scale.setScalar(Math.max(0.001, 1 - easeInBack(k)));
      if (k >= 1) {
        this.root.visible = false;
        this.dying = false;
        this.gone = true;
      }
      return;
    }
    if (this.popT < 1) {
      this.popT = Math.min(1, this.popT + dt / 0.45);
      this.root.scale.setScalar(Math.max(0.001, easeOutBack(this.popT)));
    }
    if (Math.abs(this.sq) > 1e-4 || Math.abs(this.sqV) > 1e-4) {
      this.sqV += (-this.sq * 190 - this.sqV * 13) * dt;
      this.sq = clamp(this.sq + this.sqV * dt, -0.25, 0.3);
      this.visual.scale.set(1 - this.sq * 0.4, 1 + this.sq, 1 - this.sq * 0.4);
    } else {
      this.visual.scale.set(1, 1, 1);
    }
    if (this.conePivot) {
      this.cd -= dt;
      this.tv += (-this.tilt * 55 - this.tv * 4.5) * dt;
      this.tilt = clamp(this.tilt + this.tv * dt, -0.5, 1.35);
      this.conePivot.quaternion.setFromAxisAngle(this.axis, this.tilt);
    }
    if (this.canopy) {
      const swayAmp = 0.022 * (0.85 + envState.wind * 1.45);
      this.canopy.rotation.z = Math.sin(t * (0.9 + envState.wind * 0.8) + this.swayPhase) * swayAmp;
    }
  }

  getObstacles(out: Obstacle[]): void {
    const c = Math.cos(this.rotY), s = Math.sin(this.rotY);
    const push = (lx: number, lz: number, r: number, h: number, tag?: 'rail') => {
      out.push({ x: this.x + lx * c + lz * s, z: this.z - lx * s + lz * c, r, h, tag });
    };
    switch (this.kind) {
      case 'ramp':
        for (const lz of [-1.2, 0, 1.2]) push(0.8, lz, 0.95, 1.2);
        break;
      case 'rail': {
        const half = this.length / 2;
        for (let lx = -half; lx <= half + 0.01; lx += 0.8) push(lx, 0, 0.3, 0.56, 'rail');
        break;
      }
      case 'ledge':
        for (const lx of [-1, 0, 1]) push(lx, 0, 0.62, 0.4);
        break;
      case 'bench':
        for (const lx of [-0.75, 0, 0.75]) push(lx, 0, 0.42, 0.48);
        break;
      case 'tree':
        out.push({ x: this.x, z: this.z, r: 0.8 * this.scale, h: 3 });
        break;
      case 'cone':
        break;
    }
  }

  getRailSegment(out?: RailSegment): RailSegment | null {
    if (this.kind !== 'rail') return null;
    const half = this.length / 2;
    const c = Math.cos(this.rotY), s = Math.sin(this.rotY);
    const seg = out ?? {
      id: this.id,
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      length: this.length,
      top: RAIL.top,
      railY: RAIL_Y,
    };
    seg.id = this.id;
    seg.a.set(this.x - half * c, 0, this.z + half * s);
    seg.b.set(this.x + half * c, 0, this.z - half * s);
    seg.dir.copy(seg.b).sub(seg.a).normalize();
    seg.length = this.length;
    seg.top = RAIL.top;
    seg.railY = RAIL_Y;
    return seg;
  }

  toDef(): PropDef {
    const def: PropDef = { kind: this.kind, x: this.x, z: this.z, rotY: this.rotY };
    if (this.kind === 'tree') def.scale = this.scale;
    if (this.kind === 'rail') def.length = this.length;
    if (this.color !== PROP_SPECS[this.kind].defaultColor) def.color = this.color;
    return def;
  }
}

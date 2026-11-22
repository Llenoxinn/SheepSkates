import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BOARD_COLORS, BOUNDS, GRAVITY, isOnPlaza, NAMES, OBSTACLES, RAIL, RAIL_Y, SHEEP_SCALE } from './config';
import { clamp, damp, dampA, easeInBack, easeOutBack, pick, rand, rng, wrapA } from './math';
import { Sfx } from './sfx';
import type { SheepState, TrickType } from './store';
import { baked, radialTex, woolNormal } from './textures';

/* ------------------------------------------------------------------ */
/* Shared geometry + materials (built once, reused by every sheep)      */
/* ------------------------------------------------------------------ */

function woolGeo(seed: number, n: number, ex: number, ey: number, ez: number, r0: number, r1: number, yCut: number, seg = 12) {
  const r = rng(seed), parts: THREE.BufferGeometry[] = [];
  const tint = (g: THREE.BufferGeometry, k: number) => {
    const c = new Float32Array(g.attributes.position!.count * 3);
    for (let i = 0; i < c.length; i += 3) { c[i] = k; c[i + 1] = k * 0.985; c[i + 2] = k * 0.95; }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3)); return g;
  };
  const core = new THREE.SphereGeometry(1, 24, 16); core.scale(ex * 0.92, ey * 0.92, ez * 0.92); parts.push(tint(core, 0.9));
  for (let i = 0; i < n; i++) {
    const y = 1 - 2 * (i + 0.5) / n; if (y < yCut) continue;
    const rr = Math.sqrt(1 - y * y), th = i * 2.39996;
    const s = new THREE.SphereGeometry(r0 + r() * (r1 - r0), seg, seg - 4);
    s.translate(Math.cos(th) * rr * ex, y * ey, Math.sin(th) * rr * ez);
    parts.push(tint(s, 0.92 + r() * 0.08));
  }
  const g = mergeGeometries(parts)!; g.computeBoundingSphere(); return g;
}
const ellipsoid = (x: number, y: number, z: number, ws = 16, hs = 12) => { const g = new THREE.SphereGeometry(1, ws, hs); g.scale(x, y, z); return g; };

const GEO = {
  wool: woolGeo(7, 72, 0.4, 0.28, 0.5, 0.11, 0.165, -0.6, 14),
  tuft: woolGeo(3, 14, 0.13, 0.065, 0.115, 0.052, 0.075, -0.3, 10),
  head: ellipsoid(0.195, 0.21, 0.235, 28, 20),
  eye: new THREE.SphereGeometry(0.062, 16, 12), pupil: new THREE.SphereGeometry(0.036, 12, 8), glint: new THREE.SphereGeometry(0.015, 8, 6),
  nose: ellipsoid(0.038, 0.026, 0.022, 12, 8),
  ear: (() => { const g = ellipsoid(0.115, 0.038, 0.065, 14, 10); g.translate(0.095, 0, 0); return g; })(),
  cheek: ellipsoid(0.048, 0.028, 0.018, 10, 8),
  leg: new THREE.CylinderGeometry(0.042, 0.036, 0.2, 12),
  tail: new THREE.IcosahedronGeometry(0.085, 3),
  deck: new RoundedBoxGeometry(0.42, 0.05, 1.08, 4, 0.022),
  grip: new RoundedBoxGeometry(0.38, 0.012, 1.0, 2, 0.005),
  truck: new RoundedBoxGeometry(0.3, 0.04, 0.08, 2, 0.012),
  wheel: (() => { const g = new THREE.CylinderGeometry(0.056, 0.056, 0.05, 20); g.rotateZ(Math.PI / 2); return g; })(),
  hat: new THREE.SphereGeometry(0.16, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
  pom: new THREE.IcosahedronGeometry(0.058, 3),
  hit: new THREE.BoxGeometry(0.8, 1.1, 1.3),
  blob: new THREE.CircleGeometry(0.6, 32),
};
const woolN = baked('woolNormal', () => woolNormal(8));
const MAT = {
  wool: new THREE.MeshPhysicalMaterial({ color: '#ffffff', vertexColors: true, roughness: 1, normalMap: woolN, normalScale: new THREE.Vector2(0.9, 0.9), sheen: 1, sheenRoughness: 0.5, sheenColor: new THREE.Color('#fff4e0') }),
  face: new THREE.MeshStandardMaterial({ color: '#4a3b35', roughness: 0.62 }),
  eye: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2 }),
  pupil: new THREE.MeshStandardMaterial({ color: '#141010', roughness: 0.15 }),
  glint: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
  nose: new THREE.MeshStandardMaterial({ color: '#d69595', roughness: 0.55 }),
  cheek: new THREE.MeshStandardMaterial({ color: '#ff9fb4', roughness: 0.6 }),
  grip: new THREE.MeshStandardMaterial({ color: '#3f3d48', roughness: 0.95 }),
  truck: new THREE.MeshStandardMaterial({ color: '#bcc1cc', roughness: 0.3, metalness: 0.8 }),
  wheel: new THREE.MeshStandardMaterial({ color: '#f5ecd6', roughness: 0.45 }),
  hit: new THREE.MeshBasicMaterial({ visible: false }),
};
const deckMats = BOARD_COLORS.map(c => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.45, clearcoat: 0.6, clearcoatRoughness: 0.3 }));
const hatMats = BOARD_COLORS.map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 }));
const blobTex = baked('blob', () => radialTex('rgba(40,30,20,.9)', 'rgba(40,30,20,0)'));

const usedNames = new Set<string>();
const nextName = () => {
  const free = NAMES.filter(n => !usedNames.has(n));
  const n = free.length ? pick(free) : `Sheep ${usedNames.size + 1}`;
  usedNames.add(n); return n;
};

/* ------------------------------------------------------------------ */
/* World services the sheep needs (implemented by World)                */
/* ------------------------------------------------------------------ */

export interface SheepWorld {
  flock: readonly Sheep[];
  readonly selected: Sheep | null;
  keys: Readonly<Record<string, boolean>>;
  cameraForward(out: THREE.Vector3): THREE.Vector3;
  puff(p: THREE.Vector3, n: number, spread?: number, size?: number, tint?: string): void;
  spark(x: number, y: number, z: number, dx: number, dz: number): void;
  speedLine(x: number, y: number, z: number, heading: number, speed: number): void;
  award(name: string, pts: number, x: number, y: number, z: number, big?: boolean, cls?: string): void;
  popText(x: number, y: number, z: number, text: string, cls?: string): void;
  bumpCones(s: Sheep): void;
  onStateChanged(s: Sheep): void;
  randomSpot(wide: boolean, out: THREE.Vector3): THREE.Vector3;
  shake(amount: number): void;
}

type Grind = { phase: 'approach' | 'runup' | 'up' | 'slide' | 'out'; S: THREE.Vector3; E: THREE.Vector3; dir: THREE.Vector3; L: number; P: THREE.Vector3; ang: number; s: number; after: SheepState };
type AirTrick = TrickType | 'grindpop' | 'grindout' | 'drop' | null;

// scratch (no allocations in the hot loop)
const _v = new THREE.Vector3();

let nextId = 1;

export type SheepOpts = { x?: number; z?: number; heading?: number; state?: SheepState; color?: number; hat?: boolean; name?: string };

export class Sheep {
  readonly id = nextId++;
  readonly name: string; readonly color: number; readonly hat: boolean;
  readonly voicePitch: number; readonly voiceVib: number; readonly voiceDur: number;
  readonly root = new THREE.Group(); readonly air = new THREE.Group();
  private lean = new THREE.Group(); private board = new THREE.Group(); private rider = new THREE.Group();
  private head = new THREE.Group(); private eyes = new THREE.Group(); private tail: THREE.Mesh;
  private ears: { g: THREE.Group; s: number }[] = [];
  private wheels: THREE.Mesh[] = [];
  private blob: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>;
  readonly hit: THREE.Mesh;

  state: SheepState; after: SheepState = 'idle';
  heading: number; speed = 0; target = new THREE.Vector3(); hasTarget = false; private tTimer = 0;
  y = 0; vy = 0; inAir = false; onRail = false;
  private airT = 0; private airDur = 1; private trick: AirTrick = null; private caught = false; private pending: { type: TrickType | 'grindpop'; t: number } | null = null;
  private flip = 0; private spin = 0; private pitch = 0; private slideYaw = 0; private slideYawT = 0; private leanA = 0; private turnRate = 0;
  sqV = 0; private sq = 0; private sqT = 0;
  private headYaw = 0; private headYawT = 0; private headPitch = 0; private lookT = rand(0, 2); private grazeT = 0; private blinkT = rand(1, 4); private blinkA = 0;
  private ph = rand(0, 6.28); popT = 1; dying = false; gone = false; private dieT = 0; hoverK = 0;
  private cruiseSpeed = rand(2, 2.7); private wide = Math.random() < 0.3;
  grind: Grind | null = null;

  constructor(o: SheepOpts = {}) {
    this.name = o.name ?? nextName(); usedNames.add(this.name);
    this.color = o.color ?? ((Math.random() * BOARD_COLORS.length) | 0);
    this.hat = o.hat ?? Math.random() < 0.35;
    this.voicePitch = rand(0.82, 1.24);
    this.voiceVib = rand(6.2, 9.2);
    this.voiceDur = rand(0.42, 0.62);
    this.state = o.state ?? 'idle'; this.heading = o.heading ?? 0;
    this.root.position.set(o.x ?? 0, 0, o.z ?? 0);
    this.root.add(this.lean); this.lean.add(this.air); this.air.add(this.board, this.rider);
    this.air.scale.setScalar(SHEEP_SCALE);

    // board (pivot at deck centre so kickflips spin around the long axis)
    this.board.position.y = 0.16;
    this.board.add(new THREE.Mesh(GEO.deck, deckMats[this.color]));
    const grip = new THREE.Mesh(GEO.grip, MAT.grip); grip.position.y = 0.026; this.board.add(grip);
    for (const zz of [-0.34, 0.34]) {
      const t = new THREE.Mesh(GEO.truck, MAT.truck); t.position.set(0, -0.05, zz); this.board.add(t);
      for (const xx of [-0.165, 0.165]) { const w = new THREE.Mesh(GEO.wheel, MAT.wheel); w.position.set(xx, -0.095, zz); this.board.add(w); this.wheels.push(w); }
    }

    // rider (pivot at deck top so squash keeps hooves planted)
    this.rider.position.y = 0.186;
    for (const [lx, lz] of [[-0.12, -0.24], [0.12, -0.24], [-0.12, 0.26], [0.12, 0.26]] as const) { const l = new THREE.Mesh(GEO.leg, MAT.face); l.position.set(lx, 0.1, lz); this.rider.add(l); }
    const body = new THREE.Mesh(GEO.wool, MAT.wool); body.position.y = 0.44; this.rider.add(body);
    this.tail = new THREE.Mesh(GEO.tail, MAT.wool); this.tail.position.set(0, 0.5, -0.53); this.rider.add(this.tail);

    this.head.rotation.order = 'YXZ'; this.head.position.set(0, 0.55, 0.39); this.rider.add(this.head);
    const face = new THREE.Mesh(GEO.head, MAT.face); face.position.set(0, -0.01, 0.18); face.rotation.x = 0.22; this.head.add(face);
    this.eyes.position.set(0, 0.058, 0.375); this.head.add(this.eyes);
    const nose = new THREE.Mesh(GEO.nose, MAT.nose); nose.position.set(0, -0.045, 0.405); this.head.add(nose);
    for (const s of [-1, 1]) {
      const e = new THREE.Group(); e.position.set(s * 0.092, 0, 0); this.eyes.add(e);
      e.add(new THREE.Mesh(GEO.eye, MAT.eye));
      const p = new THREE.Mesh(GEO.pupil, MAT.pupil); p.position.set(s * 0.005, 0.003, 0.038); e.add(p);
      const gl = new THREE.Mesh(GEO.glint, MAT.glint); gl.position.set(s * 0.005 + 0.015, 0.02, 0.065); e.add(gl);
      const ck = new THREE.Mesh(GEO.cheek, MAT.cheek); ck.position.set(s * 0.132, -0.052, 0.345); ck.rotation.y = s * 0.52; this.head.add(ck);
      const ep = new THREE.Group(); ep.position.set(s * 0.145, 0.085, 0.14);
      const em = new THREE.Mesh(GEO.ear, MAT.face); if (s < 0) em.rotation.y = Math.PI; ep.add(em); this.head.add(ep); this.ears.push({ g: ep, s });
    }
    if (this.hat) {
      const hm = hatMats[(this.color + 3) % BOARD_COLORS.length]!;
      const h = new THREE.Mesh(GEO.hat, hm); h.position.set(0, 0.135, 0.15); h.scale.set(1, 0.85, 1.05); h.rotation.x = -0.15; this.head.add(h);
      const pm = new THREE.Mesh(GEO.pom, hm); pm.position.set(0, 0.285, 0.13); this.head.add(pm);
    } else { const t = new THREE.Mesh(GEO.tuft, MAT.wool); t.position.set(0, 0.155, 0.15); this.head.add(t); }

    this.root.traverse(n => { if ((n as THREE.Mesh).isMesh) { n.castShadow = true; n.receiveShadow = true; } });

    this.hit = new THREE.Mesh(GEO.hit, MAT.hit); this.hit.position.y = 0.55; this.hit.userData.sheep = this; this.air.add(this.hit);
    this.blob = new THREE.Mesh(GEO.blob, new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: 0.3 }));
    this.blob.rotation.x = -Math.PI / 2; this.blob.position.y = 0.016; this.root.add(this.blob);
  }

  get pos() { return this.root.position; }

  /* ---------------- state + tricks ---------------- */
  setState(st: SheepState) {
    if (this.state === 'grind' && st !== 'grind') this.exitGrind();
    this.state = st; this.hasTarget = false;
    if (st === 'grind') this.startGrind();
  }
  /** Returns true when the trick actually started. */
  doTrick(type: TrickType): boolean {
    if (this.inAir || this.pending || this.onRail || this.dying) return false;
    this.pending = { type, t: 0 }; this.sqT = -0.28; return true;
  }
  dropIn(height = 6) { this.y = height; this.vy = 0; this.inAir = true; this.airT = 0; this.airDur = 1; this.trick = 'drop'; }
  spawnPop() { this.popT = 0; this.root.scale.setScalar(0.001); }
  kill() { this.dying = true; this.dieT = 0; if (this.state === 'grind') this.exitGrind(); }
  revive() { this.dying = false; this.gone = false; this.root.visible = true; this.spawnPop(); }

  private launch(type: TrickType | 'grindpop') {
    const vy = { ollie: 5.4, kickflip: 5.9, spin: 6.4, grindpop: 5.3 }[type];
    this.vy = vy; this.inAir = true; this.airT = 0; this.airDur = (2 * vy / GRAVITY) * 1.14; this.trick = type; this.caught = false;
    this.sqT = 0; this.sqV += 7; Sfx.whoosh();
  }
  private land(w: SheepWorld, impactSpeed = 5.5) {
    this.y = 0; this.vy = 0; this.inAir = false; this.flip = 0; this.spin = 0; this.pitch = 0;
    this.sqV -= Math.min(9, 4 + this.airT * 6);
    const onConcrete = isOnPlaza(this.pos.x, this.pos.z);
    const impact = clamp(impactSpeed / 6.5, 0.55, 1.55);
    w.puff(this.pos, Math.round(7 + impact * 5), 1.4 + impact * 0.55, 0.85 + impact * 0.35);
    Sfx.land(onConcrete ? 'concrete' : 'grass', impact);
    if (this.trick === 'drop' || this.trick === 'grindout' || (w.selected === this && impactSpeed > 5.4)) {
      const amt = this.trick === 'drop' ? 0.13 : this.trick === 'grindout' ? 0.095 : clamp((impactSpeed - 4.8) * 0.038, 0.035, 0.1);
      w.shake(amt);
    }
    const t = this.trick; this.trick = null;
    const { x, z } = this.pos;
    if (t === 'ollie') w.award('Ollie', 50, x, 1.3, z);
    else if (t === 'kickflip') w.award('Kickflip', 150, x, 1.3, z);
    else if (t === 'spin') w.award('360', 200, x, 1.3, z);
    else if (t === 'grindout') { w.award('Boardslide', 300, x, 1.3, z, true); this.finishGrind(w); }
    else if (t === 'grindpop' && this.state === 'grind') this.finishGrind(w);
    else if (t === 'drop') Sfx.baa(this.voicePitch * 1.06, this.voiceVib, this.voiceDur);
  }

  /* ---------------- grind sequence ---------------- */
  private startGrind() {
    const nearA = this.pos.distanceTo(RAIL.a) < this.pos.distanceTo(RAIL.b);
    const S = (nearA ? RAIL.a : RAIL.b).clone(), E = (nearA ? RAIL.b : RAIL.a).clone();
    const dir = E.clone().sub(S).normalize();
    this.grind = { phase: 'approach', S, E, dir, L: S.distanceTo(E), P: S.clone().addScaledVector(dir, -2.8), ang: Math.atan2(dir.x, dir.z), s: -9, after: 'cruise' };
  }
  exitGrind() {
    if (this.onRail) { this.onRail = false; this.inAir = true; this.vy = 1; this.airT = 0; this.trick = null; }
    this.slideYawT = 0; this.grind = null; Sfx.stopHiss();
  }
  private finishGrind(w: SheepWorld) {
    const after = this.grind?.after ?? 'cruise';
    this.grind = null; this.state = after; this.hasTarget = false; w.onStateChanged(this);
  }
  /** Ride mode: falling onto the rail while over it starts a boardslide. */
  private catchRail(w: SheepWorld) {
    if (Math.abs(this.pos.z - RAIL.a.z) > 0.38 || this.pos.x < RAIL.a.x + 0.1 || this.pos.x > RAIL.b.x - 0.2) return false;
    const fwdX = Math.sin(this.heading);
    const goingB = Math.abs(fwdX) < 0.25 ? this.pos.x < (RAIL.a.x + RAIL.b.x) / 2 : fwdX > 0;
    const S = (goingB ? RAIL.a : RAIL.b).clone(), E = (goingB ? RAIL.b : RAIL.a).clone(), dir = E.clone().sub(S).normalize();
    this.grind = { phase: 'up', S, E, dir, L: S.distanceTo(E), P: S.clone(), ang: Math.atan2(dir.x, dir.z), s: (this.pos.x - S.x) * dir.x, after: 'ride' };
    this.state = 'grind'; w.onStateChanged(this);
    this.landRail(w); return true;
  }
  private landRail(w: SheepWorld) {
    const g = this.grind!; this.onRail = true; this.inAir = false; this.vy = 0; this.y = RAIL_Y; this.trick = null; this.flip = 0; this.spin = 0;
    g.phase = 'slide'; this.slideYawT = Math.PI / 2; this.sqV -= 5; this.speed = Math.max(this.speed, 2.6);
    for (let i = 0; i < 10; i++) w.spark(this.pos.x, RAIL.top + 0.02, this.pos.z, g.dir.x, g.dir.z);
    Sfx.clank(); Sfx.startHiss();
  }
  /** Returns a seek target, or null when the grind drives movement itself. */
  private grindStep(dt: number, w: SheepWorld): THREE.Vector3 | null {
    const g = this.grind!, p = this.pos;
    if (!this.onRail) g.s = (p.x - g.S.x) * g.dir.x + (p.z - g.S.z) * g.dir.z;
    if (g.phase === 'approach') {
      if (Math.hypot(p.x - g.P.x, p.z - g.P.z) < 0.55) g.phase = 'runup';
      return g.P;
    }
    if (g.phase === 'slide') {
      this.speed = damp(this.speed, 2.9, 2, dt);
      p.x = g.S.x + g.dir.x * g.s; p.z = g.S.z + g.dir.z * g.s;
      this.heading = g.ang;
      if (Math.random() < dt * 170) w.spark(p.x, RAIL.top + 0.02, p.z, g.dir.x, g.dir.z);
      if (g.s >= g.L - 0.05) {
        this.onRail = false; this.slideYawT = 0; Sfx.stopHiss();
        this.vy = 4.2; this.inAir = true; this.airT = 0; this.airDur = 0.5; this.trick = 'grindout'; g.phase = 'out'; this.sqV += 5;
      }
      return null;
    }
    // runup / up / out: align with the rail and pull onto its line
    this.heading = dampA(this.heading, g.ang, 9, dt);
    this.speed = damp(this.speed, 3.3, 3, dt);
    if (g.phase !== 'out') {
      const lat = -(p.x - g.S.x) * g.dir.z + (p.z - g.S.z) * g.dir.x, k = Math.min(1, 5 * dt);
      p.x += g.dir.z * lat * k; p.z -= g.dir.x * lat * k;
    }
    if (g.phase === 'runup' && g.s > -1.05 && !this.inAir && !this.pending) { this.pending = { type: 'grindpop', t: 0 }; this.sqT = -0.28; g.phase = 'up'; }
    return null;
  }

  /* ---------------- per-frame simulation ---------------- */
  private avoid(ignoreRail: boolean, w: SheepWorld, out: THREE.Vector3) {
    out.set(0, 0, 0); const p = this.pos;
    for (const o of OBSTACLES) {
      if (ignoreRail && o.tag === 'rail') continue;
      const dx = p.x - o.x, dz = p.z - o.z, d = Math.hypot(dx, dz), R = o.r + 1.1;
      if (d < R && d > 1e-4) { const k = (R - d) / R * 2.4; out.x += dx / d * k; out.z += dz / d * k; }
    }
    for (const s of w.flock) {
      if (s === this || s.dying) continue;
      const dx = p.x - s.pos.x, dz = p.z - s.pos.z, d = Math.hypot(dx, dz);
      if (d < 1.4 && d > 1e-4) { const k = (1.4 - d) / 1.4 * 1.6; out.x += dx / d * k; out.z += dz / d * k; }
    }
    const ex = Math.abs(p.x) - 11.3, ez = Math.abs(p.z) - 7.4;
    if (ex > 0) out.x -= Math.sign(p.x) * ex * 2;
    if (ez > 0) out.z -= Math.sign(p.z) * ez * 2;
    return out;
  }

  update(dt: number, t: number, w: SheepWorld) {
    if (this.dying) {
      this.dieT += dt; const k = Math.min(1, this.dieT / 0.22);
      this.root.scale.setScalar(Math.max(0.001, 1 - easeInBack(k)));
      if (k >= 1) { this.root.visible = false; this.dying = false; this.gone = true; }
      return;
    }
    if (this.popT < 1) { this.popT = Math.min(1, this.popT + dt / 0.5); this.root.scale.setScalar(Math.max(0.001, easeOutBack(this.popT))); }

    const p = this.pos, prevH = this.heading;
    if (this.pending) { this.pending.t += dt; if (this.pending.t > 0.09) { this.launch(this.pending.type); this.pending = null; } }

    let want: THREE.Vector3 | null = null, max = 0;
    switch (this.state) {
      case 'idle': this.speed = damp(this.speed, 0, 3.5, dt); break;
      case 'cruise':
        this.tTimer -= dt;
        if (!this.hasTarget || this.tTimer <= 0 || Math.hypot(p.x - this.target.x, p.z - this.target.z) < 1) { w.randomSpot(this.wide, this.target); this.hasTarget = true; this.tTimer = rand(4, 8); }
        want = this.target; max = this.cruiseSpeed; break;
      case 'goto':
        want = this.target; max = 3;
        if (Math.hypot(p.x - want.x, p.z - want.z) < 0.35) { this.state = this.after; this.hasTarget = false; w.onStateChanged(this); }
        break;
      case 'ride': this.ride(dt, w); break;
      case 'grind': { const r = this.grindStep(dt, w); if (r) { want = r; max = 2.8; } break; }
    }

    if (want) {
      let vx = want.x - p.x, vz = want.z - p.z; const d = Math.hypot(vx, vz) || 1; vx /= d; vz /= d;
      const a = this.avoid(this.state === 'grind', w, _v); vx += a.x; vz += a.z;
      const dh = wrapA(Math.atan2(vx, vz) - this.heading);
      this.heading += clamp(dh, -3.4 * dt, 3.4 * dt);
      const arrive = this.state === 'goto' ? clamp(d / 1.6, 0.25, 1) : 1;
      this.speed = damp(this.speed, max * arrive * (1 - Math.min(0.6, Math.abs(dh) / Math.PI)), 2.2, dt);
    }
    if (this.onRail) this.grind!.s += this.speed * dt;
    else { p.x += Math.sin(this.heading) * this.speed * dt; p.z += Math.cos(this.heading) * this.speed * dt; }

    // collisions
    if (!this.onRail) {
      for (const o of OBSTACLES) {
        if (o.h >= 0 && this.y > o.h) continue;
        if (o.tag === 'rail' && this.state === 'grind') continue;
        const dx = p.x - o.x, dz = p.z - o.z, d = Math.hypot(dx, dz), R = o.r + 0.38;
        if (d < R && d > 1e-4) { p.x = o.x + dx / d * R; p.z = o.z + dz / d * R; if (this.state === 'ride') this.speed *= 0.85; }
      }
      if (Math.abs(p.x) > BOUNDS.x) { p.x = Math.sign(p.x) * BOUNDS.x; this.speed *= 0.5; }
      if (Math.abs(p.z) > BOUNDS.z) { p.z = Math.sign(p.z) * BOUNDS.z; this.speed *= 0.5; }
    }

    // vertical motion + tricks
    const yPrev = this.y;
    if (this.inAir) {
      const apex = this.trick !== 'drop' ? clamp(1 - Math.abs(this.vy) / 1.5, 0, 1) : 0;
      const grav = GRAVITY * (1 - 0.52 * apex * apex);
      this.vy -= grav * dt; this.y += this.vy * dt; this.airT += dt;
      const k = clamp(this.airT / this.airDur, 0, 1);
      if (this.trick === 'kickflip') {
        const fk = clamp(k / 0.74, 0, 1);
        this.flip = (1 - (1 - fk) ** 3) * Math.PI * 2;
        if (fk >= 1 && !this.caught) { this.caught = true; this.sqV -= 2.2; }
      }
      if (this.trick === 'spin') {
        const sk = clamp(k / 0.82, 0, 1);
        this.spin = (1 - (1 - sk) ** 3) * Math.PI * 2;
      }
      this.pitch = -0.5 * Math.sin(clamp(this.airT / 0.36, 0, 1) * Math.PI);
      const g = this.grind, crossing = this.vy < 0 && this.y <= RAIL_Y && yPrev >= RAIL_Y - 0.06;
      if (this.state === 'grind' && g && g.phase === 'up' && crossing && g.s > -0.45 && g.s < g.L - 0.4) this.landRail(w);
      else if (this.state === 'ride' && crossing && this.catchRail(w)) { /* now sliding */ }
      else if (this.y <= 0 && this.vy < 0) this.land(w, Math.abs(this.vy));
    } else if (this.onRail) this.y = RAIL_Y;

    if (!this.inAir) w.bumpCones(this);
    this.animate(dt, t, prevH);
    if (!this.inAir && !this.onRail && Math.abs(this.turnRate) > 2.2 && this.speed > 2.5 && Math.random() < dt * 14) {
      w.puff(this.pos, Math.random() < 0.5 ? 1 : 2, 0.75, 0.55);
    }
    if (!this.onRail && ((this.state === 'ride' && this.speed > 3.0) || this.speed > 3.2)) {
      if (Math.random() < dt * ((this.speed - 2.8) * 26)) {
        w.speedLine(this.pos.x, this.y, this.pos.z, this.heading, this.speed);
      }
    }
  }

  private ride(dt: number, w: SheepWorld) {
    const k = w.keys, f = (k.w ? 1 : 0) - (k.s ? 1 : 0), r = (k.d ? 1 : 0) - (k.a ? 1 : 0);
    if (f || r) { // camera-relative steering
      const fw = w.cameraForward(_v);
      const dx = fw.x * f - fw.z * r, dz = fw.z * f + fw.x * r;
      const dh = wrapA(Math.atan2(dx, dz) - this.heading);
      this.heading += clamp(dh, -5 * dt, 5 * dt);
      this.speed = damp(this.speed, 4.6 * (1 - Math.min(0.5, Math.abs(dh) / Math.PI)), 2.4, dt);
    } else this.speed = damp(this.speed, 0, 0.9, dt);
  }

  /** Secondary motion: lean, look-around, grazing, blinks, ear flaps, squash & stretch. */
  private animate(dt: number, t: number, prevH: number) {
    this.turnRate = wrapA(this.heading - prevH) / Math.max(dt, 1e-4);
    this.leanA = damp(this.leanA, this.onRail ? Math.sin(t * 9) * 0.08 : clamp(-this.turnRate * Math.abs(this.speed) * 0.09, -0.38, 0.38), 8, dt);
    this.lookT -= dt;
    if (this.lookT <= 0) {
      this.lookT = rand(1.4, 3.8); this.headYawT = this.state === 'idle' ? rand(-0.7, 0.7) : rand(-0.15, 0.15);
      if (this.state === 'idle' && Math.random() < 0.4) this.grazeT = rand(1.1, 2.2);
    }
    this.grazeT -= dt;
    const grazing = this.grazeT > 0 && this.state === 'idle' && !this.inAir;
    this.headPitch = damp(this.headPitch, grazing ? 0.62 + Math.sin(t * 15) * 0.07 : this.inAir ? -0.25 : 0, 7, dt);
    this.headYaw = damp(this.headYaw, grazing ? 0 : this.headYawT + clamp(this.turnRate * 0.12, -0.4, 0.4), 5, dt);
    this.head.rotation.set(this.headPitch, this.headYaw, 0);
    this.blinkT -= dt; if (this.blinkT <= 0) { this.blinkT = rand(2, 5); this.blinkA = 0.13; }
    this.blinkA -= dt; this.eyes.scale.y = this.blinkA > 0 ? 0.12 : 1;
    const sp = Math.min(1, Math.abs(this.speed) / 3);
    const flap = Math.sin(t * 10 + this.ph) * 0.14 * sp + (this.inAir ? clamp(-this.vy * 0.06, -0.4, 0.4) : 0);
    for (const e of this.ears) e.g.rotation.z = -e.s * (0.45 + flap);
    this.tail.position.x = Math.sin(t * (grazing ? 14 : 6) + this.ph) * 0.025;

    this.sqV += ((this.sqT - this.sq) * 190 - this.sqV * 13) * dt;
    this.sq = clamp(this.sq + this.sqV * dt, -0.35, 0.4);
    const breathe = Math.sin(t * 2.3 + this.ph) * 0.014;
    this.rider.scale.set(1 - this.sq * 0.5, 1 + this.sq + breathe, 1 - this.sq * 0.5);

    this.slideYaw = damp(this.slideYaw, this.slideYawT, 14, dt);
    this.root.rotation.y = this.heading;
    this.lean.rotation.z = this.leanA;
    this.air.position.y = this.y;
    this.air.rotation.y = this.spin + this.slideYaw;
    this.board.rotation.set(this.pitch, 0, this.flip);
    const wr = this.speed * dt / 0.056; for (const wh of this.wheels) wh.rotation.x += wr;
    const hb = 1 / (1 + this.y * 0.9);
    this.blob.scale.set(0.95 * hb, 1.3 * hb, 1); this.blob.material.opacity = 0.32 * hb;
  }
}

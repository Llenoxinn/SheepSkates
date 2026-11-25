import * as THREE from 'three';
import { useAppPhase } from './appPhase';
import { BOARD_ARTS, BOARD_ART_SPECS, type BoardArt } from './boardArt';
import { BOARD_SPECS, BOARD_STYLES, type BoardStyle } from './boards';
import { BOARD_COLORS, BOUNDS, BUSHES, checkPlacement, isOnPlaza, PLAZA_TOP, POND, snapBuildCoord, type Obstacle, type PlacementCheck } from './config';
import { clamp, damp, dampA, pick, rand, wrapA } from './math';
import {
  buildShareUrl, clearParkStorage, downloadParkJson, readParkJsonFile, saveParkToStorage,
  type ParkData, type SerializedSheep,
} from './parkSerializer';
import { DEFAULT_PARK_PROPS, ParkProp, updateSeasonalProps, type PropDef, type PropKind, type RailSegment } from './props';
import { Sfx } from './sfx';
import { Sheep, updateWoolFrost, type SheepWorld } from './sheep';
import { useUI, type SelectedEntity, type SheepState, type TrickType } from './store';
import { stepEnvironment, envState } from './weather';

/* ------------------------------------------------------------------ */
/* DOM overlay handles (registered by the React HUD)                    */
/* ------------------------------------------------------------------ */
export const overlay: { sel: HTMLElement | null; tag: HTMLElement | null; bar: HTMLElement | null; layer: HTMLElement | null; comboFill: HTMLElement | null; barHover: boolean } = {
  sel: null, tag: null, bar: null, layer: null, comboFill: null, barHover: false,
};

const MAX_HISTORY = 100;
type Cmd = { do: () => void; undo: () => void };
type Puff = { m: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>; v: THREE.Vector3; life: number; max: number; size: number; rotV: number };
type Spark = { m: THREE.Mesh; v: THREE.Vector3; life: number; max: number };
type SpeedLine = { m: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>; v: THREE.Vector3; life: number; max: number; len: number };
type Confetti = { m: THREE.Mesh; v: THREE.Vector3; rx: number; ry: number; rz: number; life: number; max: number; phase: number };
type Bubble = { el: HTMLElement; s: Sheep };

const PLAZA_DUST = ['#f7f1e6', '#ebe2d3'] as const;
const GRASS_DUST = ['#dde6c3', '#e8dfc6'] as const;
const SPARK_COLORS = ['#fff5cc', '#ffd36b', '#ff9f43', '#ffbe55'] as const;

// scratch
const _a = new THREE.Vector3(), _b = new THREE.Vector3();
const BOX_CORNERS = [-0.36, 0.36].flatMap(x => [0, 1.02].flatMap(y => [-0.6, 0.62].map(z => new THREE.Vector3(x, y, z))));

class World implements SheepWorld {
  readonly group = new THREE.Group();
  flock: Sheep[] = [];
  private dying: Sheep[] = [];
  props: ParkProp[] = [];
  private dyingProps: ParkProp[] = [];
  readonly obstacles: Obstacle[] = [];
  readonly rails: RailSegment[] = [];
  readonly hitTargets: THREE.Object3D[] = [];
  readonly propHitTargets: THREE.Object3D[] = [];
  keys: Record<string, boolean> = {};
  camera: THREE.Camera | null = null;
  selected: Sheep | null = null;
  hovered: Sheep | null = null;
  selectedProp: ParkProp | null = null;
  hoveredProp: ParkProp | null = null;
  moveMode = false;
  setOrbitEnabled: ((on: boolean) => void) | null = null;
  placingKind: PropKind | null = null;
  placingRotY = 0;
  placingValid = true;
  placingReason: PlacementCheck['reason'] = 'ok';
  private gridSnapPinned = false;
  private altHeld = false;
  private ghostX = 1.5;
  private ghostZ = 0.5;
  private ghostTargetX = 1.5;
  private ghostTargetZ = 0.5;
  private rawCursorX = 1.5;
  private rawCursorZ = 0.5;
  private ghostSeeded = false;
  private moveOrigin: { x: number; z: number; rotY: number } | null = null;
  private paletteGesture: { kind: PropKind; startX: number; startY: number; dragged: boolean; wasAlreadyArmed: boolean } | null = null;
  private previewProp: ParkProp | null = null;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  private puffs: Puff[] = []; private puffI = 0;
  private sparks: Spark[] = []; private sparkI = 0;
  private speedLines: SpeedLine[] = []; private speedLineI = 0;
  private confettis: Confetti[] = []; private confettiI = 0;
  private hoverRing: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  private selRing: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  private ghostReticle = new THREE.Group();
  private ghostRing: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  private ghostDisc: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>;
  private ghostChevron: THREE.Mesh<THREE.ShapeGeometry, THREE.MeshBasicMaterial>;
  private markers: { m: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>; t: number }[] = [];
  private bubbles: Bubble[] = [];
  private history: Cmd[] = []; private future: Cmd[] = [];
  private combo = 1; private comboT = 0; private score = 0;
  private barX = 0; private barY = 0; private barFresh = true;
  private shakeAmp = 0; private shakeT = 0; readonly shakeOffset = new THREE.Vector3();

  constructor() {
    const ring = (inner: number, outer: number, color: string) => {
      const m = new THREE.Mesh(new THREE.RingGeometry(inner, outer, 64), new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false, opacity: 0 }));
      m.rotation.x = -Math.PI / 2; this.group.add(m); return m;
    };
    this.hoverRing = ring(0.62, 0.7, '#ffffff');
    this.selRing = ring(0.64, 0.72, '#3b82f6');
    this.ghostRing = new THREE.Mesh(
      new THREE.RingGeometry(0.84, 0.96, 64),
      new THREE.MeshBasicMaterial({ color: '#38bdf8', transparent: true, depthWrite: false, opacity: 0.92 }),
    );
    this.ghostRing.rotation.x = -Math.PI / 2;
    this.ghostDisc = new THREE.Mesh(
      new THREE.CircleGeometry(0.84, 48),
      new THREE.MeshBasicMaterial({ color: '#5eead4', transparent: true, depthWrite: false, opacity: 0.14 }),
    );
    this.ghostDisc.rotation.x = -Math.PI / 2;
    const chevShape = new THREE.Shape();
    chevShape.moveTo(-1.34, 0);
    chevShape.lineTo(-1.02, 0.24);
    chevShape.lineTo(-1.11, 0);
    chevShape.lineTo(-1.02, -0.24);
    chevShape.closePath();
    this.ghostChevron = new THREE.Mesh(
      new THREE.ShapeGeometry(chevShape),
      new THREE.MeshBasicMaterial({ color: '#38bdf8', transparent: true, depthWrite: false, opacity: 0.96, side: THREE.DoubleSide }),
    );
    this.ghostChevron.rotation.x = -Math.PI / 2;
    this.ghostReticle.add(this.ghostDisc, this.ghostRing, this.ghostChevron);
    this.ghostReticle.visible = false;
    this.group.add(this.ghostReticle);
    this.buildParticles();
    this.seedProps();
    this.seedFlock();
  }

  /* ---------------- construction ---------------- */
  private seedProps() {
    for (const def of DEFAULT_PARK_PROPS) {
      const p = new ParkProp(def);
      this.props.push(p);
      this.group.add(p.root);
      this.propHitTargets.push(p.hit);
    }
    this.rebuildRegistry();
  }
  rebuildRegistry() {
    this.obstacles.length = 0;
    this.rails.length = 0;
    this.obstacles.push(
      { x: POND.x - 1.0, z: POND.z, r: 1.7, h: -1 },
      { x: POND.x + 1.0, z: POND.z, r: 1.7, h: -1 },
    );
    for (const [bx, bz] of BUSHES) this.obstacles.push({ x: bx, z: bz, r: 0.55, h: 0.6 });
    for (const p of this.props) {
      if (p.dying) continue;
      p.getObstacles(this.obstacles);
      if (p.kind === 'rail') {
        const seg = p.getRailSegment();
        if (seg) this.rails.push(seg);
      }
    }
  }
  cancelGrindsOnRail(railId: number) {
    for (const s of this.flock) {
      if (s.state === 'grind' && s.grind && s.grind.railId === railId) {
        const after = s.grind.after === 'ride' ? 'ride' : 'cruise';
        s.setState(after, this);
        this.onStateChanged(s);
      }
    }
  }
  private buildParticles() {
    const pg = new THREE.IcosahedronGeometry(0.11, 2);
    for (let i = 0; i < 110; i++) {
      const m = new THREE.Mesh(pg, new THREE.MeshStandardMaterial({ color: '#f7f1e6', roughness: 1, transparent: true, depthWrite: false }));
      m.visible = false; this.group.add(m); this.puffs.push({ m, v: new THREE.Vector3(), life: 1, max: 1, size: 1, rotV: 0 });
    }
    const sg = new THREE.BoxGeometry(0.022, 0.022, 0.19);
    const sparkMats = SPARK_COLORS.map(color => new THREE.MeshBasicMaterial({ color, toneMapped: false }));
    for (let i = 0; i < 140; i++) {
      const m = new THREE.Mesh(sg, sparkMats[i % sparkMats.length]!);
      m.visible = false; this.group.add(m); this.sparks.push({ m, v: new THREE.Vector3(), life: 1, max: 0.4 });
    }
    const lg = new THREE.BoxGeometry(0.018, 0.018, 0.65);
    for (let i = 0; i < 36; i++) {
      const m = new THREE.Mesh(lg, new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false }));
      m.visible = false; this.group.add(m); this.speedLines.push({ m, v: new THREE.Vector3(), life: 1, max: 0.25, len: 1 });
    }
    const cg = new THREE.PlaneGeometry(0.11, 0.065);
    const confettiMats = BOARD_COLORS.map(color => new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    for (let i = 0; i < 90; i++) {
      const m = new THREE.Mesh(cg, confettiMats[i % confettiMats.length]!);
      m.visible = false; this.group.add(m); this.confettis.push({ m, v: new THREE.Vector3(), rx: 0, ry: 0, rz: 0, life: 1, max: 1.5, phase: 0 });
    }
  }
  private seedFlock() {
    const seeds: ConstructorParameters<typeof Sheep>[0][] = [
      { x: 0, z: 1.5, state: 'cruise', color: 0, boardStyle: 'street', boardArt: 'baa' },
      { x: 4, z: -1, state: 'cruise', color: 1, boardStyle: 'cruiser', boardArt: 'daisy' },
      { x: 5, z: 3, state: 'cruise', color: 2, boardStyle: 'oldschool', boardArt: 'flames' },
      { x: -1.5, z: -3.6, state: 'grind', color: 3, boardStyle: 'street', boardArt: 'checker' },
      { x: 2, z: -0.5, state: 'cruise', color: 4, boardStyle: 'pintail', boardArt: 'sunset' },
      { x: -8, z: -2.4, heading: 1.2, state: 'idle', color: 5, boardStyle: 'pintail', boardArt: 'sakura' },
      { x: -6.6, z: 5.6, heading: -2.4, state: 'idle', color: 6, boardStyle: 'cruiser', boardArt: 'gingham' },
      { x: 9.6, z: 5.0, heading: 3.6, state: 'idle', color: 2, boardStyle: 'oldschool', boardArt: 'cloud' },
      { x: 10, z: -3, heading: -0.8, state: 'idle', color: 0, boardStyle: 'street', boardArt: 'daisy' },
    ];
    for (const o of seeds) { const s = new Sheep({ ...o, state: 'idle' }); this.attach(s); s.setState(o!.state ?? 'idle', this); }
  }

  /* ---------------- SheepWorld services ---------------- */
  get livePlay(): boolean { return useAppPhase.getState().phase === 'playing'; }
  cameraForward(out: THREE.Vector3) {
    if (!this.camera) return out.set(0, 0, -1);
    this.camera.getWorldDirection(out); out.y = 0; return out.normalize();
  }
  randomSpot(wide: boolean, out: THREE.Vector3) {
    for (let i = 0; i < 40; i++) {
      const x = wide ? rand(-11, 11) : rand(-2.2, 6.2), z = wide ? rand(-7.4, 7.4) : rand(-3.7, 4.3);
      let free = true;
      for (const o of this.obstacles) if (Math.hypot(x - o.x, z - o.z) <= o.r + 0.9) { free = false; break; }
      if (free) return out.set(x, 0, z);
    }
    return out.set(2, 0, 0.5);
  }
  puff(p: THREE.Vector3, n: number, spread = 1.6, size = 1, tint?: string) {
    const palette = isOnPlaza(p.x, p.z) ? PLAZA_DUST : GRASS_DUST;
    for (let i = 0; i < n; i++) {
      const q = this.puffs[this.puffI++ % this.puffs.length]!, a = rand(0, 6.28);
      q.m.material.color.set(tint ?? pick(palette));
      q.m.position.set(p.x + Math.cos(a) * 0.2, p.y + 0.06, p.z + Math.sin(a) * 0.2);
      q.m.rotation.set(rand(0, 6.28), rand(0, 6.28), rand(0, 6.28));
      q.v.set(Math.cos(a) * spread * rand(0.5, 1), rand(0.3, 0.9), Math.sin(a) * spread * rand(0.5, 1));
      q.rotV = rand(-2.8, 2.8);
      q.life = 0; q.max = rand(0.45, 0.78); q.size = size * rand(0.7, 1.3); q.m.visible = true;
    }
  }
  spark(x: number, y: number, z: number, dx: number, dz: number) {
    const s = this.sparks[this.sparkI++ % this.sparks.length]!;
    s.m.position.set(x, y, z);
    s.v.set(-dx * rand(0.8, 2.6) + rand(-1.1, 1.1), rand(1.1, 2.8), -dz * rand(0.8, 2.6) + rand(-1.1, 1.1));
    _a.copy(s.m.position).add(s.v); s.m.lookAt(_a);
    s.m.scale.set(1, 1, 1);
    s.life = 0; s.max = rand(0.2, 0.42); s.m.visible = true;
  }
  speedLine(x: number, y: number, z: number, heading: number, speed: number) {
    const l = this.speedLines[this.speedLineI++ % this.speedLines.length]!;
    const fx = Math.sin(heading), fz = Math.cos(heading);
    const rx = fz, rz = -fx;
    const side = (Math.random() < 0.5 ? -1 : 1) * rand(0.42, 0.95);
    const fwd = rand(-0.4, 0.45);
    l.m.position.set(x + rx * side + fx * fwd, y + rand(0.28, 1.05), z + rz * side + fz * fwd);
    l.m.rotation.set(0, heading, 0);
    const drift = speed * rand(0.25, 0.45);
    l.v.set(-fx * drift, 0, -fz * drift);
    l.len = clamp(speed * 0.28, 0.75, 1.6);
    l.life = 0; l.max = rand(0.18, 0.3); l.m.material.opacity = 0; l.m.visible = true;
  }
  confetti(x: number, y: number, z: number, count = 28) {
    for (let i = 0; i < count; i++) {
      const c = this.confettis[this.confettiI++ % this.confettis.length]!;
      const a = rand(0, 6.28), r = rand(0.8, 3.0);
      c.m.position.set(x + Math.cos(a) * 0.15, y, z + Math.sin(a) * 0.15);
      c.v.set(Math.cos(a) * r, rand(3.2, 5.8), Math.sin(a) * r);
      c.m.rotation.set(rand(0, 6.28), rand(0, 6.28), rand(0, 6.28));
      c.rx = rand(-9, 9); c.ry = rand(-9, 9); c.rz = rand(-9, 9);
      c.phase = rand(0, 6.28); c.life = 0; c.max = rand(1.2, 1.9);
      c.m.scale.setScalar(rand(0.85, 1.25)); c.m.visible = true;
    }
  }
  bumpCones(s: Sheep) {
    const p = s.pos;
    for (const c of this.props) {
      if (c.kind !== 'cone' || c.dying || !c.conePivot) continue;
      const dx = c.x - p.x, dz = c.z - p.z, d = Math.hypot(dx, dz);
      if (d < 0.5 && Math.abs(s.speed) > 0.7 && c.cd <= 0 && d > 1e-4) {
        c.axis.set(dz / d, 0, -dx / d); c.tv += 7 + Math.abs(s.speed) * 2; c.cd = 0.8;
        s.sqV += 2;
        if (!this.livePlay) continue;
        Sfx.bonk();
        if (s.state === 'ride') this.award('Bonk', 10, c.x, 0.9, c.z, false, 'small');
        else this.popText(c.x, 0.9, c.z, 'bonk', 'small');
      }
    }
  }
  onStateChanged(s: Sheep) { if (s === this.selected) this.syncUI(); }
  shake(amount: number) {
    if (!this.livePlay) return;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    this.shakeAmp = Math.min(0.16, Math.max(this.shakeAmp, amount));
  }

  /* ---------------- score + floating text ---------------- */
  private toScreen(x: number, y: number, z: number): [number, number, boolean] {
    if (!this.camera) return [0, 0, false];
    _a.set(x, y, z).project(this.camera);
    return [(_a.x + 1) / 2 * innerWidth, (1 - _a.y) / 2 * innerHeight, _a.z < 1];
  }
  popText(x: number, y: number, z: number, text: string, cls = '') {
    if (!this.livePlay) return;
    const [sx, sy, ok] = this.toScreen(x, y, z);
    if (!ok || !overlay.layer) return;
    const el = document.createElement('div'); el.className = `pop ${cls}`; el.textContent = text;
    el.style.left = `${sx}px`; el.style.top = `${sy}px`;
    overlay.layer.appendChild(el); el.addEventListener('animationend', () => el.remove());
  }
  award(name: string, pts: number, x: number, y: number, z: number, big = false, cls = '') {
    if (!this.livePlay) return;
    this.combo = this.comboT > 0 ? Math.min(this.combo + 1, 5) : 1; this.comboT = 2.4;
    if (overlay.comboFill) overlay.comboFill.style.transform = 'scaleX(1)';
    const total = pts * this.combo; this.score += total;
    useUI.setState({ score: this.score, combo: this.combo });
    this.popText(x, y, z, `${name}! +${total}${this.combo > 1 ? `  ×${this.combo}` : ''}`, cls || (big || this.combo > 2 ? 'big' : ''));
    if (this.combo > 2 || big) Sfx.ding();
    if (this.combo >= 3 || big) {
      this.confetti(x, y + 0.35, z, this.combo >= 4 ? 42 : 26);
      // Nearby flock members bounce & cheer when witnessing a big combo
      let witness: Sheep | null = null;
      let bestD = 5.2;
      for (const s of this.flock) {
        if (s === this.selected || s.dying) continue;
        const d = Math.hypot(s.pos.x - x, s.pos.z - z);
        if (d < bestD) { bestD = d; witness = s; }
      }
      if (witness) {
        witness.sqV += 4.5;
        if (this.combo >= 4) this.say(witness, pick(['rad!', 'baaa!', 'steezy!', 'goat!']));
      }
    }
  }
  say(s: Sheep, text: string) {
    if (!this.livePlay || !overlay.layer) return;
    const el = document.createElement('div'); el.className = 'bubble'; el.textContent = text;
    overlay.layer.appendChild(el);
    const b = { el, s }; this.bubbles.push(b); this.placeBubble(b);
    el.addEventListener('animationend', () => { el.remove(); this.bubbles.splice(this.bubbles.indexOf(b), 1); });
  }
  private placeBubble(b: Bubble) {
    const [x, y] = this.toScreen(b.s.pos.x, b.s.y + 1.4, b.s.pos.z);
    b.el.style.left = `${x}px`; b.el.style.top = `${y}px`;
  }

  /* ---------------- flock membership ---------------- */
  private attach(s: Sheep) {
    this.group.add(s.root); this.flock.push(s); this.hitTargets.push(s.hit);
  }
  private addSheep(s: Sheep, drop = false) {
    s.revive(); if (drop) { s.popT = 1; s.root.scale.setScalar(1); s.dropIn(); }
    if (!this.group.children.includes(s.root)) this.group.add(s.root);
    this.dying = this.dying.filter(d => d !== s);
    this.flock.push(s); this.hitTargets.push(s.hit);
  }
  private removeSheep(s: Sheep) {
    s.kill(); Sfx.poof();
    this.puff(_b.copy(s.pos).setY(0.25), 12, 2.4, 2.2);
    this.flock = this.flock.filter(f => f !== s);
    const j = this.hitTargets.indexOf(s.hit); if (j >= 0) this.hitTargets.splice(j, 1);
    this.dying.push(s);
    if (this.selected === s) this.deselect();
  }

  /* ---------------- selection + commands ---------------- */
  showToast(msg: string) {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    useUI.setState({ toast: msg });
    this.toastTimer = setTimeout(() => {
      useUI.setState({ toast: null });
      this.toastTimer = null;
    }, 2200);
  }
  get isGridSnap(): boolean {
    return this.gridSnapPinned || this.altHeld;
  }
  private rotDeg(r: number): number {
    return Math.round(((wrapA(r) * 180) / Math.PI + 360) % 360);
  }
  select(s: Sheep) {
    if (this.moveMode) this.cancelMoveMode();
    if (this.placingKind) this.cancelPlacement();
    this.selectedProp = null; this.moveMode = false;
    if (this.selected === s) { s.sqV += 6; Sfx.baa(s.voicePitch * rand(1.02, 1.14), s.voiceVib, s.voiceDur); this.say(s, pick(['baa!', 'baaa~', 'meh', 'rad!', 'hi :)', 'wheee'])); return; }
    this.selected = s; this.barFresh = true;
    s.sqV += 7; Sfx.pop(); Sfx.baa(s.voicePitch, s.voiceVib, s.voiceDur); this.say(s, pick(['baa!', 'baaa?', 'ready!', 'yo!']));
    overlay.sel?.classList.remove('on'); void overlay.sel?.offsetWidth; overlay.sel?.classList.add('on');
    this.syncUI();
  }
  selectProp(p: ParkProp) {
    if (this.moveMode && this.selectedProp !== p) this.cancelMoveMode();
    if (this.placingKind) this.cancelPlacement();
    this.selected = null; this.moveMode = false;
    if (this.selectedProp === p) { p.sqV += 5; Sfx.pop(); return; }
    this.selectedProp = p; this.barFresh = true;
    p.sqV += 5; Sfx.pop();
    overlay.sel?.classList.remove('on'); void overlay.sel?.offsetWidth; overlay.sel?.classList.add('on');
    this.syncUI();
  }
  deselect() {
    if (this.moveMode) this.cancelMoveMode();
    if (this.placingKind) this.cancelPlacement();
    this.selected = null; this.selectedProp = null; this.moveMode = false;
    overlay.sel?.classList.remove('on'); this.syncUI();
  }
  cycleSheep(dir: 1 | -1 = 1): Sheep | null {
    const alive = this.flock.filter(s => !s.dying);
    if (alive.length === 0) return null;
    if (!this.selected) {
      return this.ensureSheepSelected();
    }
    const idx = alive.indexOf(this.selected);
    const next = alive[(idx + dir + alive.length) % alive.length]!;
    this.select(next);
    return next;
  }
  ensureSheepSelected(): Sheep | null {
    if (this.selected && !this.selected.dying) return this.selected;
    let best: Sheep | null = null;
    let bestScore = Infinity;
    for (const s of this.flock) {
      if (s.dying) continue;
      // Prefer cruising/grinding sheep near the plaza center
      const dist = Math.hypot(s.pos.x, s.pos.z) - (s.state === 'cruise' ? 2.5 : 0);
      if (dist < bestScore) { bestScore = dist; best = s; }
    }
    if (best) this.select(best);
    return best;
  }
  toggleBuildMode(on?: boolean) {
    const next = on ?? !useUI.getState().buildMode;
    if (!next) {
      if (this.moveMode) this.cancelMoveMode();
      this.cancelPlacement();
    }
    useUI.setState({ buildMode: next, moveMode: next ? this.moveMode : false });
    Sfx.tick();
  }
  toggleMoveMode(on?: boolean) {
    if (!this.selectedProp) return;
    const next = on ?? !this.moveMode;
    if (next) {
      this.cancelPlacement();
      const p = this.selectedProp;
      this.moveOrigin = { x: p.x, z: p.z, rotY: p.rotY };
      this.ghostX = p.x; this.ghostZ = p.z;
      this.ghostTargetX = p.x; this.ghostTargetZ = p.z;
      this.rawCursorX = p.x; this.rawCursorZ = p.z;
      this.ghostSeeded = true;
      const check = checkPlacement(p.x, p.z);
      this.placingValid = check.valid;
      this.placingReason = check.reason;
      this.moveMode = true;
      p.setTransform(p.x, p.z, p.rotY, 0.06);
      useUI.setState({ placingValid: check.valid, placingReason: check.reason });
      Sfx.tick();
      this.syncUI();
    } else {
      this.cancelMoveMode();
    }
  }
  cancelMoveMode() {
    if (!this.moveMode) return;
    const p = this.selectedProp, orig = this.moveOrigin;
    this.moveMode = false;
    this.moveOrigin = null;
    this.ghostReticle.visible = false;
    if (p && orig) {
      p.setGhostLook('off');
      p.setTransform(orig.x, orig.z, orig.rotY, 0);
      if (p.kind === 'rail') this.cancelGrindsOnRail(p.id);
      this.rebuildRegistry();
    }
    this.placingValid = true;
    this.placingReason = 'ok';
    useUI.setState({ placingValid: true, placingReason: 'ok' });
    Sfx.tick();
    this.syncUI();
  }
  commitMoveProp(): boolean {
    if (!this.selectedProp || !this.moveMode) return false;
    const check = checkPlacement(this.ghostTargetX, this.ghostTargetZ);
    if (!check.valid) {
      Sfx.bonk();
      this.showToast(check.reason === 'pond' ? "Can't place in the pond!" : 'Stay inside the island bounds');
      return false;
    }
    const p = this.selectedProp;
    const orig = this.moveOrigin ?? { x: p.x, z: p.z, rotY: p.rotY };
    const toX = clamp(this.ghostTargetX, -BOUNDS.x, BOUNDS.x);
    const toZ = clamp(this.ghostTargetZ, -BOUNDS.z, BOUNDS.z);
    const toRot = p.rotY;
    p.setGhostLook('off');
    this.moveMode = false;
    this.moveOrigin = null;
    this.ghostReticle.visible = false;
    this.placingValid = true;
    this.placingReason = 'ok';
    useUI.setState({ placingValid: true, placingReason: 'ok' });
    if (Math.hypot(toX - orig.x, toZ - orig.z) < 0.02 && Math.abs(wrapA(toRot - orig.rotY)) < 0.01) {
      p.setTransform(orig.x, orig.z, orig.rotY, 0);
      this.rebuildRegistry();
      this.syncUI();
      return true;
    }
    this.commit({
      do: () => {
        p.setTransform(toX, toZ, toRot, 0);
        p.sqV += 4;
        if (p.kind === 'rail') this.cancelGrindsOnRail(p.id);
        this.rebuildRegistry();
        this.syncUI();
        saveParkToStorage(this.serializePark());
      },
      undo: () => {
        p.setTransform(orig.x, orig.z, orig.rotY, 0);
        p.sqV += 4;
        if (p.kind === 'rail') this.cancelGrindsOnRail(p.id);
        this.rebuildRegistry();
        this.syncUI();
        saveParkToStorage(this.serializePark());
      },
    });
    Sfx.pop();
    this.puff(_b.set(toX, 0.12, toZ), 6, 1.2, 1.0);
    return true;
  }
  syncUI() {
    const s = this.selected, p = this.selectedProp;
    const selected: SelectedEntity | null = s
      ? { kind: 'sheep', id: s.id, name: s.name, state: s.state === 'goto' ? s.after : s.state, boardStyle: s.boardStyle, boardArt: s.boardArt }
      : p
        ? { kind: 'prop', id: p.id, propKind: p.kind, name: p.label, rotDeg: Math.round(((wrapA(p.rotY) * 180) / Math.PI + 360) % 360) }
        : null;
    useUI.setState({
      selected,
      moveMode: p ? this.moveMode : false,
      canUndo: this.history.length > 0, canRedo: this.future.length > 0,
    });
  }
  private commit(c: Cmd) {
    c.do(); this.history.push(c);
    if (this.history.length > MAX_HISTORY) this.history.shift();
    this.future.length = 0; this.syncUI();
  }
  undo() { const c = this.history.pop(); if (!c) return; c.undo(); this.future.push(c); Sfx.tick(); this.syncUI(); }
  redo() { const c = this.future.pop(); if (!c) return; c.do(); this.history.push(c); Sfx.tick(); this.syncUI(); }

  private attachProp(p: ParkProp, pop = true) {
    p.revive();
    if (!pop) { p.popT = 1; p.root.scale.setScalar(1); }
    if (!this.group.children.includes(p.root)) this.group.add(p.root);
    this.dyingProps = this.dyingProps.filter(d => d !== p);
    if (!this.props.includes(p)) this.props.push(p);
    if (!this.propHitTargets.includes(p.hit)) this.propHitTargets.push(p.hit);
    this.rebuildRegistry();
  }
  private detachProp(p: ParkProp) {
    p.kill(); Sfx.poof();
    this.puff(_b.set(p.x, 0.25, p.z), 12, 2.2, 2.0);
    this.props = this.props.filter(x => x !== p);
    const j = this.propHitTargets.indexOf(p.hit); if (j >= 0) this.propHitTargets.splice(j, 1);
    this.dyingProps.push(p);
    if (p.kind === 'rail') this.cancelGrindsOnRail(p.id);
    if (this.selectedProp === p) {
      this.moveMode = false;
      this.moveOrigin = null;
      this.ghostReticle.visible = false;
      p.setGhostLook('off');
      this.deselect();
    }
    this.rebuildRegistry();
  }
  addProp(def: PropDef, selectIt = true): ParkProp {
    const x = clamp(def.x, -BOUNDS.x, BOUNDS.x), z = clamp(def.z, -BOUNDS.z, BOUNDS.z);
    const p = new ParkProp({ ...def, x, z });
    this.commit({
      do: () => {
        this.attachProp(p, true);
        Sfx.pop();
        this.puff(_b.set(p.x, 0.12, p.z), 8, 1.4, 1.1);
        if (selectIt) this.selectProp(p);
        saveParkToStorage(this.serializePark());
      },
      undo: () => {
        this.detachProp(p);
        saveParkToStorage(this.serializePark());
      },
    });
    return p;
  }
  rotateProp(deltaAngle = Math.PI / 4) {
    const p = this.selectedProp; if (!p) return;
    const prevRot = p.rotY, nextRot = wrapA(prevRot + deltaAngle);
    this.commit({
      do: () => {
        p.setTransform(p.x, p.z, nextRot);
        p.sqV += 4;
        if (p.kind === 'rail') this.cancelGrindsOnRail(p.id);
        this.rebuildRegistry();
        Sfx.tick();
        this.syncUI();
        saveParkToStorage(this.serializePark());
      },
      undo: () => {
        p.setTransform(p.x, p.z, prevRot);
        p.sqV += 4;
        if (p.kind === 'rail') this.cancelGrindsOnRail(p.id);
        this.rebuildRegistry();
        Sfx.tick();
        this.syncUI();
        saveParkToStorage(this.serializePark());
      },
    });
  }
  movePropLive(p: ParkProp, x: number, z: number) {
    const check = checkPlacement(x, z);
    if (check.valid !== this.placingValid || check.reason !== this.placingReason) {
      this.placingValid = check.valid;
      this.placingReason = check.reason;
      useUI.setState({ placingValid: check.valid, placingReason: check.reason });
    }
    p.setGhostLook(check.valid ? 'off' : 'invalid');
    p.setTransform(clamp(x, -BOUNDS.x, BOUNDS.x), clamp(z, -BOUNDS.z, BOUNDS.z), p.rotY, 0.04);
    if (p.kind === 'rail') this.cancelGrindsOnRail(p.id);
    this.rebuildRegistry();
  }
  movePropCommit(p: ParkProp, fromX: number, fromZ: number, toX: number, toZ: number) {
    p.setGhostLook('off');
    const check = checkPlacement(toX, toZ);
    if (!check.valid) {
      p.setTransform(fromX, fromZ, p.rotY, 0);
      if (p.kind === 'rail') this.cancelGrindsOnRail(p.id);
      this.rebuildRegistry();
      this.placingValid = true;
      this.placingReason = 'ok';
      useUI.setState({ placingValid: true, placingReason: 'ok' });
      Sfx.bonk();
      this.showToast(check.reason === 'pond' ? "Can't place in the pond!" : 'Stay inside the island bounds');
      return;
    }
    const cx = clamp(toX, -BOUNDS.x, BOUNDS.x), cz = clamp(toZ, -BOUNDS.z, BOUNDS.z);
    if (Math.hypot(cx - fromX, cz - fromZ) < 0.02) {
      p.setTransform(fromX, fromZ, p.rotY, 0);
      this.rebuildRegistry();
      return;
    }
    this.commit({
      do: () => {
        p.setTransform(cx, cz, p.rotY, 0);
        p.sqV += 3;
        if (p.kind === 'rail') this.cancelGrindsOnRail(p.id);
        this.rebuildRegistry();
        this.syncUI();
        saveParkToStorage(this.serializePark());
      },
      undo: () => {
        p.setTransform(fromX, fromZ, p.rotY, 0);
        p.sqV += 3;
        if (p.kind === 'rail') this.cancelGrindsOnRail(p.id);
        this.rebuildRegistry();
        this.syncUI();
        saveParkToStorage(this.serializePark());
      },
    });
    Sfx.tick();
  }
  nudgeSelectedProp(dx: number, dz: number) {
    const p = this.selectedProp; if (!p) return;
    this.movePropCommit(p, p.x, p.z, p.x + dx, p.z + dz);
  }
  armPlacement(kind: PropKind) {
    if (this.moveMode) this.cancelMoveMode();
    this.selected = null;
    this.selectedProp = null;
    overlay.sel?.classList.remove('on');
    if (this.previewProp) {
      this.group.remove(this.previewProp.root);
      this.previewProp = null;
    }
    if (this.placingKind !== kind) this.placingRotY = 0;
    this.placingKind = kind;
    this.placingValid = true;
    this.placingReason = 'ok';
    const p = new ParkProp({ kind, x: this.ghostTargetX, z: this.ghostTargetZ, rotY: this.placingRotY });
    p.setGhostLook('valid');
    p.popT = 1;
    p.root.scale.setScalar(1);
    p.root.visible = this.ghostSeeded;
    this.group.add(p.root);
    this.previewProp = p;
    useUI.setState({
      selected: null,
      moveMode: false,
      placingKind: kind,
      placingRotDeg: this.rotDeg(this.placingRotY),
      placingValid: true,
      placingReason: 'ok',
    });
    Sfx.tick();
  }
  cancelPlacement() {
    if (this.previewProp) {
      this.group.remove(this.previewProp.root);
      this.previewProp = null;
    }
    this.placingKind = null;
    this.paletteGesture = null;
    this.ghostSeeded = false;
    this.ghostReticle.visible = false;
    this.placingValid = true;
    this.placingReason = 'ok';
    useUI.setState({ placingKind: null, draggingPalette: null, placingValid: true, placingReason: 'ok' });
  }
  beginPaletteInteraction(kind: PropKind, clientX = 0, clientY = 0) {
    const wasAlreadyArmed = this.placingKind === kind;
    this.armPlacement(kind);
    this.paletteGesture = { kind, startX: clientX, startY: clientY, dragged: false, wasAlreadyArmed };
    useUI.setState({ draggingPalette: kind });
  }
  markPaletteDragged(clientX: number, clientY: number): boolean {
    if (!this.paletteGesture) return false;
    if (Math.hypot(clientX - this.paletteGesture.startX, clientY - this.paletteGesture.startY) > 12) {
      this.paletteGesture.dragged = true;
    }
    return this.paletteGesture.dragged;
  }
  finishPaletteInteraction(onCanvas: boolean, x?: number, z?: number, shiftKey = false) {
    const g = this.paletteGesture;
    this.paletteGesture = null;
    useUI.setState({ draggingPalette: null });
    if (!g) return;
    if (!g.dragged) {
      if (g.wasAlreadyArmed) {
        this.cancelPlacement();
        Sfx.tick();
      }
      return;
    }
    if (onCanvas && x !== undefined && z !== undefined) {
      this.updateGlideCursor(x, z, this.altHeld);
      this.commitGlidePlacement(shiftKey);
    } else {
      this.hidePalettePreview();
    }
  }
  rotatePlacement(deltaAngle = Math.PI / 4) {
    if (this.placingKind) {
      this.placingRotY = wrapA(this.placingRotY + deltaAngle);
      if (this.previewProp) this.previewProp.sqV += 3.5;
      Sfx.tick();
      useUI.setState({ placingRotDeg: this.rotDeg(this.placingRotY) });
      return;
    }
    if (this.selectedProp && this.moveMode) {
      const p = this.selectedProp;
      p.rotY = wrapA(p.rotY + deltaAngle);
      p.sqV += 3.5;
      Sfx.tick();
      this.syncUI();
      return;
    }
    if (this.selectedProp) this.rotateProp(deltaAngle);
  }
  setAltHeld(alt: boolean) {
    if (this.altHeld === alt) return;
    this.altHeld = alt;
    useUI.setState({ gridSnap: this.isGridSnap });
    if (this.ghostSeeded && (this.placingKind || this.moveMode)) {
      this.updateGlideCursor(this.rawCursorX, this.rawCursorZ, alt);
    }
  }
  toggleGridSnap(on?: boolean) {
    this.gridSnapPinned = on ?? !this.gridSnapPinned;
    useUI.setState({ gridSnap: this.isGridSnap });
    if (this.ghostSeeded && (this.placingKind || this.moveMode)) {
      this.updateGlideCursor(this.rawCursorX, this.rawCursorZ, this.altHeld);
    }
  }
  updateGlideCursor(rawX: number, rawZ: number, altKey = this.altHeld) {
    this.rawCursorX = rawX;
    this.rawCursorZ = rawZ;
    if (altKey !== this.altHeld) {
      this.altHeld = altKey;
      useUI.setState({ gridSnap: this.isGridSnap });
    }
    const sx = snapBuildCoord(rawX, this.isGridSnap);
    const sz = snapBuildCoord(rawZ, this.isGridSnap);
    const check = checkPlacement(sx, sz);
    if (check.valid !== this.placingValid || check.reason !== this.placingReason) {
      this.placingValid = check.valid;
      this.placingReason = check.reason;
      useUI.setState({ placingValid: check.valid, placingReason: check.reason });
    }
    this.ghostTargetX = clamp(sx, -BOUNDS.x - 1.2, BOUNDS.x + 1.2);
    this.ghostTargetZ = clamp(sz, -BOUNDS.z - 1.2, BOUNDS.z + 1.2);
    if (!this.ghostSeeded) {
      this.ghostX = this.ghostTargetX;
      this.ghostZ = this.ghostTargetZ;
      this.ghostSeeded = true;
    }
    if (this.previewProp) {
      this.previewProp.root.visible = true;
      this.previewProp.setGhostLook(check.valid ? 'valid' : 'invalid');
    }
  }
  commitGlidePlacement(keepArmed = false): boolean {
    if (!this.placingKind) return false;
    const check = checkPlacement(this.ghostTargetX, this.ghostTargetZ);
    if (!check.valid) {
      Sfx.bonk();
      this.showToast(check.reason === 'pond' ? "Can't build in the pond!" : 'Place inside the island bounds');
      if (this.previewProp) this.previewProp.sqV -= 4;
      return false;
    }
    const kind = this.placingKind, x = this.ghostTargetX, z = this.ghostTargetZ, rotY = this.placingRotY;
    if (keepArmed) {
      this.addProp({ kind, x, z, rotY }, false);
      if (this.previewProp) this.previewProp.sqV += 5;
    } else {
      this.cancelPlacement();
      this.addProp({ kind, x, z, rotY }, true);
    }
    return true;
  }
  beginPaletteDrag(kind: PropKind) {
    this.beginPaletteInteraction(kind, 0, 0);
  }
  updatePalettePreview(x: number, z: number) {
    this.updateGlideCursor(x, z, this.altHeld);
  }
  hidePalettePreview() {
    if (this.previewProp) this.previewProp.root.visible = false;
    this.ghostReticle.visible = false;
  }
  finishPaletteDrag(x?: number, z?: number) {
    this.finishPaletteInteraction(x !== undefined && z !== undefined, x, z, false);
  }
  cancelPaletteDrag() {
    this.cancelPlacement();
  }

  setBoard(style: BoardStyle, art: BoardArt) {
    const s = this.selected; if (!s || (s.boardStyle === style && s.boardArt === art)) return;
    const prevStyle = s.boardStyle, prevArt = s.boardArt;
    Sfx.pop();
    this.commit({
      do: () => {
        s.setBoard(style, art);
        this.puff(s.pos, 4, 0.9, 0.7);
        this.syncUI();
      },
      undo: () => {
        s.setBoard(prevStyle, prevArt);
        this.puff(s.pos, 4, 0.9, 0.7);
        this.syncUI();
      },
    });
  }
  setBoardStyle(style: BoardStyle) {
    const s = this.selected; if (s) this.setBoard(style, s.boardArt);
  }
  setBoardArt(art: BoardArt) {
    const s = this.selected; if (s) this.setBoard(s.boardStyle, art);
  }
  randomizeBoard() {
    const s = this.selected; if (!s) return;
    let style = s.boardStyle, art = s.boardArt;
    for (let i = 0; i < 8 && style === s.boardStyle && art === s.boardArt; i++) {
      style = BOARD_STYLES[(Math.random() * BOARD_STYLES.length) | 0]!;
      art = BOARD_ARTS[(Math.random() * BOARD_ARTS.length) | 0]!;
    }
    this.setBoard(style, art);
  }
  cycleBoardStyle() {
    const s = this.selected; if (!s) return;
    const idx = BOARD_STYLES.indexOf(s.boardStyle);
    this.setBoardStyle(BOARD_STYLES[(idx + 1) % BOARD_STYLES.length]!);
  }
  setState(st: SheepState) {
    const s = this.selected; if (!s || s.state === st) return;
    if (st === 'grind' && this.rails.length === 0) {
      this.say(s, 'place a rail first!');
      return;
    }
    const prev: SheepState = s.state === 'goto' ? s.after : s.state === 'grind' ? 'cruise' : s.state;
    Sfx.tick();
    this.commit({ do: () => { s.setState(st, this); this.onStateChanged(s); }, undo: () => { s.setState(prev, this); this.onStateChanged(s); } });
    if (st === 'grind') this.say(s, 'to the rail!');
  }
  trick(type: TrickType) {
    const s = this.selected; if (!s) return;
    if (s.doTrick(type)) useUI.setState(u => ({ firedTrick: { type, n: (u.firedTrick?.n ?? 0) + 1 } }));
  }
  duplicate() {
    if (this.selectedProp) {
      const o = this.selectedProp;
      const x = clamp(o.x + 1.3, -BOUNDS.x, BOUNDS.x), z = clamp(o.z + 1.1, -BOUNDS.z, BOUNDS.z);
      const c = new ParkProp({ ...o.toDef(), x, z });
      this.commit({
        do: () => {
          this.attachProp(c, true);
          Sfx.pop();
          this.puff(_b.set(c.x, 0.12, c.z), 6, 1.2, 1);
          this.selectProp(c);
          saveParkToStorage(this.serializePark());
        },
        undo: () => {
          this.detachProp(c);
          saveParkToStorage(this.serializePark());
        },
      });
      return;
    }
    const o = this.selected; if (!o) return;
    const a = o.heading + Math.PI / 2;
    const x = clamp(o.pos.x + Math.sin(a) * 1.3, -11.5, 11.5), z = clamp(o.pos.z + Math.cos(a) * 1.3, -7.6, 7.6);
    const st: SheepState = o.state === 'grind' ? 'cruise' : o.state === 'ride' || o.state === 'goto' ? 'idle' : o.state;
    const c = new Sheep({ x, z, heading: o.heading, state: st, color: o.color, hat: o.hat, boardStyle: o.boardStyle, boardArt: o.boardArt });
    c.spawnPop();
    this.commit({ do: () => { this.addSheep(c); Sfx.pop(); this.puff(c.pos, 6, 1.2, 1); this.select(c); }, undo: () => this.removeSheep(c) });
  }
  remove() {
    if (this.selectedProp) {
      const p = this.selectedProp;
      this.commit({
        do: () => {
          this.detachProp(p);
          saveParkToStorage(this.serializePark());
        },
        undo: () => {
          this.attachProp(p, true);
          Sfx.pop();
          saveParkToStorage(this.serializePark());
        },
      });
      return;
    }
    const s = this.selected; if (!s) return;
    const wasGrinding = s.state === 'grind';
    this.commit({
      do: () => this.removeSheep(s),
      undo: () => {
        this.addSheep(s);
        if (wasGrinding) s.setState('grind', this);
        Sfx.pop();
      },
    });
  }

  /* ---------------- park save / load / share ---------------- */
  serializePark(): ParkData {
    const props = this.props.map(p => p.toDef());
    const flock: SerializedSheep[] = this.flock.map(s => ({
      x: Math.round(s.pos.x * 100) / 100,
      z: Math.round(s.pos.z * 100) / 100,
      heading: Math.round(wrapA(s.heading) * 100) / 100,
      state: s.state === 'goto' || s.state === 'ride' ? 'idle' : s.state,
      color: s.color,
      hat: s.hat,
      name: s.name,
      boardStyle: s.boardStyle,
      boardArt: s.boardArt,
    }));
    return { version: 1, props, flock };
  }
  private applyParkSnapshot(data: ParkData) {
    this.deselect();
    for (const p of this.props) this.group.remove(p.root);
    for (const p of this.dyingProps) this.group.remove(p.root);
    this.props.length = 0;
    this.dyingProps.length = 0;
    this.propHitTargets.length = 0;

    for (const def of data.props) {
      const p = new ParkProp(def);
      p.spawnPop();
      this.props.push(p);
      this.group.add(p.root);
      this.propHitTargets.push(p.hit);
    }
    this.rebuildRegistry();

    if (data.flock && data.flock.length > 0) {
      for (const s of this.flock) {
        if (s.state === 'grind') s.exitGrind();
        this.group.remove(s.root);
      }
      for (const s of this.dying) this.group.remove(s.root);
      this.flock.length = 0;
      this.dying.length = 0;
      this.hitTargets.length = 0;
      for (const sd of data.flock) {
        const s = new Sheep({ x: sd.x, z: sd.z, heading: sd.heading, state: 'idle', color: sd.color, hat: sd.hat, name: sd.name, boardStyle: sd.boardStyle, boardArt: sd.boardArt });
        this.attach(s);
        s.setState(sd.state ?? 'idle', this);
      }
    } else {
      for (const s of this.flock) {
        if (s.state === 'grind') s.setState('grind', this);
      }
    }
    this.syncUI();
  }
  loadPark(data: ParkData, recordUndo = true, toastMsg: string | null = 'Park loaded!') {
    const before = this.serializePark();
    if (recordUndo) {
      this.commit({
        do: () => {
          this.applyParkSnapshot(data);
          saveParkToStorage(data);
        },
        undo: () => {
          this.applyParkSnapshot(before);
          saveParkToStorage(before);
        },
      });
    } else {
      this.applyParkSnapshot(data);
    }
    Sfx.pop();
    if (toastMsg) this.showToast(toastMsg);
  }
  resetPark() {
    this.loadPark({ version: 1, props: DEFAULT_PARK_PROPS }, true, 'Default park restored');
    clearParkStorage();
    if (typeof window !== 'undefined' && location.search.includes('park=')) {
      const u = new URL(location.href);
      u.searchParams.delete('park');
      history.replaceState(null, '', u.toString());
    }
  }
  exportPark() {
    const data = this.serializePark();
    saveParkToStorage(data);
    downloadParkJson(data);
    Sfx.pop();
    this.showToast('Saved park JSON');
  }
  async importPark(file: File) {
    try {
      const data = await readParkJsonFile(file);
      this.loadPark(data, true, 'Park loaded!');
    } catch {
      this.showToast('Invalid park file');
    }
  }
  async shareParkLink() {
    const data = this.serializePark();
    saveParkToStorage(data);
    const url = buildShareUrl(data);
    try {
      history.replaceState(null, '', url);
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        this.showToast('Share link copied!');
      } else {
        this.showToast('Share link added to URL bar');
      }
      Sfx.ding();
    } catch {
      this.showToast('Share link added to URL bar');
    }
  }
  spawn() {
    const p = this.randomSpot(true, new THREE.Vector3());
    const s = new Sheep({ x: p.x, z: p.z, heading: rand(0, 6.28), state: 'idle' });
    this.commit({ do: () => this.addSheep(s, true), undo: () => this.removeSheep(s) });
  }
  sendTo(x: number, z: number) {
    const s = this.selected; if (!s) return;
    if (s.state === 'grind') s.exitGrind();
    s.after = s.state === 'cruise' || s.state === 'idle' ? s.state : s.state === 'goto' ? s.after : 'idle';
    s.state = 'goto'; s.target.set(x, 0, z); s.hasTarget = true;
    const m = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.27, 40), new THREE.MeshBasicMaterial({ color: '#3b82f6', transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, PLAZA_TOP + 0.02, z); this.group.add(m); this.markers.push({ m, t: 0 });
    Sfx.tick(); this.syncUI();
  }
  startRiding() {
    const s = this.selected; if (!s || s.state === 'ride' || s.onRail) return;
    if (s.state === 'grind') s.exitGrind();
    s.state = 'ride'; s.hasTarget = false; this.syncUI();
  }
  setHovered(s: Sheep | null) { if (s !== this.hovered) { this.hovered = s; if (s && s !== this.selected) s.sqV += 3.5; } }
  setHoveredProp(p: ParkProp | null) { if (p !== this.hoveredProp) { this.hoveredProp = p; if (p && p !== this.selectedProp) p.sqV += 3.5; } }

  /* ---------------- frame ---------------- */
  update(dt: number, t: number) {
    stepEnvironment(dt);
    updateSeasonalProps();
    updateWoolFrost();
    for (const s of this.flock) s.update(dt, t, this);
    for (let i = this.dying.length - 1; i >= 0; i--) {
      const s = this.dying[i]!; s.update(dt, t, this);
      if (s.gone) { this.group.remove(s.root); this.dying.splice(i, 1); }
    }
    // soft separation between grounded sheep
    const f = this.flock;
    for (let i = 0; i < f.length; i++) for (let j = i + 1; j < f.length; j++) {
      const a = f[i]!, b = f[j]!; if (a.onRail || b.onRail || a.inAir || b.inAir) continue;
      const dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z, d = Math.hypot(dx, dz);
      if (d < 0.85 && d > 1e-4) { const k = (0.85 - d) / 2 / d; a.pos.x -= dx * k; a.pos.z -= dz * k; b.pos.x += dx * k; b.pos.z += dz * k; }
    }
    for (const p of this.props) p.update(dt, t);
    for (let i = this.dyingProps.length - 1; i >= 0; i--) {
      const p = this.dyingProps[i]!; p.update(dt, t);
      if (p.gone) { this.group.remove(p.root); this.dyingProps.splice(i, 1); }
    }
    const puffDrag = Math.exp(-3.2 * dt);
    for (const q of this.puffs) if (q.m.visible) {
      q.life += dt; const k = q.life / q.max; if (k >= 1) { q.m.visible = false; continue; }
      q.v.x *= puffDrag; q.v.z *= puffDrag;
      q.v.y = q.v.y * puffDrag + 0.35 * dt;
      q.m.position.addScaledVector(q.v, dt);
      q.m.rotation.y += q.rotV * dt;
      q.m.rotation.x += q.rotV * 0.5 * dt;
      const easeOut = 1 - (1 - k) * (1 - k);
      q.m.scale.setScalar(q.size * (0.55 + easeOut * 1.9));
      q.m.material.opacity = 0.88 * (1 - k) ** 1.6;
    }
    for (const s of this.sparks) if (s.m.visible) {
      s.life += dt; const k = s.life / s.max; if (k >= 1) { s.m.visible = false; continue; }
      s.v.y -= 12 * dt; s.m.position.addScaledVector(s.v, dt);
      _a.copy(s.m.position).add(s.v); s.m.lookAt(_a);
      const sp = Math.min(2.2, s.v.length() * 0.45);
      s.m.scale.set(1 - k, 1 - k, (1 - k) * Math.max(0.5, sp));
    }
    for (const l of this.speedLines) if (l.m.visible) {
      l.life += dt; const k = l.life / l.max; if (k >= 1) { l.m.visible = false; continue; }
      l.m.position.addScaledVector(l.v, dt);
      const fade = Math.sin(k * Math.PI);
      l.m.scale.set(1, 1, l.len * (0.65 + 0.55 * fade));
      l.m.material.opacity = fade * 0.52;
    }
    const confDrag = Math.exp(-2.2 * dt);
    for (const c of this.confettis) if (c.m.visible) {
      c.life += dt; const k = c.life / c.max; if (k >= 1) { c.m.visible = false; continue; }
      c.v.x *= confDrag; c.v.z *= confDrag;
      c.v.y = c.v.y * confDrag - 5.5 * dt;
      c.m.position.x += c.v.x * dt + Math.sin(c.phase + c.life * 8) * 0.9 * dt;
      c.m.position.y += c.v.y * dt;
      c.m.position.z += c.v.z * dt + Math.cos(c.phase + c.life * 7) * 0.5 * dt;
      c.m.rotation.x += c.rx * dt; c.m.rotation.y += c.ry * dt; c.m.rotation.z += c.rz * dt;
      const sc = k > 0.75 ? Math.max(0.001, (1 - k) / 0.25) : 1;
      c.m.scale.setScalar(sc);
      if (c.m.position.y < PLAZA_TOP) { c.m.position.y = PLAZA_TOP; c.v.y = 0; c.v.x *= 0.7; c.v.z *= 0.7; }
    }
    this.comboT -= dt;
    if (this.combo > 1 && overlay.comboFill) {
      const ratio = clamp(this.comboT / 2.4, 0, 1);
      overlay.comboFill.style.transform = `scaleX(${ratio.toFixed(3)})`;
    }
    if (this.comboT <= 0 && this.combo > 1) {
      this.combo = 1;
      if (overlay.comboFill) overlay.comboFill.style.transform = 'scaleX(0)';
      useUI.setState({ combo: 1 });
    }

    if (this.shakeAmp > 0.001) {
      this.shakeT += dt * 44;
      this.shakeAmp *= Math.exp(-15 * dt);
      this.shakeOffset.set(
        Math.sin(this.shakeT * 1.13) * this.shakeAmp,
        Math.cos(this.shakeT * 1.71) * this.shakeAmp * 0.75,
        Math.sin(this.shakeT * 0.89) * this.shakeAmp * 0.5,
      );
    } else {
      this.shakeAmp = 0;
      this.shakeOffset.set(0, 0, 0);
    }

    const icy = envState.ice > 0.35;
    const wet = envState.wetness > 0.35;
    if (this.livePlay) {
      Sfx.setAmbience(envState.rain, Math.max(envState.snow * 0.85, envState.fog * 0.55));
    } else {
      Sfx.setAmbience(0, 0);
    }
    const h = this.hovered, sel = this.selected, hp = this.hoveredProp, selP = this.selectedProp;
    if (!this.livePlay) {
      Sfx.setRoll(0, true, false, icy, wet);
    } else if (sel && !sel.dying) {
      const grounded = !sel.inAir && !sel.onRail;
      Sfx.setRoll(Math.abs(sel.speed), isOnPlaza(sel.pos.x, sel.pos.z), grounded, icy, wet);
    } else {
      let fastest: Sheep | null = null;
      let bestSp = 0;
      for (const s of this.flock) {
        if (s.dying || s.inAir || s.onRail) continue;
        const sp = Math.abs(s.speed);
        if (sp > bestSp) { bestSp = sp; fastest = s; }
      }
      if (fastest && bestSp > 0.15) {
        Sfx.setRoll(bestSp * 0.55, isOnPlaza(fastest.pos.x, fastest.pos.z), true, icy, wet);
      } else {
        Sfx.setRoll(0, true, false, icy, wet);
      }
    }
    if (h && h !== sel && !h.dying) {
      h.hoverK = damp(h.hoverK, 1, 14, dt);
      this.hoverRing.position.set(h.pos.x, PLAZA_TOP + 0.01, h.pos.z); this.hoverRing.material.opacity = 0.85 * h.hoverK; this.hoverRing.scale.setScalar(0.95 + Math.sin(t * 6) * 0.04);
    } else if (hp && hp !== selP && !hp.dying) {
      hp.hoverK = damp(hp.hoverK, 1, 14, dt);
      this.hoverRing.position.set(hp.x, PLAZA_TOP + 0.01, hp.z); this.hoverRing.material.opacity = 0.85 * hp.hoverK; this.hoverRing.scale.setScalar(hp.ringRadius * (0.95 + Math.sin(t * 6) * 0.04));
    } else this.hoverRing.material.opacity = damp(this.hoverRing.material.opacity, 0, 14, dt);

    const syncReticle = (x: number, z: number, rotY: number, radius: number, valid: boolean) => {
      this.ghostReticle.visible = true;
      this.ghostReticle.position.set(x, PLAZA_TOP + 0.014, z);
      this.ghostReticle.rotation.y = rotY;
      this.ghostReticle.scale.setScalar(radius * (1 + Math.sin(t * 6) * 0.03));
      const ringHex = valid ? 0x38bdf8 : 0xf43f5e;
      const discHex = valid ? 0x5eead4 : 0xfb7185;
      this.ghostRing.material.color.setHex(ringHex);
      this.ghostChevron.material.color.setHex(ringHex);
      this.ghostDisc.material.color.setHex(discHex);
    };

    if (this.previewProp && this.previewProp.root.visible) {
      this.ghostX = damp(this.ghostX, this.ghostTargetX, 24, dt);
      this.ghostZ = damp(this.ghostZ, this.ghostTargetZ, 24, dt);
      const curRot = dampA(this.previewProp.rotY, this.placingRotY, 22, dt);
      const lift = 0.06 + Math.sin(t * 5) * 0.012;
      this.previewProp.setTransform(this.ghostX, this.ghostZ, curRot, lift);
      this.previewProp.update(dt, t);
      syncReticle(this.ghostX, this.ghostZ, curRot, this.previewProp.ringRadius, this.placingValid);
      this.selRing.material.opacity = damp(this.selRing.material.opacity, 0, 14, dt);
    } else if (selP && this.moveMode) {
      this.ghostX = damp(this.ghostX, this.ghostTargetX, 24, dt);
      this.ghostZ = damp(this.ghostZ, this.ghostTargetZ, 24, dt);
      const lift = 0.06 + Math.sin(t * 5) * 0.012;
      selP.setTransform(this.ghostX, this.ghostZ, selP.rotY, lift);
      selP.setGhostLook(this.placingValid ? 'off' : 'invalid');
      syncReticle(this.ghostX, this.ghostZ, selP.rotY, selP.ringRadius, this.placingValid);
      this.selRing.material.opacity = damp(this.selRing.material.opacity, 0, 14, dt);
    } else {
      this.ghostReticle.visible = false;
      if (sel) {
        this.selRing.position.set(sel.pos.x, PLAZA_TOP + 0.011, sel.pos.z); this.selRing.material.opacity = damp(this.selRing.material.opacity, 0.9, 10, dt); this.selRing.scale.setScalar(1 + Math.sin(t * 4) * 0.04);
      } else if (selP) {
        this.selRing.position.set(selP.x, PLAZA_TOP + 0.011, selP.z); this.selRing.material.opacity = damp(this.selRing.material.opacity, 0.9, 10, dt); this.selRing.scale.setScalar(selP.ringRadius * (1 + Math.sin(t * 4) * 0.04));
      } else this.selRing.material.opacity = damp(this.selRing.material.opacity, 0, 10, dt);
    }
    for (let i = this.markers.length - 1; i >= 0; i--) {
      const mk = this.markers[i]!; mk.t += dt; const k = mk.t / 0.8;
      mk.m.scale.setScalar(1 + k * 2.2); mk.m.material.opacity = (1 - k) * 0.9;
      if (k >= 1) { this.group.remove(mk.m); mk.m.geometry.dispose(); mk.m.material.dispose(); this.markers.splice(i, 1); }
    }

    this.updateOverlay(dt);
    for (const b of this.bubbles) this.placeBubble(b);
  }

  /** Project the selected entity's bounding box to screen space and drive the DOM frame/label/toolbar. */
  private updateOverlay(dt: number) {
    const s = this.selected, p = this.selectedProp, { sel, tag, bar } = overlay;
    if ((!s && !p) || !sel || !tag || !bar || !this.camera) return;
    const corners = s ? BOX_CORNERS : p!.boxCorners;
    const targetObj = s ? s.air : p!.root;
    (s ? s.root : p!.root).updateMatrixWorld();
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const c of corners) {
      _a.copy(c).applyMatrix4(targetObj.matrixWorld).project(this.camera);
      const x = (_a.x + 1) / 2 * innerWidth, y = (1 - _a.y) / 2 * innerHeight;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
    sel.style.transform = `translate(${x0}px, ${y0}px)`; sel.style.width = `${x1 - x0}px`; sel.style.height = `${y1 - y0}px`;
    const dist = this.camera.position.distanceTo(s ? s.pos : p!.root.position);
    const label = s
      ? `${s.name} · ${BOARD_SPECS[s.boardStyle].label} · ${BOARD_ART_SPECS[s.boardArt].label} · ${dist.toFixed(0)} m away`
      : `${p!.label} · ${p!.dimsLabel} · ${dist.toFixed(0)} m away`;
    if (tag.textContent !== label) tag.textContent = label;
    const tw = tag.offsetWidth;
    tag.style.transform = `translate(${clamp((x0 + x1) / 2 - tw / 2, 8, innerWidth - tw - 8)}px, ${y1 + 8}px)`;
    const bw = bar.offsetWidth, bh = bar.offsetHeight;
    const tx = clamp((x0 + x1) / 2 - bw / 2, 8, innerWidth - bw - 8);
    const bottomReserve = useUI.getState().buildMode ? 176 : 70;
    let ty = y1 + 36; if (ty + bh > innerHeight - bottomReserve) ty = y0 - bh - 14;
    if (this.barFresh) { this.barX = tx; this.barY = ty; this.barFresh = false; }
    else if (!overlay.barHover) { this.barX = damp(this.barX, tx, 9, dt); this.barY = damp(this.barY, ty, 9, dt); }
    bar.style.left = `${this.barX}px`; bar.style.top = `${this.barY}px`;
  }
}

export const world = new World();

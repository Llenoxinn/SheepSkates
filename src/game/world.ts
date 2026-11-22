import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { CONES, OBSTACLES, PLAZA_TOP } from './config';
import { clamp, damp, pick, rand } from './math';
import { Sfx } from './sfx';
import { Sheep, type SheepWorld } from './sheep';
import { useUI, type SheepState, type TrickType } from './store';

/* ------------------------------------------------------------------ */
/* DOM overlay handles (registered by the React HUD)                    */
/* ------------------------------------------------------------------ */
export const overlay: { sel: HTMLElement | null; tag: HTMLElement | null; bar: HTMLElement | null; layer: HTMLElement | null; barHover: boolean } = {
  sel: null, tag: null, bar: null, layer: null, barHover: false,
};

type Cmd = { do: () => void; undo: () => void };
type Cone = { pivot: THREE.Group; x: number; z: number; tilt: number; tv: number; axis: THREE.Vector3; cd: number };
type Puff = { m: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>; v: THREE.Vector3; life: number; max: number; size: number };
type Spark = { m: THREE.Mesh; v: THREE.Vector3; life: number; max: number };
type Bubble = { el: HTMLElement; s: Sheep };

// scratch
const _a = new THREE.Vector3(), _b = new THREE.Vector3();
const BOX_CORNERS = [-0.36, 0.36].flatMap(x => [0, 1.02].flatMap(y => [-0.6, 0.62].map(z => new THREE.Vector3(x, y, z))));

class World implements SheepWorld {
  readonly group = new THREE.Group();
  flock: Sheep[] = [];
  private dying: Sheep[] = [];
  readonly hitTargets: THREE.Object3D[] = [];
  keys: Record<string, boolean> = {};
  camera: THREE.Camera | null = null;
  selected: Sheep | null = null;
  hovered: Sheep | null = null;

  private cones: Cone[] = [];
  private puffs: Puff[] = []; private puffI = 0;
  private sparks: Spark[] = []; private sparkI = 0;
  private hoverRing: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  private selRing: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  private markers: { m: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>; t: number }[] = [];
  private bubbles: Bubble[] = [];
  private history: Cmd[] = []; private future: Cmd[] = [];
  private combo = 1; private comboT = 0; private score = 0;
  private barX = 0; private barY = 0; private barFresh = true;

  constructor() {
    const ring = (inner: number, outer: number, color: string) => {
      const m = new THREE.Mesh(new THREE.RingGeometry(inner, outer, 64), new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false, opacity: 0 }));
      m.rotation.x = -Math.PI / 2; this.group.add(m); return m;
    };
    this.hoverRing = ring(0.62, 0.7, '#ffffff');
    this.selRing = ring(0.64, 0.72, '#3b82f6');
    this.buildCones();
    this.buildParticles();
    this.seedFlock();
  }

  /* ---------------- construction ---------------- */
  private buildCones() {
    const mat = new THREE.MeshStandardMaterial({ color: '#ff9a4d', roughness: 0.55 });
    const white = new THREE.MeshStandardMaterial({ color: '#fff7ea', roughness: 0.55 });
    const base = new RoundedBoxGeometry(0.34, 0.04, 0.34, 2, 0.015), body = new THREE.ConeGeometry(0.14, 0.42, 24), band = new THREE.CylinderGeometry(0.087, 0.1, 0.07, 24);
    for (const [x, z] of CONES) {
      const g = new THREE.Group(); g.position.set(x, PLAZA_TOP, z);
      const pivot = new THREE.Group(); g.add(pivot);
      const b = new THREE.Mesh(base, mat); b.position.y = 0.02; pivot.add(b);
      const c = new THREE.Mesh(body, mat); c.position.y = 0.25; pivot.add(c);
      const w = new THREE.Mesh(band, white); w.position.y = 0.25; pivot.add(w);
      g.traverse(n => { if ((n as THREE.Mesh).isMesh) { n.castShadow = true; n.receiveShadow = true; } });
      this.group.add(g);
      this.cones.push({ pivot, x, z, tilt: 0, tv: 0, axis: new THREE.Vector3(1, 0, 0), cd: 0 });
    }
  }
  private buildParticles() {
    const pg = new THREE.IcosahedronGeometry(0.1, 2);
    for (let i = 0; i < 80; i++) {
      const m = new THREE.Mesh(pg, new THREE.MeshStandardMaterial({ color: '#fffaf0', roughness: 1, transparent: true, depthWrite: false }));
      m.visible = false; this.group.add(m); this.puffs.push({ m, v: new THREE.Vector3(), life: 1, max: 1, size: 1 });
    }
    const sg = new THREE.SphereGeometry(0.025, 6, 4);
    for (let i = 0; i < 100; i++) {
      const m = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ color: pick(['#ffd36b', '#ffb347', '#fff1b8']), toneMapped: false }));
      m.visible = false; this.group.add(m); this.sparks.push({ m, v: new THREE.Vector3(), life: 1, max: 0.4 });
    }
  }
  private seedFlock() {
    const seeds: ConstructorParameters<typeof Sheep>[0][] = [
      { x: 0, z: 1.5, state: 'cruise', color: 0 }, { x: 4, z: -1, state: 'cruise', color: 1 }, { x: 5, z: 3, state: 'cruise', color: 2 },
      { x: -1.5, z: -3.6, state: 'grind', color: 3 }, { x: 2, z: -0.5, state: 'cruise', color: 4 },
      { x: -8, z: -2.4, heading: 1.2, state: 'idle', color: 5 }, { x: -6.6, z: 5.6, heading: -2.4, state: 'idle', color: 6 },
      { x: 9.6, z: 5.0, heading: 3.6, state: 'idle', color: 2 }, { x: 10, z: -3, heading: -0.8, state: 'idle', color: 0 },
    ];
    for (const o of seeds) { const s = new Sheep({ ...o, state: 'idle' }); this.attach(s); s.setState(o!.state ?? 'idle'); }
  }

  /* ---------------- SheepWorld services ---------------- */
  cameraForward(out: THREE.Vector3) {
    if (!this.camera) return out.set(0, 0, -1);
    this.camera.getWorldDirection(out); out.y = 0; return out.normalize();
  }
  randomSpot(wide: boolean, out: THREE.Vector3) {
    for (let i = 0; i < 40; i++) {
      const x = wide ? rand(-11, 11) : rand(-2.2, 6.2), z = wide ? rand(-7.4, 7.4) : rand(-3.7, 4.3);
      let free = true;
      for (const o of OBSTACLES) if (Math.hypot(x - o.x, z - o.z) <= o.r + 0.9) { free = false; break; }
      if (free) return out.set(x, 0, z);
    }
    return out.set(2, 0, 0.5);
  }
  puff(p: THREE.Vector3, n: number, spread = 1.6, size = 1) {
    for (let i = 0; i < n; i++) {
      const q = this.puffs[this.puffI++ % this.puffs.length]!, a = rand(0, 6.28);
      q.m.position.set(p.x + Math.cos(a) * 0.2, p.y + 0.06, p.z + Math.sin(a) * 0.2);
      q.v.set(Math.cos(a) * spread * rand(0.5, 1), rand(0.3, 0.9), Math.sin(a) * spread * rand(0.5, 1));
      q.life = 0; q.max = rand(0.45, 0.75); q.size = size * rand(0.7, 1.3); q.m.visible = true;
    }
  }
  spark(x: number, y: number, z: number, dx: number, dz: number) {
    const s = this.sparks[this.sparkI++ % this.sparks.length]!;
    s.m.position.set(x, y, z); s.v.set(-dx * rand(0.5, 2) + rand(-1, 1), rand(1, 2.6), -dz * rand(0.5, 2) + rand(-1, 1));
    s.life = 0; s.max = rand(0.2, 0.4); s.m.visible = true;
  }
  bumpCones(s: Sheep) {
    const p = s.pos;
    for (const c of this.cones) {
      const dx = c.x - p.x, dz = c.z - p.z, d = Math.hypot(dx, dz);
      if (d < 0.5 && Math.abs(s.speed) > 0.7 && c.cd <= 0) {
        c.axis.set(dz / d, 0, -dx / d); c.tv += 7 + Math.abs(s.speed) * 2; c.cd = 0.8;
        Sfx.bonk(); s.sqV += 2;
        if (s.state === 'ride') this.award('Bonk', 10, c.x, 0.9, c.z, false, 'small');
        else this.popText(c.x, 0.9, c.z, 'bonk', 'small');
      }
    }
  }
  onStateChanged(s: Sheep) { if (s === this.selected) this.syncUI(); }

  /* ---------------- score + floating text ---------------- */
  private toScreen(x: number, y: number, z: number): [number, number, boolean] {
    if (!this.camera) return [0, 0, false];
    _a.set(x, y, z).project(this.camera);
    return [(_a.x + 1) / 2 * innerWidth, (1 - _a.y) / 2 * innerHeight, _a.z < 1];
  }
  popText(x: number, y: number, z: number, text: string, cls = '') {
    const [sx, sy, ok] = this.toScreen(x, y, z);
    if (!ok || !overlay.layer) return;
    const el = document.createElement('div'); el.className = `pop ${cls}`; el.textContent = text;
    el.style.left = `${sx}px`; el.style.top = `${sy}px`;
    overlay.layer.appendChild(el); el.addEventListener('animationend', () => el.remove());
  }
  award(name: string, pts: number, x: number, y: number, z: number, big = false, cls = '') {
    this.combo = this.comboT > 0 ? Math.min(this.combo + 1, 5) : 1; this.comboT = 2.4;
    const total = pts * this.combo; this.score += total;
    useUI.setState({ score: this.score, combo: this.combo });
    this.popText(x, y, z, `${name}! +${total}${this.combo > 1 ? `  ×${this.combo}` : ''}`, cls || (big || this.combo > 2 ? 'big' : ''));
    if (this.combo > 2 || big) Sfx.ding();
  }
  say(s: Sheep, text: string) {
    if (!overlay.layer) return;
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
  select(s: Sheep) {
    if (this.selected === s) { s.sqV += 6; Sfx.baa(1 + Math.random() * 0.2); this.say(s, pick(['baa!', 'baaa~', 'meh', 'rad!', 'hi :)', 'wheee'])); return; }
    this.selected = s; this.barFresh = true;
    s.sqV += 7; Sfx.pop(); Sfx.baa(); this.say(s, pick(['baa!', 'baaa?', 'ready!', 'yo!']));
    overlay.sel?.classList.remove('on'); void overlay.sel?.offsetWidth; overlay.sel?.classList.add('on');
    this.syncUI();
  }
  deselect() { this.selected = null; overlay.sel?.classList.remove('on'); this.syncUI(); }
  syncUI() {
    const s = this.selected;
    useUI.setState({
      selected: s ? { id: s.id, name: s.name, state: s.state === 'goto' ? s.after : s.state } : null,
      canUndo: this.history.length > 0, canRedo: this.future.length > 0,
    });
  }
  private commit(c: Cmd) { c.do(); this.history.push(c); this.future.length = 0; this.syncUI(); }
  undo() { const c = this.history.pop(); if (!c) return; c.undo(); this.future.push(c); Sfx.tick(); this.syncUI(); }
  redo() { const c = this.future.pop(); if (!c) return; c.do(); this.history.push(c); Sfx.tick(); this.syncUI(); }

  setState(st: SheepState) {
    const s = this.selected; if (!s || s.state === st) return;
    const prev: SheepState = s.state === 'goto' ? s.after : s.state === 'grind' ? 'cruise' : s.state;
    Sfx.tick();
    this.commit({ do: () => { s.setState(st); this.onStateChanged(s); }, undo: () => { s.setState(prev); this.onStateChanged(s); } });
    if (st === 'grind') this.say(s, 'to the rail!');
  }
  trick(type: TrickType) {
    const s = this.selected; if (!s) return;
    if (s.doTrick(type)) useUI.setState(u => ({ firedTrick: { type, n: (u.firedTrick?.n ?? 0) + 1 } }));
  }
  duplicate() {
    const o = this.selected; if (!o) return;
    const a = o.heading + Math.PI / 2;
    const x = clamp(o.pos.x + Math.sin(a) * 1.3, -11.5, 11.5), z = clamp(o.pos.z + Math.cos(a) * 1.3, -7.6, 7.6);
    const st: SheepState = o.state === 'grind' ? 'cruise' : o.state === 'ride' || o.state === 'goto' ? 'idle' : o.state;
    const c = new Sheep({ x, z, heading: o.heading, state: st, color: o.color, hat: o.hat });
    c.spawnPop();
    this.commit({ do: () => { this.addSheep(c); Sfx.pop(); this.puff(c.pos, 6, 1.2, 1); this.select(c); }, undo: () => this.removeSheep(c) });
  }
  remove() { const s = this.selected; if (!s) return; this.commit({ do: () => this.removeSheep(s), undo: () => { this.addSheep(s); Sfx.pop(); } }); }
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

  /* ---------------- frame ---------------- */
  update(dt: number, t: number) {
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
    for (const c of this.cones) {
      c.cd -= dt; c.tv += (-c.tilt * 55 - c.tv * 4.5) * dt; c.tilt = clamp(c.tilt + c.tv * dt, -0.5, 1.35);
      c.pivot.quaternion.setFromAxisAngle(c.axis, c.tilt);
    }
    for (const q of this.puffs) if (q.m.visible) {
      q.life += dt; const k = q.life / q.max; if (k >= 1) { q.m.visible = false; continue; }
      q.v.multiplyScalar(Math.exp(-3.5 * dt)); q.m.position.addScaledVector(q.v, dt);
      q.m.scale.setScalar(q.size * (0.7 + k * 2)); q.m.material.opacity = 0.9 * (1 - k) ** 1.6;
    }
    for (const s of this.sparks) if (s.m.visible) {
      s.life += dt; const k = s.life / s.max; if (k >= 1) { s.m.visible = false; continue; }
      s.v.y -= 12 * dt; s.m.position.addScaledVector(s.v, dt); s.m.scale.setScalar(1 - k);
    }
    this.comboT -= dt;
    if (this.comboT <= 0 && this.combo > 1) { this.combo = 1; useUI.setState({ combo: 1 }); }

    const h = this.hovered, sel = this.selected;
    if (h && h !== sel && !h.dying) {
      h.hoverK = damp(h.hoverK, 1, 14, dt);
      this.hoverRing.position.set(h.pos.x, PLAZA_TOP + 0.01, h.pos.z); this.hoverRing.material.opacity = 0.85 * h.hoverK; this.hoverRing.scale.setScalar(0.95 + Math.sin(t * 6) * 0.04);
    } else this.hoverRing.material.opacity = damp(this.hoverRing.material.opacity, 0, 14, dt);
    if (sel) {
      this.selRing.position.set(sel.pos.x, PLAZA_TOP + 0.011, sel.pos.z); this.selRing.material.opacity = damp(this.selRing.material.opacity, 0.9, 10, dt); this.selRing.scale.setScalar(1 + Math.sin(t * 4) * 0.04);
    } else this.selRing.material.opacity = damp(this.selRing.material.opacity, 0, 10, dt);
    for (let i = this.markers.length - 1; i >= 0; i--) {
      const mk = this.markers[i]!; mk.t += dt; const k = mk.t / 0.8;
      mk.m.scale.setScalar(1 + k * 2.2); mk.m.material.opacity = (1 - k) * 0.9;
      if (k >= 1) { this.group.remove(mk.m); mk.m.geometry.dispose(); mk.m.material.dispose(); this.markers.splice(i, 1); }
    }

    this.updateOverlay(dt);
    for (const b of this.bubbles) this.placeBubble(b);
  }

  /** Project the selected sheep's box to screen space and drive the DOM frame/label/toolbar. */
  private updateOverlay(dt: number) {
    const s = this.selected, { sel, tag, bar } = overlay;
    if (!s || !sel || !tag || !bar || !this.camera) return;
    s.root.updateMatrixWorld();
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const c of BOX_CORNERS) {
      _a.copy(c).applyMatrix4(s.air.matrixWorld).project(this.camera);
      const x = (_a.x + 1) / 2 * innerWidth, y = (1 - _a.y) / 2 * innerHeight;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
    sel.style.transform = `translate(${x0}px, ${y0}px)`; sel.style.width = `${x1 - x0}px`; sel.style.height = `${y1 - y0}px`;
    const dist = this.camera.position.distanceTo(s.pos);
    const label = `${s.name} · 0.72 × 1.02 m · ${dist.toFixed(0)} m away`;
    if (tag.textContent !== label) tag.textContent = label;
    const tw = tag.offsetWidth;
    tag.style.transform = `translate(${clamp((x0 + x1) / 2 - tw / 2, 8, innerWidth - tw - 8)}px, ${y1 + 8}px)`;
    const bw = bar.offsetWidth, bh = bar.offsetHeight;
    const tx = clamp((x0 + x1) / 2 - bw / 2, 8, innerWidth - bw - 8);
    let ty = y1 + 36; if (ty + bh > innerHeight - 70) ty = y0 - bh - 14;
    if (this.barFresh) { this.barX = tx; this.barY = ty; this.barFresh = false; }
    else if (!overlay.barHover) { this.barX = damp(this.barX, tx, 9, dt); this.barY = damp(this.barY, ty, 9, dt); }
    bar.style.left = `${this.barX}px`; bar.style.top = `${this.barY}px`;
  }
}

export const world = new World();

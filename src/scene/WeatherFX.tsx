import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { isOnPlaza, PLAZA_TOP, TREES } from '../game/config';
import { clamp, rand } from '../game/math';
import { radialTex } from '../game/textures';
import { envState } from '../game/weather';

const BLOSSOM_N = 140;
const LEAF_N = 150;
const SNOW_N = 340;
const RAIN_N = 340;
const SPLASH_N = 90;
const MIST_N = 18;

const BLOSSOM_COLORS = ['#ffb5d1', '#ffd3e4', '#fff0f6', '#f69ac0'];
const LEAF_COLORS = ['#ea6f2b', '#f29b38', '#e6b83a', '#cf4e35', '#db7f2d'];
const SNOW_COLORS = ['#eef5fc', '#e2eef9', '#f4f8fd'];
const _obj = new THREE.Object3D();

type FallItem = { x: number; y: number; z: number; vx: number; vy: number; vz: number; rx: number; ry: number; rz: number; ph: number; sc: number; rest: number };
type SnowItem = { x: number; y: number; z: number; vy: number; ph: number; sc: number };
type RainItem = { x: number; y: number; z: number; vy: number; len: number };
type SplashItem = { x: number; y: number; z: number; t: number; max: number; active: boolean };
type MistItem = { x: number; y: number; z: number; sp: number; w: number; h: number; ph: number };

function buildPetalGeo(): THREE.BufferGeometry {
  const s = new THREE.Shape();
  s.moveTo(0, -0.065);
  s.quadraticCurveTo(0.055, -0.02, 0.038, 0.048);
  s.quadraticCurveTo(0, 0.072, -0.038, 0.048);
  s.quadraticCurveTo(-0.055, -0.02, 0, -0.065);
  return new THREE.ShapeGeometry(s, 3);
}

function buildLeafGeo(): THREE.BufferGeometry {
  const s = new THREE.Shape();
  s.moveTo(0, -0.09); s.lineTo(0.06, -0.02); s.lineTo(0.08, 0.03);
  s.lineTo(0.025, 0.045); s.lineTo(0, 0.1); s.lineTo(-0.025, 0.045);
  s.lineTo(-0.08, 0.03); s.lineTo(-0.06, -0.02); s.closePath();
  return new THREE.ShapeGeometry(s, 1);
}

function spawnCanopyDrop(it: FallItem, randomHeight: boolean): void {
  if (Math.random() < 0.72) {
    const tr = TREES[(Math.random() * TREES.length) | 0]!;
    it.x = tr.x + rand(-1.3, 1.3) * tr.s;
    it.z = tr.z + rand(-1.3, 1.3) * tr.s;
    it.y = randomHeight ? rand(0.25, 3.6) : rand(1.6, 3.2) * tr.s;
  } else {
    it.x = rand(-12.5, 12.5); it.z = rand(-8.5, 8.5);
    it.y = randomHeight ? rand(0.3, 6.2) : rand(4.5, 6.8);
  }
  it.vx = rand(0.25, 0.85); it.vy = -rand(0.55, 1.05); it.vz = rand(-0.25, 0.35);
  it.rx = rand(0, 6.28); it.ry = rand(0, 6.28); it.rz = rand(0, 6.28);
  it.ph = rand(0, 6.28); it.sc = rand(0.75, 1.3); it.rest = 0;
}

function stepCanopyDrops(
  mesh: THREE.InstancedMesh | null,
  mat: THREE.MeshBasicMaterial,
  items: FallItem[],
  maxCount: number,
  weight: number,
  dt: number,
  t: number,
  wind: number,
  sway: number,
  fallMul: number,
  restDur: number,
): void {
  if (!mesh) return;
  const n = weight > 0.03 ? Math.round(maxCount * clamp(weight * 1.15, 0, 1)) : 0;
  mesh.count = n;
  mat.opacity = clamp(weight * 1.1, 0, 0.94);
  for (let i = 0; i < n; i++) {
    const it = items[i]!;
    if (it.rest > 0) {
      it.rest -= dt;
      if (it.rest <= 0) spawnCanopyDrop(it, false);
    } else {
      it.x += (it.vx + wind * sway + Math.sin(t * (1.9 + sway * 0.5) + it.ph) * 0.45 * sway) * dt;
      it.z += (it.vz + Math.cos(t * 1.6 + it.ph) * 0.35 * sway) * dt;
      it.y += it.vy * fallMul * dt;
      it.rx += 2.2 * dt; it.ry += 1.7 * dt; it.rz += 1.6 * dt;
      if (it.y <= 0.025) { it.y = 0.025; it.rest = restDur; }
      else if (it.x > 14.5 || Math.abs(it.z) > 10.5) spawnCanopyDrop(it, false);
    }
    const fade = it.rest > 0 ? clamp(it.rest / restDur, 0.001, 1) : 1;
    _obj.position.set(it.x, it.y, it.z);
    _obj.rotation.set(it.rest > 0 ? -Math.PI / 2 : it.rx, it.ry, it.rz);
    _obj.scale.setScalar(it.sc * fade);
    _obj.updateMatrix();
    mesh.setMatrixAt(i, _obj.matrix);
  }
  if (n > 0) mesh.instanceMatrix.needsUpdate = true;
}

/** Instanced spring blossoms, autumn leaves, winter snowfall, rain streaks, splashes, and fog wisps. */
export function WeatherFX() {
  const blossomRef = useRef<THREE.InstancedMesh>(null);
  const leafRef = useRef<THREE.InstancedMesh>(null);
  const snowRef = useRef<THREE.InstancedMesh>(null);
  const rainRef = useRef<THREE.InstancedMesh>(null);
  const splashRef = useRef<THREE.InstancedMesh>(null);
  const mistRef = useRef<THREE.InstancedMesh>(null);

  const assets = useMemo(() => {
    const petalGeo = buildPetalGeo();
    const leafGeo = buildLeafGeo();
    const snowGeo = new THREE.CircleGeometry(0.046, 6);
    const rainGeo = new THREE.BoxGeometry(0.018, 0.56, 0.018);
    const splashGeo = new THREE.RingGeometry(0.032, 0.056, 12);
    splashGeo.rotateX(-Math.PI / 2);
    const mistGeo = new THREE.PlaneGeometry(1, 1);

    const petalMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true, opacity: 0.92, depthWrite: false });
    const leafMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true, opacity: 0.95, depthWrite: false });
    const snowMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true, opacity: 0.88, depthWrite: false });
    const rainMat = new THREE.MeshBasicMaterial({ color: '#cbe2f6', transparent: true, opacity: 0, depthWrite: false });
    const splashMat = new THREE.MeshBasicMaterial({ color: '#dceeff', transparent: true, opacity: 0, depthWrite: false });
    const mistTex = radialTex('rgba(244,248,252,0.52)', 'rgba(244,248,252,0)', 128);
    const mistMat = new THREE.MeshBasicMaterial({ map: mistTex, transparent: true, opacity: 0, depthWrite: false });

    return { petalGeo, leafGeo, snowGeo, rainGeo, splashGeo, mistGeo, petalMat, leafMat, snowMat, rainMat, splashMat, mistMat, mistTex };
  }, []);

  const pools = useMemo(() => {
    const makeDrops = (count: number) => Array.from({ length: count }, () => {
      const it: FallItem = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, rx: 0, ry: 0, rz: 0, ph: 0, sc: 1, rest: 0 };
      spawnCanopyDrop(it, true);
      return it;
    });
    const snow: SnowItem[] = Array.from({ length: SNOW_N }, () => ({ x: rand(-15, 15), y: rand(0.1, 11), z: rand(-11, 11), vy: rand(1.45, 2.55), ph: rand(0, 6.28), sc: rand(0.65, 1.35) }));
    const rain: RainItem[] = Array.from({ length: RAIN_N }, () => ({ x: rand(-15, 15), y: rand(0.2, 12), z: rand(-11, 11), vy: rand(13.5, 18.5), len: rand(0.75, 1.3) }));
    const splashes: SplashItem[] = Array.from({ length: SPLASH_N }, () => ({ x: 0, y: PLAZA_TOP + 0.015, z: 0, t: 0, max: 0.25, active: false }));
    const mist: MistItem[] = Array.from({ length: MIST_N }, (_, i) => {
      const ring = i < 10, a = (i / 10) * Math.PI * 2;
      return {
        x: ring ? Math.cos(a) * rand(8.5, 14) : rand(-10, 10),
        y: ring ? rand(0.55, 1.9) : rand(0.4, 1.4),
        z: ring ? Math.sin(a) * rand(5.5, 10.5) : rand(-7.5, 7.5),
        sp: rand(0.35, 0.75), w: rand(5.2, 8.8), h: rand(2.6, 4.4), ph: rand(0, 6.28),
      };
    });
    return { blossoms: makeDrops(BLOSSOM_N), leaves: makeDrops(LEAF_N), snow, rain, splashes, mist, splashIdx: 0 };
  }, []);

  useEffect(() => {
    const col = new THREE.Color();
    const colorize = (mesh: THREE.InstancedMesh | null, count: number, palette: readonly string[]) => {
      if (!mesh) return;
      for (let i = 0; i < count; i++) { col.set(palette[i % palette.length]!); mesh.setColorAt(i, col); }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    };
    colorize(blossomRef.current, BLOSSOM_N, BLOSSOM_COLORS);
    colorize(leafRef.current, LEAF_N, LEAF_COLORS);
    colorize(snowRef.current, SNOW_N, SNOW_COLORS);
    return () => {
      assets.petalGeo.dispose(); assets.leafGeo.dispose(); assets.snowGeo.dispose();
      assets.rainGeo.dispose(); assets.splashGeo.dispose(); assets.mistGeo.dispose();
      assets.petalMat.dispose(); assets.leafMat.dispose(); assets.snowMat.dispose();
      assets.rainMat.dispose(); assets.splashMat.dispose(); assets.mistMat.dispose(); assets.mistTex.dispose();
    };
  }, [assets]);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = state.clock.elapsedTime;
    const wind = envState.wind;

    stepCanopyDrops(blossomRef.current, assets.petalMat, pools.blossoms, BLOSSOM_N, envState.spring, dt, t, wind, 0.9, 1.0, 0.65);
    stepCanopyDrops(leafRef.current, assets.leafMat, pools.leaves, LEAF_N, envState.autumn, dt, t, wind, 1.25, 1.15, 0.9);

    const sMesh = snowRef.current;
    if (sMesh) {
      const n = envState.snow > 0.02 ? Math.round(SNOW_N * clamp(envState.snow * 1.05, 0, 1)) : 0;
      sMesh.count = n;
      assets.snowMat.opacity = clamp(envState.snow * 0.9, 0, 0.88);
      for (let i = 0; i < n; i++) {
        const it = pools.snow[i]!;
        it.x += (wind * 1.1 + Math.sin(t * 1.3 + it.ph) * 0.48) * dt;
        it.z += Math.cos(t * 1.1 + it.ph) * 0.35 * dt;
        it.y -= it.vy * dt;
        if (it.y < 0.02 || it.x > 15.5) { it.x = rand(-15.5, 13.5); it.z = rand(-11, 11); it.y = rand(8.5, 11.5); }
        _obj.position.set(it.x, it.y, it.z);
        _obj.rotation.set(t * 1.2 + it.ph, t * 0.9, 0);
        _obj.scale.setScalar(it.sc);
        _obj.updateMatrix();
        sMesh.setMatrixAt(i, _obj.matrix);
      }
      if (n > 0) sMesh.instanceMatrix.needsUpdate = true;
    }

    const rMesh = rainRef.current, spMesh = splashRef.current, rAmt = envState.rain;
    if (rMesh) {
      const n = rAmt > 0.02 ? Math.round(RAIN_N * clamp(rAmt * 1.1, 0, 1)) : 0;
      rMesh.count = n;
      assets.rainMat.opacity = clamp(rAmt * 0.56, 0, 0.56);
      const windX = 1.4 + wind * 2.2, tilt = Math.atan2(windX, 16);
      for (let i = 0; i < n; i++) {
        const it = pools.rain[i]!;
        it.x += windX * dt; it.y -= it.vy * dt;
        if (it.y < 0.04) {
          if (Math.random() < 0.38 && Math.abs(it.x) < 12.5 && Math.abs(it.z) < 8.5) {
            const sp = pools.splashes[pools.splashIdx++ % SPLASH_N]!;
            sp.x = it.x; sp.z = it.z; sp.y = isOnPlaza(it.x, it.z) ? PLAZA_TOP + 0.016 : 0.022;
            sp.t = 0; sp.max = rand(0.18, 0.28); sp.active = true;
          }
          it.x = rand(-16, 13); it.z = rand(-11, 11); it.y = rand(9, 13);
        }
        _obj.position.set(it.x, it.y, it.z); _obj.rotation.set(0, 0, tilt); _obj.scale.set(1, it.len, 1);
        _obj.updateMatrix(); rMesh.setMatrixAt(i, _obj.matrix);
      }
      if (n > 0) rMesh.instanceMatrix.needsUpdate = true;
    }

    if (spMesh) {
      let any = false;
      assets.splashMat.opacity = clamp(rAmt * 0.65, 0, 0.65);
      for (let i = 0; i < SPLASH_N; i++) {
        const sp = pools.splashes[i]!;
        if (!sp.active || rAmt <= 0.02) { _obj.scale.setScalar(0.0001); _obj.position.set(0, -10, 0); }
        else {
          any = true; sp.t += dt; const k = sp.t / sp.max;
          if (k >= 1) { sp.active = false; _obj.scale.setScalar(0.0001); _obj.position.set(0, -10, 0); }
          else { _obj.position.set(sp.x, sp.y, sp.z); _obj.rotation.set(0, 0, 0); _obj.scale.setScalar((0.4 + k * 2.2) * (1 - k * 0.35)); }
        }
        _obj.updateMatrix(); spMesh.setMatrixAt(i, _obj.matrix);
      }
      spMesh.count = any ? SPLASH_N : 0;
      if (any) spMesh.instanceMatrix.needsUpdate = true;
    }

    const mMesh = mistRef.current;
    if (mMesh) {
      const mistAmt = clamp(envState.fog * 0.8 + envState.rain * 0.14, 0, 0.8);
      mMesh.count = mistAmt > 0.02 ? MIST_N : 0;
      assets.mistMat.opacity = mistAmt * 0.42;
      assets.mistMat.color.copy(envState.fogColor);
      if (mMesh.count > 0) {
        for (let i = 0; i < MIST_N; i++) {
          const m = pools.mist[i]!;
          m.x += m.sp * (0.7 + wind) * dt; if (m.x > 16) m.x = -16;
          _obj.position.set(m.x, m.y + Math.sin(t * 0.4 + m.ph) * 0.18, m.z);
          _obj.rotation.set(-0.62, 0, Math.sin(t * 0.25 + m.ph) * 0.08);
          _obj.scale.set(m.w, m.h, 1);
          _obj.updateMatrix(); mMesh.setMatrixAt(i, _obj.matrix);
        }
        mMesh.instanceMatrix.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      <instancedMesh ref={blossomRef} args={[assets.petalGeo, assets.petalMat, BLOSSOM_N]} frustumCulled={false} />
      <instancedMesh ref={leafRef} args={[assets.leafGeo, assets.leafMat, LEAF_N]} frustumCulled={false} />
      <instancedMesh ref={snowRef} args={[assets.snowGeo, assets.snowMat, SNOW_N]} frustumCulled={false} />
      <instancedMesh ref={rainRef} args={[assets.rainGeo, assets.rainMat, RAIN_N]} frustumCulled={false} />
      <instancedMesh ref={splashRef} args={[assets.splashGeo, assets.splashMat, SPLASH_N]} frustumCulled={false} />
      <instancedMesh ref={mistRef} args={[assets.mistGeo, assets.mistMat, MIST_N]} frustumCulled={false} renderOrder={4} />
    </group>
  );
}

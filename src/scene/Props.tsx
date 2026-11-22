import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, useTexture } from '@react-three/drei';
import { BUSHES, LEDGE, QUARTER_PIPES, RAIL, TREES, type TreeDef } from '../game/config';
import { rand, rng } from '../game/math';
import { setupPbr } from '../game/textures';
import { tex } from './Island';

const SHADOW = { castShadow: true, receiveShadow: true } as const;

function Tree({ x, z, s, color }: TreeDef) {
  const canopy = useRef<THREE.Group>(null!);
  const blobs = useMemo(() => {
    const r = rng((x * 100 + z * 7) | 0), base = new THREE.Color(color);
    return ([[0, 0.55, 0, 0.62], [0.42, 0.4, 0.15, 0.45], [-0.38, 0.42, 0.2, 0.48], [0.1, 0.45, -0.4, 0.46], [-0.15, 0.9, -0.05, 0.45], [0.25, 0.82, 0.25, 0.38], [-0.1, 0.3, 0.42, 0.4]] as const)
      .map(([bx, by, bz, br]) => ({ p: [bx * s, by * s, bz * s] as const, r: br * s, c: base.clone().offsetHSL(0, 0, (r() - 0.5) * 0.08) }));
  }, [x, z, s, color]);
  const ph = useMemo(() => Math.random() * 6, []);
  useFrame(({ clock }) => { canopy.current.rotation.z = Math.sin(clock.elapsedTime * 0.9 + ph) * 0.025; });
  return (
    <group position={[x, 0, z]}>
      <mesh position-y={0.35 * s} {...SHADOW}>
        <cylinderGeometry args={[0.1 * s, 0.15 * s, 0.7 * s, 10]} />
        <meshStandardMaterial color="#7a5636" roughness={1} />
      </mesh>
      <group ref={canopy} position-y={0.7 * s}>
        {blobs.map((b, i) => (
          <mesh key={i} position={b.p} {...SHADOW}>
            <icosahedronGeometry args={[b.r, 4]} />
            <meshStandardMaterial color={b.c} roughness={0.85} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Bush({ x, z }: { x: number; z: number }) {
  const parts = useMemo(() => Array.from({ length: 3 }, () => ({ p: [rand(-0.25, 0.25), 0.2, rand(-0.2, 0.2)] as const, r: rand(0.25, 0.36) })), []);
  return (
    <group position={[x, 0, z]}>
      {parts.map((b, i) => (
        <mesh key={i} position={b.p} {...SHADOW}>
          <icosahedronGeometry args={[b.r, 3]} />
          <meshStandardMaterial color="#4d9334" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

function QuarterPipe({ x, z, rotY, color, plywood }: { x: number; z: number; rotY: number; color: string; plywood: Record<string, THREE.Texture> }) {
  const R = 1.1, deck = 0.55, Wd = 3.3;
  const geo = useMemo(() => {
    const s = new THREE.Shape(); s.moveTo(0, 0);
    for (let i = 1; i <= 24; i++) { const t = (i / 24) * Math.PI / 2; s.lineTo(R * Math.sin(t), R * (1 - Math.cos(t))); }
    s.lineTo(R + deck, R); s.lineTo(R + deck, 0); s.lineTo(0, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: Wd, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 });
    g.translate(0, 0, -Wd / 2);
    return g;
  }, []);
  return (
    <group position={[x, 0, z]} rotation-y={rotY}>
      <mesh geometry={geo} {...SHADOW}>
        {/* pastel-painted plywood: wood grain survives through the normal map */}
        <meshStandardMaterial normalMap={plywood.normalMap} roughnessMap={plywood.roughnessMap} normalScale={[1.6, 1.6]} color={color} roughness={1} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[R, R + 0.02, 0]} {...SHADOW}>
        <cylinderGeometry args={[0.05, 0.05, Wd + 0.06, 16]} />
        <meshStandardMaterial color="#c9ced8" metalness={0.9} roughness={0.28} />
      </mesh>
    </group>
  );
}

function Rail() {
  const len = RAIL.b.x - RAIL.a.x, mid = (RAIL.a.x + RAIL.b.x) / 2;
  return (
    <group>
      <mesh rotation-z={Math.PI / 2} position={[mid, RAIL.top, RAIL.a.z]} {...SHADOW}>
        <cylinderGeometry args={[0.055, 0.055, len + 0.2, 20]} />
        <meshStandardMaterial color="#ff8c7a" roughness={0.3} metalness={0.35} />
      </mesh>
      {[RAIL.a.x + 0.15, mid, RAIL.b.x - 0.15].map(px => (
        <group key={px} position={[px, 0, RAIL.a.z]}>
          <mesh position-y={RAIL.top / 2} {...SHADOW}><cylinderGeometry args={[0.045, 0.045, RAIL.top, 12]} /><meshStandardMaterial color="#f2eee6" roughness={0.5} /></mesh>
          <mesh position-y={0.02} {...SHADOW}><cylinderGeometry args={[0.14, 0.16, 0.04, 20]} /><meshStandardMaterial color="#f2eee6" roughness={0.5} /></mesh>
        </group>
      ))}
    </group>
  );
}

function Clouds() {
  const refs = useRef<THREE.Group[]>([]);
  const defs = useMemo(() => ([[4, 5.2, -10, 1.1], [-12, 6, -8.5, 0.8], [14, 5.6, -4, 0.9]] as const).map(([x, y, z, s]) => ({ x, y, z, s, sp: rand(0.25, 0.45), bob: rand(0, 6) })), []);
  useFrame(({ clock }, dt) => {
    refs.current.forEach((g, i) => {
      const d = defs[i]!; g.position.x += d.sp * dt; if (g.position.x > 17) g.position.x = -17;
      g.position.y = d.y + Math.sin(clock.elapsedTime * 0.6 + d.bob) * 0.15;
    });
  });
  return (
    <>
      {defs.map((d, i) => (
        <group key={i} ref={el => { if (el) refs.current[i] = el; }} position={[d.x, d.y, d.z]}>
          {([[0, 0, 0, 0.8], [0.8, -0.1, 0.1, 0.6], [-0.8, -0.15, 0, 0.6], [0.3, 0.35, -0.1, 0.6], [-0.35, 0.3, 0.2, 0.55]] as const).map(([bx, by, bz, br], j) => (
            <mesh key={j} position={[bx * d.s, by * d.s, bz * d.s]} scale-y={0.8} castShadow>
              <icosahedronGeometry args={[br * d.s, 4]} />
              <meshStandardMaterial color="#ffffff" roughness={1} emissive="#fff8ee" emissiveIntensity={0.25} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}

export function Props() {
  const gl = useThree(s => s.gl);
  const plywood = setupPbr(useTexture(tex('plywood')), 0.6, Math.min(8, gl.capabilities.getMaxAnisotropy()));
  return (
    <group>
      {TREES.map((t, i) => <Tree key={i} {...t} />)}
      {BUSHES.map(([x, z], i) => <Bush key={i} x={x} z={z} />)}
      {QUARTER_PIPES.map((q, i) => <QuarterPipe key={i} {...q} plywood={plywood} />)}
      <RoundedBox args={[LEDGE.w, LEDGE.h, LEDGE.d]} radius={0.06} smoothness={3} position={[LEDGE.x, LEDGE.h / 2, LEDGE.z]} {...SHADOW}>
        <meshStandardMaterial color={LEDGE.color} roughness={0.6} />
      </RoundedBox>
      <Rail />
      <Clouds />
    </group>
  );
}

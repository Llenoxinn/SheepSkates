import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { BUSHES } from '../game/config';
import { rand } from '../game/math';
import { applyPlywoodTextures } from '../game/props';
import { setupPbr } from '../game/textures';
import { tex } from './Island';

const SHADOW = { castShadow: true, receiveShadow: true } as const;

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
  const rawPlywood = useTexture(tex('plywood'));
  useEffect(() => {
    const configured = setupPbr(rawPlywood, 0.6, Math.min(8, gl.capabilities.getMaxAnisotropy()));
    applyPlywoodTextures({ normalMap: configured.normalMap, roughnessMap: configured.roughnessMap });
  }, [gl, rawPlywood]);

  return (
    <group>
      {BUSHES.map(([x, z], i) => <Bush key={i} x={x} z={z} />)}
      <Clouds />
    </group>
  );
}

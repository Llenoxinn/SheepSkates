import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { BUSHES } from '../game/config';
import { rand } from '../game/math';
import { applyPlywoodTextures } from '../game/props';
import { setupPbr } from '../game/textures';
import { envState } from '../game/weather';
import { tex } from './Island';

const SHADOW = { castShadow: true, receiveShadow: true } as const;

const BUSH_SPRING = new THREE.Color('#6ec44d');
const BUSH_SPRING_BLOSSOM = new THREE.Color('#f4a6c4');
const BUSH_SUMMER = new THREE.Color('#4d9334');
const BUSH_AUTUMN = new THREE.Color('#b6752f');
const BUSH_WINTER_BASE = new THREE.Color('#5f857e');
const BUSH_WINTER_TOP = new THREE.Color('#e6eff8');
const _bushCol = new THREE.Color();

function Bush({ x, z, idx }: { x: number; z: number; idx: number }) {
  const parts = useMemo(() => Array.from({ length: 3 }, (_, j) => ({ p: [rand(-0.25, 0.25), j === 0 ? 0.24 : 0.18, rand(-0.2, 0.2)] as const, r: rand(0.25, 0.36), top: j === 0 })), []);
  const mats = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const hasBlossom = idx % 3 === 1;
  useFrame(() => {
    const { spring: ws, summer: wsu, autumn: wa, winter: ww } = envState;
    for (let i = 0; i < parts.length; i++) {
      const m = mats.current[i];
      if (!m) continue;
      const sp = hasBlossom && parts[i]!.top ? BUSH_SPRING_BLOSSOM : BUSH_SPRING;
      const wi = parts[i]!.top ? BUSH_WINTER_TOP : BUSH_WINTER_BASE;
      _bushCol.setRGB(
        sp.r * ws + BUSH_SUMMER.r * wsu + BUSH_AUTUMN.r * wa + wi.r * ww,
        sp.g * ws + BUSH_SUMMER.g * wsu + BUSH_AUTUMN.g * wa + wi.g * ww,
        sp.b * ws + BUSH_SUMMER.b * wsu + BUSH_AUTUMN.b * wa + wi.b * ww,
      );
      m.color.copy(_bushCol);
    }
  });
  return (
    <group position={[x, 0, z]}>
      {parts.map((b, i) => (
        <mesh key={i} position={b.p} {...SHADOW}>
          <icosahedronGeometry args={[b.r, 3]} />
          <meshStandardMaterial ref={el => { mats.current[i] = el; }} color="#4d9334" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

function Clouds() {
  const refs = useRef<THREE.Group[]>([]);
  const defs = useMemo(() => ([[4, 5.2, -10, 1.1], [-12, 6, -8.5, 0.8], [14, 5.6, -4, 0.9]] as const).map(([x, y, z, s]) => ({ x, y, z, s, sp: rand(0.25, 0.45), bob: rand(0, 6) })), []);
  const sharedMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, emissive: '#fff8ee', emissiveIntensity: 0.25 }), []);
  useFrame(({ clock }, dt) => {
    const windMult = 1 + envState.wind * 0.75;
    sharedMat.color.copy(envState.cloudTint);
    sharedMat.emissive.copy(envState.cloudTint);
    sharedMat.emissiveIntensity = 0.25 * (1 - envState.rain * 0.55);
    refs.current.forEach((g, i) => {
      const d = defs[i]!; g.position.x += d.sp * windMult * dt; if (g.position.x > 17) g.position.x = -17;
      g.position.y = d.y + Math.sin(clock.elapsedTime * 0.6 + d.bob) * 0.15;
    });
  });
  return (
    <>
      {defs.map((d, i) => (
        <group key={i} ref={el => { if (el) refs.current[i] = el; }} position={[d.x, d.y, d.z]}>
          {([[0, 0, 0, 0.8], [0.8, -0.1, 0.1, 0.6], [-0.8, -0.15, 0, 0.6], [0.3, 0.35, -0.1, 0.6], [-0.35, 0.3, 0.2, 0.55]] as const).map(([bx, by, bz, br], j) => (
            <mesh key={j} position={[bx * d.s, by * d.s, bz * d.s]} scale-y={0.8} castShadow material={sharedMat}>
              <icosahedronGeometry args={[br * d.s, 4]} />
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
      {BUSHES.map(([x, z], i) => <Bush key={i} x={x} z={z} idx={i} />)}
      <Clouds />
    </group>
  );
}

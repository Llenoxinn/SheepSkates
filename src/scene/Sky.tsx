import { useRef } from 'react';
import type { ReactElement } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { baked } from '../game/textures';
import { clamp } from '../game/math';

/* ------------------------------------------------------------------ */
/* Sky dome shader (sunlit storybook gradient)                         */
/* ------------------------------------------------------------------ */

const SKY_VERT = /* glsl */ `
varying vec3 vWorldDir;
void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldDir = normalize(worldPos.xyz);
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

const SKY_FRAG = /* glsl */ `
uniform vec3 uZenith;
uniform vec3 uUpperSky;
uniform vec3 uMidSky;
uniform vec3 uHorizon;
uniform vec3 uLowerMid;
uniform vec3 uNadir;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
varying vec3 vWorldDir;

void main() {
  vec3 dir = normalize(vWorldDir);
  float y = dir.y;

  // Calibrated for the floating-island diorama camera so the top of the frame
  // opens into airy pastel sky blue, transitions through warm cream mist behind
  // the island, and rests on soft parchment/apricot air beneath the shadow.
  vec3 col = uNadir;
  col = mix(col, uLowerMid, smoothstep(-0.98, -0.84, y));
  col = mix(col, uHorizon,  smoothstep(-0.84, -0.73, y));
  col = mix(col, uMidSky,   smoothstep(-0.73, -0.58, y));
  col = mix(col, uUpperSky, smoothstep(-0.58, -0.24, y));
  col = mix(col, uZenith,   smoothstep(-0.24,  0.38, y));

  // Subtle warm sun glow along the key-light direction (-9, 20, 9)
  float sunDot = max(dot(dir, uSunDir), 0.0);
  float sunHalo = pow(sunDot, 5.0) * 0.12 + pow(sunDot, 24.0) * 0.14;
  float horizonBand = exp(-pow((y + 0.68) * 4.0, 2.0));
  float sideWarmth = smoothstep(-0.2, 0.85, -dir.x) * horizonBand * 0.05;

  col += uSunColor * (sunHalo + sideWarmth);

  // Stay below Bloom luminanceThreshold (0.92) for soft matte storybook sky
  col = min(col, vec3(0.89));

  gl_FragColor = vec4(col, 1.0);
}
`;

/* ------------------------------------------------------------------ */
/* Stylized low-poly cloud geometry builder                            */
/* ------------------------------------------------------------------ */

type Puff = readonly [x: number, y: number, z: number, rx: number, ry: number, rz: number];

const CLOUD_PUFFS: readonly (readonly Puff[])[] = [
  // Variant 0: classic wide storybook cumulus
  [
    [0.0, 0.28, 0.0, 1.15, 0.88, 0.92],
    [-1.05, 0.02, 0.08, 0.86, 0.64, 0.78],
    [1.08, 0.04, -0.06, 0.90, 0.66, 0.80],
    [-1.82, -0.14, 0.02, 0.62, 0.44, 0.58],
    [1.88, -0.12, 0.05, 0.64, 0.46, 0.60],
    [0.42, 0.46, 0.18, 0.72, 0.58, 0.68],
  ],
  // Variant 1: asymmetric billowy crown
  [
    [-0.35, 0.36, 0.0, 1.12, 0.94, 0.90],
    [0.72, 0.16, 0.10, 0.92, 0.72, 0.82],
    [-1.32, -0.04, -0.08, 0.78, 0.56, 0.72],
    [1.56, -0.12, -0.04, 0.66, 0.46, 0.62],
    [0.12, -0.06, -0.26, 0.84, 0.52, 0.70],
  ],
  // Variant 2: light elongated wisp
  [
    [0.0, 0.14, 0.0, 1.18, 0.62, 0.76],
    [-1.15, -0.02, 0.06, 0.84, 0.48, 0.66],
    [1.18, 0.0, -0.05, 0.82, 0.46, 0.64],
    [-0.35, 0.30, 0.08, 0.72, 0.46, 0.58],
  ],
];

const SUN_DIR = new THREE.Vector3(-9, 20, 9).normalize();

function buildCloudGeometry(puffs: readonly Puff[]): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  for (const [x, y, z, rx, ry, rz] of puffs) {
    const g = new THREE.SphereGeometry(1, 10, 8);
    g.scale(rx, ry, rz);
    g.translate(x, y, z);
    parts.push(g);
  }
  const merged = mergeGeometries(parts, false);
  for (const g of parts) g.dispose();
  if (!merged) throw new Error('Failed to merge cloud geometry');

  merged.computeBoundingBox();
  const box = merged.boundingBox!;
  const minY = box.min.y;
  const invSpan = 1 / Math.max(0.001, box.max.y - minY);

  const pos = merged.attributes.position!;
  const nor = merged.attributes.normal!;
  const colors = new Float32Array(pos.count * 3);
  // Warm cream crown -> soft warm lavender-taupe underside (kept below 0.92 bloom threshold)
  const topCol = new THREE.Color('#f3eee3');
  const botCol = new THREE.Color('#d9d1c7');
  const c = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const tY = clamp((pos.getY(i) - minY) * invSpan, 0, 1);
    const sunDot = nor.getX(i) * SUN_DIR.x + nor.getY(i) * SUN_DIR.y + nor.getZ(i) * SUN_DIR.z;
    const sunWrap = clamp(sunDot * 0.5 + 0.5, 0, 1);
    const k = clamp(tY * 0.72 + sunWrap * 0.28, 0, 1);
    const s = k * k * (3 - 2 * k);
    c.copy(botCol).lerp(topCol, s);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  merged.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return merged;
}

/* ------------------------------------------------------------------ */
/* Cloud layout (drifts +X, wraps [-95, +95], never clips 26x18 island)*/
/* ------------------------------------------------------------------ */

type CloudDef = {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotY: number;
  speed: number;
  variant: 0 | 1 | 2;
  phase: number;
  bobAmp: number;
};

const WRAP_HALF = 95;
const WRAP_SPAN = WRAP_HALF * 2;

const CLOUDS: readonly CloudDef[] = [
  // Backdrop layer behind the island (framed in the default diorama view)
  { x: -26, y: -9.5,  z: -24, scale: 2.1, rotY: 0.15,  speed: 0.42, variant: 0, phase: 0.3, bobAmp: 0.22 },
  { x: -6,  y: -11.5, z: -28, scale: 2.5, rotY: -0.20, speed: 0.36, variant: 1, phase: 1.7, bobAmp: 0.26 },
  { x: 16,  y: -10.5, z: -26, scale: 2.2, rotY: 0.35,  speed: 0.40, variant: 2, phase: 3.1, bobAmp: 0.20 },
  { x: 38,  y: -14.0, z: -34, scale: 2.8, rotY: -0.10, speed: 0.32, variant: 0, phase: 4.5, bobAmp: 0.28 },
  { x: -48, y: -15.5, z: -36, scale: 3.0, rotY: 0.25,  speed: 0.30, variant: 1, phase: 2.2, bobAmp: 0.30 },
  { x: 6,   y: -17.5, z: -42, scale: 3.2, rotY: -0.30, speed: 0.26, variant: 0, phase: 5.1, bobAmp: 0.25 },
  // Flanking / lower-air layer (y <= -9.5 passes cleanly beneath the floating island)
  { x: -24, y: -9.5,  z: -8,  scale: 1.9, rotY: 0.40,  speed: 0.48, variant: 2, phase: 0.9, bobAmp: 0.18 },
  { x: 24,  y: -9.8,  z: -6,  scale: 2.0, rotY: -0.25, speed: 0.45, variant: 1, phase: 3.8, bobAmp: 0.20 },
  { x: -62, y: -11.0, z: 4,   scale: 2.3, rotY: 0.10,  speed: 0.38, variant: 0, phase: 1.2, bobAmp: 0.22 },
  { x: 58,  y: -11.5, z: 12,  scale: 2.4, rotY: -0.35, speed: 0.35, variant: 2, phase: 4.9, bobAmp: 0.20 },
  // Upper-sky horizon layer (visible when orbiting lower or rotating 360 deg)
  { x: -34, y: 4.5,   z: -56, scale: 3.4, rotY: 0.20,  speed: 0.24, variant: 0, phase: 0.5, bobAmp: 0.32 },
  { x: 22,  y: 7.5,   z: -64, scale: 3.8, rotY: -0.15, speed: 0.22, variant: 1, phase: 2.8, bobAmp: 0.35 },
  { x: 72,  y: 2.5,   z: -50, scale: 3.1, rotY: 0.30,  speed: 0.27, variant: 2, phase: 5.6, bobAmp: 0.28 },
  { x: -18, y: 11.5,  z: -74, scale: 4.1, rotY: -0.22, speed: 0.19, variant: 0, phase: 1.9, bobAmp: 0.35 },
  { x: -40, y: 5.0,   z: 56,  scale: 3.3, rotY: 2.95,  speed: 0.25, variant: 1, phase: 3.4, bobAmp: 0.30 },
  { x: 35,  y: 8.5,   z: 64,  scale: 3.6, rotY: 3.25,  speed: 0.23, variant: 2, phase: 0.8, bobAmp: 0.32 },
];

type SkyAssets = {
  domeGeo: THREE.SphereGeometry;
  domeMat: THREE.ShaderMaterial;
  cloudGeos: readonly THREE.BufferGeometry[];
  cloudMat: THREE.MeshBasicMaterial;
};

function getSkyAssets(): SkyAssets {
  return baked('skyAssets', () => ({
    domeGeo: new THREE.SphereGeometry(170, 32, 20),
    domeMat: new THREE.ShaderMaterial({
      vertexShader: SKY_VERT,
      fragmentShader: SKY_FRAG,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        uZenith: { value: new THREE.Color('#7db8e6') },
        uUpperSky: { value: new THREE.Color('#8fc3ea') },
        uMidSky: { value: new THREE.Color('#b9dcf2') },
        uHorizon: { value: new THREE.Color('#f5efe0') },
        uLowerMid: { value: new THREE.Color('#e7dcc8') },
        uNadir: { value: new THREE.Color('#dfd2bc') },
        uSunDir: { value: SUN_DIR.clone() },
        uSunColor: { value: new THREE.Color('#fff1d6') },
      },
    }),
    cloudGeos: CLOUD_PUFFS.map(buildCloudGeometry),
    cloudMat: new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }),
  }));
}

/** Sunlit storybook gradient sky dome with gently drifting stylized clouds. */
export function Sky(): ReactElement {
  const assets = getSkyAssets();
  const cloudRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state, dt) => {
    const step = Math.min(dt, 0.1);
    const t = state.clock.elapsedTime;
    const refs = cloudRefs.current;
    for (let i = 0; i < CLOUDS.length; i++) {
      const mesh = refs[i];
      if (!mesh) continue;
      const c = CLOUDS[i]!;
      let nx = mesh.position.x + c.speed * step;
      if (nx > WRAP_HALF) nx -= WRAP_SPAN;
      mesh.position.x = nx;
      mesh.position.y = c.y + Math.sin(t * 0.45 + c.phase) * c.bobAmp;
    }
  });

  return (
    <group>
      <mesh geometry={assets.domeGeo} material={assets.domeMat} frustumCulled={false} renderOrder={-10} />
      {CLOUDS.map((c, i) => (
        <mesh
          key={i}
          ref={el => { cloudRefs.current[i] = el; }}
          geometry={assets.cloudGeos[c.variant]!}
          material={assets.cloudMat}
          position={[c.x, c.y, c.z]}
          rotation-y={c.rotY}
          scale={c.scale}
          castShadow={false}
          receiveShadow={false}
        />
      ))}
    </group>
  );
}

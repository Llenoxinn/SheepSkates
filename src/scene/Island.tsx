import { useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { IW, IH, PLAZA, PLAZA_TOP, POND } from '../game/config';
import { baked, paintIsland, paintPlazaDecal, radialTex, setupPbr } from '../game/textures';
import { clamp, pick, rand } from '../game/math';

export const tex = (n: string) => ({ map: `textures/${n}_diff.jpg`, normalMap: `textures/${n}_nor.jpg`, roughnessMap: `textures/${n}_rough.jpg` });
for (const n of ['dirt', 'smooth_concrete_floor', 'plywood']) useTexture.preload(Object.values(tex(n)));

function roundedRectShape(x0: number, z0: number, w: number, h: number, r: number) {
  const s = new THREE.Shape();
  s.moveTo(x0 + r, z0); s.lineTo(x0 + w - r, z0); s.quadraticCurveTo(x0 + w, z0, x0 + w, z0 + r);
  s.lineTo(x0 + w, z0 + h - r); s.quadraticCurveTo(x0 + w, z0 + h, x0 + w - r, z0 + h);
  s.lineTo(x0 + r, z0 + h); s.quadraticCurveTo(x0, z0 + h, x0, z0 + h - r);
  s.lineTo(x0, z0 + r); s.quadraticCurveTo(x0, z0, x0 + r, z0);
  return s;
}

/** Grass top + soil slab + pond + floating shadow. */
export function Island() {
  const gl = useThree(s => s.gl);
  const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy());
  const dirt = setupPbr(useTexture(tex('dirt')), 0.35, aniso);
  const painted = baked('island', () => paintIsland(aniso));

  const slab = useMemo(() => {
    const { inset: m, radius: r } = painted, bt = 0.14;
    const g = new THREE.ExtrudeGeometry(roundedRectShape(-IW / 2 + m, -IH / 2 + m, IW - 2 * m, IH - 2 * m, r), {
      depth: 1.1, bevelEnabled: true, bevelThickness: bt, bevelSize: 0.14, bevelSegments: 4, curveSegments: 18,
    });
    g.rotateX(Math.PI / 2);
    // vertical gradient: warm topsoil → darker bedrock
    const pos = g.attributes.position!, col = new Float32Array(pos.count * 3);
    const top = new THREE.Color('#c79a6c'), bot = new THREE.Color('#6d4f3a'), c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) { const k = clamp((pos.getY(i) + bt) / 1.4, 0, 1); c.copy(top).lerp(bot, k * k); col.set([c.r, c.g, c.b], i * 3); }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return { g, y: -0.04 - bt };
  }, [painted]);

  const floorShadow = useMemo(() => radialTex('rgba(70,45,20,.55)', 'rgba(70,45,20,0)', 256), []);

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[IW, IH]} />
        <meshStandardMaterial map={painted.map} normalMap={painted.normalMap} normalScale={[0.6, 0.6]} alphaTest={0.5} roughness={0.95} />
      </mesh>
      <mesh geometry={slab.g} position-y={slab.y} receiveShadow>
        <meshStandardMaterial vertexColors {...dirt} normalScale={[1.2, 1.2]} roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -3.2, 1]}>
        <planeGeometry args={[IW * 1.45, IH * 1.55]} />
        <meshBasicMaterial map={floorShadow} transparent depthWrite={false} opacity={0.55} />
      </mesh>
      <Pond />
      <GrassTufts />
    </group>
  );
}

function Pond() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} scale={[POND.rx, POND.rz, 1]} position={[POND.x, 0.015, POND.z]}>
        <circleGeometry args={[1, 64]} />
        <meshPhysicalMaterial color="#7fb9ea" transparent opacity={0.38} roughness={0.05} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
      {([[-9.6, 2.7, 0.32], [-8.1, 3.9, 0.25], [-7.6, 2.8, 0.2]] as const).map(([x, z, s], i) => (
        <mesh key={i} position={[x, 0.03, z]} receiveShadow castShadow>
          <cylinderGeometry args={[s, s, 0.03, 24, 1, false, 0.4, 5.8]} />
          <meshStandardMaterial color="#6aa83f" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/** Instanced 3D grass blades for tactile depth on top of the painted ground. */
function GrassTufts() {
  const mesh = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.045, 0.2, 5); geo.translate(0, 0.1, 0);
    const N = 1400, inst = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ roughness: 1 }), N);
    const d = new THREE.Object3D(), c = new THREE.Color();
    for (let n = 0; n < N;) {
      const x = rand(-12.3, 12.3), z = rand(-8.3, 8.3);
      if (x > PLAZA.x0 - 0.2 && x < PLAZA.x1 + 0.2 && z > PLAZA.z0 - 0.2 && z < PLAZA.z1 + 0.2) continue;
      if (((x - POND.x) / (POND.rx + 0.5)) ** 2 + ((z - POND.z) / (POND.rz + 0.5)) ** 2 < 1) continue;
      d.position.set(x, 0, z); d.rotation.set(rand(-0.25, 0.25), rand(0, 6), rand(-0.25, 0.25)); d.scale.setScalar(rand(0.6, 1.4)); d.updateMatrix();
      inst.setMatrixAt(n, d.matrix); inst.setColorAt(n, c.set(pick(['#5f9d3a', '#78b448', '#4b8a30', '#8cc155']))); n++;
    }
    inst.receiveShadow = true;
    return inst;
  }, []);
  return <primitive object={mesh} />;
}

/** Concrete skate plaza: real PBR concrete with painted decals on top. */
export function Plaza() {
  const gl = useThree(s => s.gl);
  const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy());
  const concrete = setupPbr(useTexture(tex('smooth_concrete_floor')), 0.28, aniso);
  const decal = baked('plazaDecal', () => paintPlazaDecal(aniso));
  const w = PLAZA.x1 - PLAZA.x0, d = PLAZA.z1 - PLAZA.z0, cx = (PLAZA.x0 + PLAZA.x1) / 2, cz = (PLAZA.z0 + PLAZA.z1) / 2;

  const geo = useMemo(() => {
    const depth = 0.05, bt = 0.012;
    const g = new THREE.ExtrudeGeometry(roundedRectShape(PLAZA.x0, PLAZA.z0, w, d, PLAZA.radius), {
      depth, bevelEnabled: true, bevelThickness: bt, bevelSize: 0.04, bevelSegments: 3, curveSegments: 16,
    });
    g.rotateX(Math.PI / 2);                     // shape-y → world z, extrusion → -y
    g.translate(0, PLAZA_TOP - bt + 0, 0);       // top face sits at PLAZA_TOP
    return g;
  }, [w, d]);

  return (
    <group>
      <mesh geometry={geo} receiveShadow>
        {/* painted-concrete look: real normal/roughness relief, light warm base colour */}
        <meshStandardMaterial normalMap={concrete.normalMap} roughnessMap={concrete.roughnessMap} color="#d6ccbb" normalScale={[1.4, 1.4]} roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[cx, PLAZA_TOP + 0.002, cz]} receiveShadow>
        <planeGeometry args={[w - 0.1, d - 0.1]} />
        <meshStandardMaterial map={decal} transparent depthWrite={false} roughness={0.9} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
    </group>
  );
}

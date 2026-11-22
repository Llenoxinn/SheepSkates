import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { IW, IH, PLAZA, PLAZA_TOP, POND } from '../game/config';
import { baked, paintIsland, paintPlazaDecal, radialTex, setupPbr } from '../game/textures';
import { clamp, pick, rand } from '../game/math';
import { envState } from '../game/weather';

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

const POND_WARM = new THREE.Color('#7fb9ea');
const POND_RAIN = new THREE.Color('#669cc7');
const POND_ICE = new THREE.Color('#cfe6f8');
const LILY_WARM = new THREE.Color('#6aa83f');
const LILY_AUTUMN = new THREE.Color('#a88c42');
const LILY_WINTER = new THREE.Color('#bdd2da');
const CONCRETE_DRY = new THREE.Color('#d6ccbb');
const CONCRETE_WET = new THREE.Color('#a79f96');
const CONCRETE_ICE = new THREE.Color('#d3e1ee');
const _tmpCol = new THREE.Color();

/** Grass top + soil slab + pond + floating shadow, reactive to seasons and snow. */
export function Island() {
  const gl = useThree(s => s.gl);
  const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy());
  const dirt = setupPbr(useTexture(tex('dirt')), 0.35, aniso);
  const painted = baked('island', () => paintIsland(aniso));

  const groundUniforms = useMemo(() => ({
    uSpring: { value: 0 },
    uAutumn: { value: 0 },
    uSnow: { value: 0 },
  }), []);

  const groundMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      map: painted.map,
      normalMap: painted.normalMap,
      normalScale: new THREE.Vector2(0.6, 0.6),
      alphaTest: 0.5,
      roughness: 0.95,
    });
    m.customProgramCacheKey = () => 'island-seasonal-v1';
    m.onBeforeCompile = shader => {
      shader.uniforms.uSpring = groundUniforms.uSpring;
      shader.uniforms.uAutumn = groundUniforms.uAutumn;
      shader.uniforms.uSnow = groundUniforms.uSnow;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vWorldXZ;')
        .replace('#include <project_vertex>', 'vWorldXZ = (modelMatrix * vec4(transformed, 1.0)).xz;\n#include <project_vertex>');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vWorldXZ;\nuniform float uSpring;\nuniform float uAutumn;\nuniform float uSnow;')
        .replace(
          '#include <map_fragment>',
          `#include <map_fragment>
          float pondDist = length((vWorldXZ - vec2(${POND.x.toFixed(2)}, ${POND.z.toFixed(2)})) / vec2(${(POND.rx + 0.15).toFixed(2)}, ${(POND.rz + 0.15).toFixed(2)}));
          float notPond = smoothstep(0.90, 1.15, pondDist);
          float greenMask = smoothstep(-0.04, 0.08, diffuseColor.g - diffuseColor.r * 0.94)
                          * smoothstep(0.02, 0.14, diffuseColor.g - diffuseColor.b);
          float goldenMeadow = smoothstep(0.16, 0.32, diffuseColor.g - diffuseColor.b)
                             * smoothstep(0.35, 0.18, diffuseColor.b);
          float grassOnly = greenMask * notPond;
          float meadowMask = max(greenMask, goldenMeadow) * notPond;

          vec3 springGrass = vec3(diffuseColor.r * 0.93, diffuseColor.g * 1.09, diffuseColor.b * 0.95);
          diffuseColor.rgb = mix(diffuseColor.rgb, springGrass, grassOnly * uSpring);

          vec3 autumnGrass = vec3(
            diffuseColor.g * 1.12 + diffuseColor.r * 0.06,
            diffuseColor.g * 0.72 + diffuseColor.r * 0.14,
            diffuseColor.b * 0.70 + 0.02
          );
          diffuseColor.rgb = mix(diffuseColor.rgb, autumnGrass, grassOnly * uAutumn);

          float drift = 0.5
            + 0.28 * sin(vWorldXZ.x * 0.65 + cos(vWorldXZ.y * 0.55) * 1.4)
            + 0.22 * cos(vWorldXZ.y * 0.85 - sin(vWorldXZ.x * 0.48) * 1.2);
          float snowCover = clamp(uSnow * mix(0.45, 1.15, meadowMask) * mix(0.75, 1.08, drift), 0.0, 1.0) * notPond;
          vec3 snowCol = mix(vec3(0.73, 0.79, 0.87), vec3(0.83, 0.88, 0.94), drift);
          diffuseColor.rgb = mix(diffuseColor.rgb, snowCol, snowCover);`,
        );
    };
    return m;
  }, [painted, groundUniforms]);

  useFrame(() => {
    groundUniforms.uSpring.value = envState.spring;
    groundUniforms.uAutumn.value = envState.autumn;
    groundUniforms.uSnow.value = clamp(envState.winter * 0.92 + envState.snow * 0.45, 0, 1);
  });

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
      <mesh rotation-x={-Math.PI / 2} receiveShadow material={groundMat}>
        <planeGeometry args={[IW, IH]} />
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
  const waterRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const lilyRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);

  useFrame(() => {
    if (waterRef.current) {
      const m = waterRef.current;
      _tmpCol.copy(POND_WARM).lerp(POND_RAIN, envState.rain * 0.65).lerp(POND_ICE, envState.ice);
      m.color.copy(_tmpCol);
      m.opacity = 0.38 + envState.ice * 0.38;
      m.roughness = 0.05 + envState.ice * 0.14 + envState.rain * 0.08;
    }
    for (const lm of lilyRefs.current) {
      if (!lm) continue;
      lm.color.copy(LILY_WARM).lerp(LILY_AUTUMN, envState.autumn * 0.75).lerp(LILY_WINTER, envState.winter * 0.85);
    }
  });

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} scale={[POND.rx, POND.rz, 1]} position={[POND.x, 0.015, POND.z]}>
        <circleGeometry args={[1, 64]} />
        <meshPhysicalMaterial ref={waterRef} color="#7fb9ea" transparent opacity={0.38} roughness={0.05} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
      {([[-9.6, 2.7, 0.32], [-8.1, 3.9, 0.25], [-7.6, 2.8, 0.2]] as const).map(([x, z, s], i) => (
        <mesh key={i} position={[x, 0.03, z]} receiveShadow castShadow>
          <cylinderGeometry args={[s, s, 0.03, 24, 1, false, 0.4, 5.8]} />
          <meshStandardMaterial ref={el => { lilyRefs.current[i] = el; }} color="#6aa83f" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/** Instanced 3D grass blades with seasonal tint, winter frost, and wind sway. */
function GrassTufts() {
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uWind: { value: 0.25 },
    uSnow: { value: 0 },
  }), []);

  const mesh = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.045, 0.2, 5); geo.translate(0, 0.1, 0);
    const mat = new THREE.MeshStandardMaterial({ roughness: 1 });
    mat.customProgramCacheKey = () => 'tufts-seasonal-v1';
    mat.onBeforeCompile = shader => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uWind = uniforms.uWind;
      shader.uniforms.uSnow = uniforms.uSnow;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTime;\nuniform float uWind;')
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          #ifdef USE_INSTANCING
            vec3 instPos = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
          #else
            vec3 instPos = vec3(0.0);
          #endif
          float sway = sin(uTime * (2.2 + uWind * 3.0) + instPos.x * 0.7 + instPos.z * 0.55) * 0.032 * (0.4 + uWind);
          float tip = smoothstep(0.0, 0.2, position.y);
          transformed.x += sway * tip;
          transformed.z += cos(uTime * 1.7 + instPos.z * 0.6) * 0.015 * (0.4 + uWind) * tip;`,
        );
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform float uSnow;')
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.76, 0.82, 0.90), uSnow * 0.88);`,
        );
    };

    const N = 1400, inst = new THREE.InstancedMesh(geo, mat, N);
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
  }, [uniforms]);

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uWind.value = envState.wind;
    uniforms.uSnow.value = clamp(envState.winter * 0.92 + envState.snow * 0.45, 0, 1);
    (mesh.material as THREE.MeshStandardMaterial).color.copy(envState.tuftTint);
  });

  return <primitive object={mesh} />;
}

/** Concrete skate plaza: PBR concrete + decals + rain puddles & icy winter glaze. */
export function Plaza() {
  const gl = useThree(s => s.gl);
  const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy());
  const concrete = setupPbr(useTexture(tex('smooth_concrete_floor')), 0.28, aniso);
  const decal = baked('plazaDecal', () => paintPlazaDecal(aniso));
  const w = PLAZA.x1 - PLAZA.x0, d = PLAZA.z1 - PLAZA.z0, cx = (PLAZA.x0 + PLAZA.x1) / 2, cz = (PLAZA.z0 + PLAZA.z1) / 2;

  const baseMatRef = useRef<THREE.MeshStandardMaterial>(null);

  const weatherUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uRain: { value: 0 },
    uWetness: { value: 0 },
    uIce: { value: 0 },
  }), []);

  const geo = useMemo(() => {
    const depth = 0.05, bt = 0.012;
    const g = new THREE.ExtrudeGeometry(roundedRectShape(PLAZA.x0, PLAZA.z0, w, d, PLAZA.radius), {
      depth, bevelEnabled: true, bevelThickness: bt, bevelSize: 0.04, bevelSegments: 3, curveSegments: 16,
    });
    g.rotateX(Math.PI / 2);
    g.translate(0, PLAZA_TOP - bt, 0);
    return g;
  }, [w, d]);

  const weatherGeo = useMemo(() => {
    const g = new THREE.ShapeGeometry(roundedRectShape(PLAZA.x0 + 0.05, -PLAZA.z1 + 0.05, w - 0.1, d - 0.1, PLAZA.radius - 0.04), 16);
    g.rotateX(-Math.PI / 2);
    return g;
  }, [w, d]);

  const weatherMat = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      transparent: true,
      depthWrite: false,
      roughness: 0.04,
      metalness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      envMapIntensity: 1.45,
      polygonOffset: true,
      polygonOffsetFactor: -4,
    });
    m.customProgramCacheKey = () => 'plaza-weather-v1';
    m.onBeforeCompile = shader => {
      shader.uniforms.uTime = weatherUniforms.uTime;
      shader.uniforms.uRain = weatherUniforms.uRain;
      shader.uniforms.uWetness = weatherUniforms.uWetness;
      shader.uniforms.uIce = weatherUniforms.uIce;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vWorldXZ;')
        .replace('#include <project_vertex>', 'vWorldXZ = (modelMatrix * vec4(transformed, 1.0)).xz;\n#include <project_vertex>');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vWorldXZ;\nuniform float uTime;\nuniform float uRain;\nuniform float uWetness;\nuniform float uIce;')
        .replace(
          '#include <map_fragment>',
          `#include <map_fragment>
          vec2 wp = vWorldXZ;
          vec2 q = abs(wp - vec2(${cx.toFixed(2)}, ${cz.toFixed(2)})) - vec2(${(w / 2 - PLAZA.radius).toFixed(2)}, ${(d / 2 - PLAZA.radius).toFixed(2)});
          float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - ${PLAZA.radius.toFixed(2)};
          float insetMask = smoothstep(-0.08, -0.52, sd);

          // Organic rain puddles across flat skating apron
          float pField = 0.50 * sin(wp.x * 0.72 + sin(wp.y * 0.58) * 1.4)
                       + 0.32 * cos(wp.y * 0.88 - cos(wp.x * 0.65) * 1.2)
                       + 0.18 * sin((wp.x - wp.y) * 1.35);
          float puddle = smoothstep(0.14, 0.38, pField) * insetMask * uWetness;

          float ripples = 0.0;
          if (uRain > 0.02 && puddle > 0.05) {
            for (int k = 0; k < 2; k++) {
              float scale = k == 0 ? 1.35 : 2.1;
              vec2 cell = floor(wp * scale);
              vec2 fpos = fract(wp * scale) - 0.5;
              float h1 = fract(sin(dot(cell, vec2(127.1, 311.7)) + float(k) * 17.3) * 43758.5453);
              float h2 = fract(sin(dot(cell, vec2(269.5, 183.3)) + float(k) * 31.7) * 43758.5453);
              vec2 center = (vec2(h1, h2) - 0.5) * 0.45;
              float age = fract(uTime * (1.25 + h1 * 0.6) + h2 * 6.28);
              float dist = length(fpos - center);
              float ringRadius = age * 0.36;
              ripples += exp(-abs(dist - ringRadius) * 42.0) * (1.0 - age);
            }
          }
          ripples *= puddle * uRain;

          // Translucent winter ice sheet with frosted perimeter & skate streaks
          float edgeFrost = smoothstep(-1.15, -0.04, sd);
          float iceGrain = 0.5 + 0.5 * sin(wp.x * 2.3 + wp.y * 1.7) * cos(wp.x * 1.9 - wp.y * 2.6);
          float skateStreak = pow(0.5 + 0.5 * sin((wp.x * 0.85 + wp.y * 0.55) * 3.8 + sin(wp.y * 1.4) * 1.6), 5.0);
          float iceAlpha = uIce * (0.28 + edgeFrost * 0.28 + skateStreak * 0.14 + iceGrain * 0.06);
          vec3 iceCol = mix(vec3(0.68, 0.83, 0.95), vec3(0.84, 0.91, 0.97), clamp(edgeFrost * 0.72 + skateStreak * 0.5, 0.0, 1.0));

          vec3 puddleCol = mix(vec3(0.34, 0.48, 0.62), vec3(0.75, 0.87, 0.96), clamp(ripples * 0.9, 0.0, 1.0));
          float puddleAlpha = clamp(puddle * 0.58 + ripples * 0.25, 0.0, 0.75);
          float outAlpha = max(puddleAlpha, iceAlpha);
          if (outAlpha < 0.005) discard;
          float iceBlend = iceAlpha / max(outAlpha, 0.001);
          diffuseColor.rgb = mix(puddleCol, iceCol, clamp(iceBlend * 0.85, 0.0, 1.0));
          diffuseColor.a = outAlpha;`,
        )
        .replace(
          '#include <roughnessmap_fragment>',
          `#include <roughnessmap_fragment>
          roughnessFactor = mix(0.04, 0.22, smoothstep(-1.15, -0.04, sd) * uIce * (1.0 - puddle));`,
        );
    };
    return m;
  }, [cx, cz, d, w, weatherUniforms]);

  useFrame(({ clock }) => {
    weatherUniforms.uTime.value = clock.elapsedTime;
    weatherUniforms.uRain.value = envState.rain;
    weatherUniforms.uWetness.value = envState.wetness;
    weatherUniforms.uIce.value = envState.ice;

    if (baseMatRef.current) {
      _tmpCol.copy(CONCRETE_DRY).lerp(CONCRETE_WET, envState.wetness * 0.85).lerp(CONCRETE_ICE, envState.ice * 0.55);
      baseMatRef.current.color.copy(_tmpCol);
      baseMatRef.current.roughness = 1 - envState.wetness * 0.35 - envState.ice * 0.25;
    }
  });

  return (
    <group>
      <mesh geometry={geo} receiveShadow>
        <meshStandardMaterial ref={baseMatRef} normalMap={concrete.normalMap} roughnessMap={concrete.roughnessMap} color="#d6ccbb" normalScale={[1.4, 1.4]} roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[cx, PLAZA_TOP + 0.002, cz]} receiveShadow>
        <planeGeometry args={[w - 0.1, d - 0.1]} />
        <meshStandardMaterial map={decal} transparent depthWrite={false} roughness={0.9} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
      <mesh geometry={weatherGeo} material={weatherMat} position={[0, PLAZA_TOP + 0.004, 0]} receiveShadow />
    </group>
  );
}

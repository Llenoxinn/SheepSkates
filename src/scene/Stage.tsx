import { useEffect, useRef, type ComponentRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls, SoftShadows } from '@react-three/drei';
import { Bloom, EffectComposer, HueSaturation, N8AO, SMAA, TiltShift2, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { world } from '../game/world';

const TARGET = new THREE.Vector3(0.4, 0, 0.6);
const CAM_DIR = new THREE.Vector3(0, 25, 21).normalize();
const _prevShake = new THREE.Vector3();

/** Warm key light with soft PCSS shadows + studio lightformer environment (no HDR download). */
export function Lighting() {
  return (
    <>
      <hemisphereLight args={['#fff3df', '#6b8a48', 1.1]} />
      <directionalLight
        position={[-9, 20, 9]} intensity={3.4} color="#ffebcc" castShadow
        shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.02}
        shadow-camera-left={-17} shadow-camera-right={17} shadow-camera-top={14} shadow-camera-bottom={-14}
        shadow-camera-near={1} shadow-camera-far={60}
      />
      <SoftShadows size={22} samples={14} focus={0.4} />
      <Environment resolution={256} environmentIntensity={0.45}>
        <Lightformer form="rect" intensity={2.2} color="#fff1dc" scale={[24, 24]} position={[0, 16, 0]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={0.9} color="#d8ecff" scale={[30, 8]} position={[0, 4, -18]} />
        <Lightformer form="rect" intensity={0.6} color="#ffe2c4" scale={[30, 8]} position={[0, 4, 18]} rotation-y={Math.PI} />
      </Environment>
    </>
  );
}

/** Diorama camera: fits the island to the viewport, gentle orbit limits. */
export function CameraRig() {
  const camera = useThree(s => s.camera);
  const size = useThree(s => s.size);
  const ctrlRef = useRef<ComponentRef<typeof OrbitControls>>(null);
  useEffect(() => {
    _prevShake.set(0, 0, 0);
    const d = 42 * Math.max(1, 1.55 / (size.width / size.height));
    camera.position.copy(TARGET).addScaledVector(CAM_DIR, d);
    camera.lookAt(TARGET);
    return () => { _prevShake.set(0, 0, 0); };
  }, [camera, size.width, size.height]);
  useFrame(() => {
    const ctrl = ctrlRef.current;
    camera.position.sub(_prevShake);
    if (ctrl) ctrl.target.sub(_prevShake);
    _prevShake.copy(world.shakeOffset);
    camera.position.add(_prevShake);
    if (ctrl) ctrl.target.add(_prevShake);
  });
  return (
    <OrbitControls
      ref={ctrlRef}
      makeDefault target={TARGET} enableDamping dampingFactor={0.07} enablePan={false}
      rotateSpeed={0.55} zoomSpeed={0.8} minPolarAngle={0.3} maxPolarAngle={1.15} minDistance={12} maxDistance={70}
    />
  );
}

/** Ambient occlusion grounds every contact, tilt-shift sells the miniature, ACES keeps pastels soft. */
const FXQ = new URLSearchParams(location.search).get('fxlist');
const on = (k: string) => !FXQ || FXQ.split(',').includes(k);

export function Effects() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {on('ao') && <N8AO aoRadius={0.7} intensity={2.4} distanceFalloff={0.6} color="#4a3520" halfRes />}
      {on('tilt') && <TiltShift2 blur={0.07} />}
      {on('bloom') && <Bloom intensity={0.25} luminanceThreshold={0.92} mipmapBlur />}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <HueSaturation saturation={0.14} />
      {on('smaa') && <SMAA />}
      {on('vig') && <Vignette offset={0.35} darkness={0.3} />}
    </EffectComposer>
  );
}

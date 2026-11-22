import { useEffect, useRef, type ComponentRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls, SoftShadows } from '@react-three/drei';
import { Bloom, EffectComposer, HueSaturation, N8AO, SMAA, TiltShift2, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useAppPhase } from '../game/appPhase';
import { world } from '../game/world';

const TARGET = new THREE.Vector3(0.4, 0, 0.6);
const TITLE_TARGET = new THREE.Vector3(0.4, -0.8, 0.6);
const CAM_DIR = new THREE.Vector3(0, 25, 21).normalize();
const ENTER_DURATION = 1.15;
const _prevShake = new THREE.Vector3();
const _playPos = new THREE.Vector3();
const _titlePos = new THREE.Vector3();
const _enterStartPos = new THREE.Vector3();
const _enterStartTarget = new THREE.Vector3();
const _curTarget = new THREE.Vector3();

function playDist(width: number, height: number): number {
  return 42 * Math.max(1, 1.55 / (width / Math.max(1, height)));
}

function titleCamPos(d: number, elapsed: number, reducedMotion: boolean, out: THREE.Vector3): THREE.Vector3 {
  const yaw = 0.34 + (reducedMotion ? 0 : Math.sin(elapsed * 0.18) * 0.12);
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const pull = d * 1.68;
  const rx = CAM_DIR.x * c + CAM_DIR.z * s;
  const rz = -CAM_DIR.x * s + CAM_DIR.z * c;
  return out.set(
    TITLE_TARGET.x + rx * pull,
    TITLE_TARGET.y + CAM_DIR.y * pull + 5.5,
    TITLE_TARGET.z + rz * pull,
  );
}

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

/** Diorama camera: distant storybook aerial pose on title, smooth arc zoom-in on Play, orbit limits during gameplay. */
export function CameraRig() {
  const camera = useThree(s => s.camera);
  const size = useThree(s => s.size);
  const phase = useAppPhase(s => s.phase);
  const ctrlRef = useRef<ComponentRef<typeof OrbitControls>>(null);
  const orbitAllowedRef = useRef(true);
  const enterRef = useRef({ active: false, t: 0 });
  const prevPhaseRef = useRef(phase);

  useEffect(() => {
    world.setOrbitEnabled = (on: boolean) => {
      orbitAllowedRef.current = on;
      if (ctrlRef.current) ctrlRef.current.enabled = on && useAppPhase.getState().phase === 'playing';
    };
    return () => {
      world.setOrbitEnabled = null;
    };
  }, []);

  useEffect(() => {
    const ctrl = ctrlRef.current;
    if (ctrl) ctrl.enabled = phase === 'playing' && orbitAllowedRef.current;
  }, [phase]);

  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = phase;
    const d = playDist(size.width, size.height);
    _playPos.copy(TARGET).addScaledVector(CAM_DIR, d);
    if (phase === 'entering' && prev !== 'entering') {
      const ctrl = ctrlRef.current;
      _enterStartPos.copy(camera.position);
      _enterStartTarget.copy(ctrl ? ctrl.target : TITLE_TARGET);
      enterRef.current = { active: true, t: 0 };
      _prevShake.set(0, 0, 0);
    } else if (phase === 'playing' && prev !== 'playing' && prev !== 'entering') {
      camera.position.copy(_playPos);
      camera.lookAt(TARGET);
      const ctrl = ctrlRef.current;
      if (ctrl) {
        ctrl.target.copy(TARGET);
        ctrl.update();
      }
      _prevShake.set(0, 0, 0);
    }
  }, [phase, camera, size.width, size.height]);

  useEffect(() => {
    _prevShake.set(0, 0, 0);
    const d = playDist(size.width, size.height);
    _playPos.copy(TARGET).addScaledVector(CAM_DIR, d);
    const curPhase = useAppPhase.getState().phase;
    if (curPhase === 'playing') {
      camera.position.copy(_playPos);
      camera.lookAt(TARGET);
      if (ctrlRef.current) {
        ctrlRef.current.target.copy(TARGET);
        ctrlRef.current.update();
      }
    } else if (curPhase === 'loading' || curPhase === 'title') {
      const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      titleCamPos(d, 0, reduced, _titlePos);
      camera.position.copy(_titlePos);
      camera.lookAt(TITLE_TARGET);
    }
    return () => { _prevShake.set(0, 0, 0); };
  }, [camera, size.width, size.height]);

  useFrame((state, dt) => {
    const ctrl = ctrlRef.current;
    const d = playDist(size.width, size.height);
    _playPos.copy(TARGET).addScaledVector(CAM_DIR, d);
    const curPhase = useAppPhase.getState().phase;

    if (curPhase === 'loading' || curPhase === 'title') {
      const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      titleCamPos(d, state.clock.elapsedTime, reduced, _titlePos);
      camera.position.copy(_titlePos);
      camera.lookAt(TITLE_TARGET);
      ctrl?.target.copy(TITLE_TARGET);
      return;
    }

    if (curPhase === 'entering' && enterRef.current.active) {
      enterRef.current.t = Math.min(1, enterRef.current.t + Math.min(dt, 1 / 30) / ENTER_DURATION);
      const t = enterRef.current.t;
      const k = 1 - Math.pow(1 - t, 3.4);
      camera.position.lerpVectors(_enterStartPos, _playPos, k);
      camera.position.y += Math.sin(k * Math.PI) * 1.8;
      _curTarget.lerpVectors(_enterStartTarget, TARGET, k);
      camera.lookAt(_curTarget);
      ctrl?.target.copy(_curTarget);
      if (t >= 1) {
        enterRef.current.active = false;
        camera.position.copy(_playPos);
        camera.lookAt(TARGET);
        if (ctrl) {
          ctrl.target.copy(TARGET);
          ctrl.update();
        }
        _prevShake.set(0, 0, 0);
        useAppPhase.getState().finishEntering();
      }
      return;
    }

    camera.position.sub(_prevShake);
    if (ctrl) ctrl.target.sub(_prevShake);
    _prevShake.copy(world.shakeOffset);
    camera.position.add(_prevShake);
    if (ctrl) ctrl.target.add(_prevShake);
  });

  return (
    <OrbitControls
      ref={ctrlRef}
      enabled={phase === 'playing'}
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

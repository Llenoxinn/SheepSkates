import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Island, Plaza } from './scene/Island';
import { Props } from './scene/Props';
import { CameraRig, Effects, Lighting } from './scene/Stage';

const params = new URLSearchParams(location.search);
const FX = params.get('fx') !== '0';

export function App() {
  return (
    <Canvas
      flat shadows dpr={[1, 2]}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      camera={{ fov: 26, near: 0.1, far: 300 }}
      onCreated={s => { (window as unknown as { __r3f: unknown }).__r3f = s; }}
    >
      <color attach="background" args={['#f3ecdf']} />
      <Suspense fallback={null}>
        <Lighting />
        <Island />
        <Plaza />
        <Props />
        {FX && <Effects />}
      </Suspense>
      <CameraRig />
    </Canvas>
  );
}

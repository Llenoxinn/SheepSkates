import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useProgress } from '@react-three/drei';
import { Flock } from './scene/Flock';
import { Island, Plaza } from './scene/Island';
import { Props } from './scene/Props';
import { CameraRig, Effects, Lighting } from './scene/Stage';
import { Hud } from './ui/Hud';
import { world } from './game/world';

const params = new URLSearchParams(location.search);
/** `?fx=0` disables post-processing (low-end devices / debugging). */
const FX = params.get('fx') !== '0';

function Loader() {
  const { active, progress } = useProgress();
  return <div className={`loader ${active ? '' : 'done'}`}>Shearing the textures… {progress.toFixed(0)}%</div>;
}

export function App() {
  useEffect(() => {
    if (!params.has('demo')) return;
    const t = setTimeout(() => { const s = world.flock[0]; if (s) world.select(s); }, 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Canvas
        flat shadows dpr={[1, 2]}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        camera={{ fov: 26, near: 0.1, far: 300 }}
      >
        <color attach="background" args={['#f3ecdf']} />
        <Suspense fallback={null}>
          <Lighting />
          <Island />
          <Plaza />
          <Props />
          <Flock />
          {FX && <Effects />}
        </Suspense>
        <CameraRig />
      </Canvas>
      <div className="grain" />
      <Hud />
      <Loader />
    </>
  );
}

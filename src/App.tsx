import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useAppPhase } from './game/appPhase';
import { decodeParkFromParam, loadParkFromStorage } from './game/parkSerializer';
import { world } from './game/world';
import { Flock } from './scene/Flock';
import { Island, Plaza } from './scene/Island';
import { Props } from './scene/Props';
import { Sky } from './scene/Sky';
import { CameraRig, Effects, Lighting } from './scene/Stage';
import { GouacheDefs } from './ui/ArtIcons';
import { HowToPlayModal } from './ui/HowToPlayModal';
import { Hud } from './ui/Hud';
import { LoadingScreen } from './ui/LoadingScreen';
import { TitleScreen } from './ui/TitleScreen';

const params = new URLSearchParams(location.search);
/** `?fx=0` disables post-processing (low-end devices / debugging). */
const FX = params.get('fx') !== '0';
const SKIP_TITLE = params.has('demo') || params.get('skipTitle') === '1';

function SceneReady() {
  useEffect(() => {
    useAppPhase.getState().setSceneReady();
  }, []);
  return null;
}

export function App() {
  const phase = useAppPhase(s => s.phase);

  useEffect(() => {
    const sharedParam = params.get('park');
    const shared = sharedParam ? decodeParkFromParam(sharedParam) : null;
    if (shared) {
      world.loadPark(shared, false, 'Loaded shared park!');
    } else if (sharedParam) {
      world.showToast('Invalid share link');
    } else {
      const saved = loadParkFromStorage();
      if (saved) world.loadPark(saved, false, null);
    }
  }, []);

  useEffect(() => {
    if (!params.has('demo') || phase !== 'playing') return;
    const t = setTimeout(() => { const s = world.flock[0]; if (s) world.select(s); }, 500);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <>
      <GouacheDefs />
      <Canvas
        flat shadows dpr={[1, 2]}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        camera={{ fov: 26, near: 0.1, far: 300 }}
      >
        <color attach="background" args={['#c8dff0']} />
        <Sky />
        <Suspense fallback={null}>
          <Lighting />
          <Island />
          <Plaza />
          <Props />
          <Flock />
          {FX && <Effects />}
          <SceneReady />
        </Suspense>
        <CameraRig />
      </Canvas>
      <div className="grain" />
      <Hud />
      <TitleScreen />
      <HowToPlayModal />
      <LoadingScreen skipTitle={SKIP_TITLE} />
    </>
  );
}

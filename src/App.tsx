import { Canvas } from '@react-three/fiber';

export function App() {
  return (
    <Canvas camera={{ position: [0, 25, 21], fov: 26 }}>
      <mesh>
        <boxGeometry />
        <meshNormalMaterial />
      </mesh>
    </Canvas>
  );
}

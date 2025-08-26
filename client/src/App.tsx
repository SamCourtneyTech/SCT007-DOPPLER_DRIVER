import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { KeyboardControls } from "@react-three/drei";
import "@fontsource/inter";
import DrivingGame from "./components/DrivingGame";
import DayNightCycle from "./components/DayNightCycle";

// Define control keys for the driving game
export enum Controls {
  left = 'left',
  right = 'right',
  forward = 'forward',
  back = 'back',
  restart = 'restart',
}

const controls = [
  { name: Controls.left, keys: ['KeyA', 'ArrowLeft'] },
  { name: Controls.right, keys: ['KeyD', 'ArrowRight'] },
  { name: Controls.forward, keys: ['KeyW', 'ArrowUp'] },
  { name: Controls.back, keys: ['KeyS', 'ArrowDown'] },
  { name: Controls.restart, keys: ['KeyR'] },
];

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <KeyboardControls map={controls}>
        <Canvas
          shadows
          camera={{
            position: [0, 8, -12],
            fov: 45,
            near: 0.1,
            far: 1000
          }}
          gl={{
            antialias: true,
            powerPreference: "high-performance"
          }}
        >
          <color attach="background" args={["#87CEEB"]} />
          
          {/* Dynamic Day/Night Lighting */}
          <DayNightCycle />
          
          <Suspense fallback={null}>
            <DrivingGame />
          </Suspense>
        </Canvas>
      </KeyboardControls>
    </div>
  );
}

export default App;

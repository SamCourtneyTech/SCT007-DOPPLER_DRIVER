import React, { useRef, createContext, useContext } from 'react';
import { useFrame } from '@react-three/fiber';
import { useDriving } from '../lib/stores/useDriving';
import * as THREE from 'three';

// Create context for sharing darkness level with cars
const DarknessContext = createContext<number>(1);
export const useDarkness = () => useContext(DarknessContext);

export default function DayNightCycle({ children }: { children?: React.ReactNode }) {
  const { survivalTime, gameState } = useDriving();
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight>(null);
  const sceneRef = useRef<THREE.Scene>(null);
  const [dayFactor, setDayFactor] = React.useState(1);

  useFrame((state) => {
    if (gameState !== 'playing') return;

    // Calculate time progression (2 minutes = 120 seconds = 120000ms)
    const fullNightTime = 120000; // 2 minutes in milliseconds - reach full darkness here
    
    // Calculate lighting values based on survival time
    // Start transitioning immediately, reach full night at 2 minutes
    const newDayFactor = Math.max(0, 1 - (survivalTime / fullNightTime)); // 1 = full day, 0 = full night
    setDayFactor(newDayFactor);

    // Update ambient light intensity (day: 0.6, night: 0.1)
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = 0.1 + (0.5 * newDayFactor);
    }

    // Update directional light intensity and color (day: white, night: bluish)
    if (directionalLightRef.current) {
      directionalLightRef.current.intensity = 0.2 + (0.8 * newDayFactor);
      
      // Color transition: day = white (1,1,1), night = dark blue (0.2,0.3,0.6)
      const dayColor = new THREE.Color(1, 1, 1);
      const nightColor = new THREE.Color(0.2, 0.3, 0.6);
      directionalLightRef.current.color.lerpColors(nightColor, dayColor, newDayFactor);
    }

    // Update background color: day = sky blue, night = dark blue
    if (state.scene.background) {
      const dayBg = new THREE.Color("#87CEEB"); // Sky blue
      const nightBg = new THREE.Color("#0B1426"); // Dark night blue
      const currentBg = new THREE.Color().lerpColors(nightBg, dayBg, newDayFactor);
      (state.scene.background as THREE.Color).copy(currentBg);
    }
  });

  return (
    <DarknessContext.Provider value={1 - dayFactor}>
      {/* Ambient lighting */}
      <ambientLight ref={ambientLightRef} intensity={0.6} />
      
      {/* Directional lighting (sun/moon) */}
      <directionalLight
        ref={directionalLightRef}
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      {children}
    </DarknessContext.Provider>
  );
}
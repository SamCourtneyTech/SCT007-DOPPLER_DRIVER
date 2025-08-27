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

    // Time markers in milliseconds
    const nightTransitionTime = 120000; // 2 minutes - reach full darkness
    const sunriseStartTime = 120000;    // 2 minutes - start sunrise transition
    const sunriseEndTime = 180000;      // 3 minutes - reach full sunrise
    
    let newDayFactor: number;
    
    if (survivalTime <= nightTransitionTime) {
      // Day to night transition (0-2 minutes)
      newDayFactor = Math.max(0, 1 - (survivalTime / nightTransitionTime));
    } else if (survivalTime <= sunriseEndTime) {
      // Night to sunrise transition (2-3 minutes)
      const sunriseProgress = (survivalTime - sunriseStartTime) / (sunriseEndTime - sunriseStartTime);
      newDayFactor = Math.min(1, sunriseProgress); // Gradually brighten from 0 to 1
    } else {
      // Full sunrise (after 3 minutes)
      newDayFactor = 1;
    }
    
    setDayFactor(newDayFactor);

    // Update ambient light intensity
    if (ambientLightRef.current) {
      if (survivalTime > sunriseStartTime && survivalTime <= sunriseEndTime) {
        // During sunrise, use warmer, brighter ambient light
        ambientLightRef.current.intensity = 0.1 + (0.7 * newDayFactor); // Brighter sunrise
      } else {
        ambientLightRef.current.intensity = 0.1 + (0.5 * newDayFactor);
      }
    }

    // Update directional light intensity and color
    if (directionalLightRef.current) {
      if (survivalTime > sunriseStartTime && survivalTime <= sunriseEndTime) {
        // Sunrise lighting - warm orange/yellow colors
        directionalLightRef.current.intensity = 0.2 + (1.0 * newDayFactor); // Brighter during sunrise
        
        const sunriseColor = new THREE.Color(1.0, 0.8, 0.5); // Warm orange-yellow
        const nightColor = new THREE.Color(0.2, 0.3, 0.6);   // Dark blue
        directionalLightRef.current.color.lerpColors(nightColor, sunriseColor, newDayFactor);
      } else {
        // Normal day/night lighting
        directionalLightRef.current.intensity = 0.2 + (0.8 * newDayFactor);
        
        const dayColor = new THREE.Color(1, 1, 1);          // White
        const nightColor = new THREE.Color(0.2, 0.3, 0.6);  // Dark blue
        directionalLightRef.current.color.lerpColors(nightColor, dayColor, newDayFactor);
      }
    }

    // Update background color
    if (state.scene.background) {
      if (survivalTime > sunriseStartTime && survivalTime <= sunriseEndTime) {
        // Sunrise background - warm gradient
        const sunriseBg = new THREE.Color("#FFA500");  // Orange sunrise
        const nightBg = new THREE.Color("#0B1426");    // Dark night blue
        const currentBg = new THREE.Color().lerpColors(nightBg, sunriseBg, newDayFactor);
        (state.scene.background as THREE.Color).copy(currentBg);
      } else {
        // Normal day/night background
        const dayBg = new THREE.Color("#87CEEB");      // Sky blue
        const nightBg = new THREE.Color("#0B1426");    // Dark night blue
        const currentBg = new THREE.Color().lerpColors(nightBg, dayBg, newDayFactor);
        (state.scene.background as THREE.Color).copy(currentBg);
      }
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
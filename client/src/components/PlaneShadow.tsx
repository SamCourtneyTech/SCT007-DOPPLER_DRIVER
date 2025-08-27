import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useDriving } from '../lib/stores/useDriving';
import * as THREE from 'three';

export default function PlaneShadow() {
  const { missileAttacks, gameState } = useDriving();
  const shadowRef = useRef<THREE.Mesh>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const [startTime, setStartTime] = React.useState<number | null>(null);

  // Monitor missile attacks for jet sound timing
  useEffect(() => {
    if (missileAttacks.length === 0) {
      setIsVisible(false);
      setStartTime(null);
      return;
    }

    const missile = missileAttacks[0];
    const currentTime = Date.now();
    const timeElapsed = currentTime - missile.startTime;

    // Start plane shadow animation 3 seconds after jet sound starts
    if (missile.phase === 'warning' && timeElapsed >= 3000 && timeElapsed < 3100) {
      console.log('Starting plane shadow animation');
      setIsVisible(true);
      setStartTime(currentTime);
    }
  }, [missileAttacks]);

  useFrame(() => {
    if (!isVisible || !startTime || !shadowRef.current || gameState !== 'playing') return;

    const elapsed = Date.now() - startTime;
    const duration = 2000; // 2 seconds for plane to cross screen

    if (elapsed > duration) {
      setIsVisible(false);
      setStartTime(null);
      return;
    }

    // Animate plane shadow across screen from right to left
    const progress = elapsed / duration;
    const xPosition = 20 - (progress * 40); // Move from x=20 to x=-20
    
    shadowRef.current.position.set(xPosition, 0.01, 0); // Slightly above ground
    shadowRef.current.visible = true;

    // Scale shadow based on "altitude" - smaller at edges, larger in middle
    const scaleProgress = Math.sin(progress * Math.PI); // 0 to 1 to 0
    const scale = 2 + (scaleProgress * 3); // Scale from 2 to 5 and back
    shadowRef.current.scale.setScalar(scale);

    // Fade shadow opacity
    const opacity = Math.sin(progress * Math.PI) * 0.7; // 0 to 0.7 to 0
    if (shadowRef.current.material instanceof THREE.MeshBasicMaterial) {
      shadowRef.current.material.opacity = opacity;
    }
  });

  if (!isVisible) return null;

  return (
    <group ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      {/* Airplane shadow - fuselage (main body) */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[2.5, 0.4]} />
        <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>
      
      {/* Left Wing - triangular */}
      <mesh position={[0, 1.0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[0.8, 0.1, 3]} />
        <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>
      
      {/* Right Wing - triangular */}
      <mesh position={[0, -1.0, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <coneGeometry args={[0.8, 0.1, 3]} />
        <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>
      
      {/* Tail */}
      <mesh position={[-0.9, 0, 0]}>
        <planeGeometry args={[0.6, 0.8]} />
        <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useDarkness } from './DayNightCycle';
import * as THREE from 'three';

interface PoliceCarProps {
  car: {
    id: string;
    lane: number;
    x: number;
    z: number;
    speed: number;
  };
}

export default function PoliceCar({ car }: PoliceCarProps) {
  const meshRef = useRef<THREE.Group>(null);
  const headlightsRef = useRef<THREE.SpotLight[]>([]);
  const darkness = useDarkness();

  useFrame(() => {
    if (!meshRef.current) return;
    
    // Update car position
    meshRef.current.position.set(car.x, 0.5, car.z);
    
    // Update headlight intensity based on darkness
    headlightsRef.current.forEach(light => {
      if (light) {
        light.intensity = darkness * 15; // Brighter police lights
      }
    });
  });

  return (
    <group ref={meshRef}>
      {/* Police car body - black and white */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.8, 0.8, 3.5]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      
      {/* White police stripes */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[1.9, 0.2, 3.6]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>
      
      {/* Police light bar on top */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.5, 0.2, 0.3]} />
        <meshLambertMaterial color="#ff0000" />
      </mesh>
      
      {/* Wheels */}
      <mesh position={[-0.7, -0.3, 1.2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      <mesh position={[0.7, -0.3, 1.2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      <mesh position={[-0.7, -0.3, -1.2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      <mesh position={[0.7, -0.3, -1.2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial color="#333333" />
      </mesh>

      {/* Headlights */}
      <spotLight
        ref={el => { if (el) headlightsRef.current[0] = el; }}
        position={[-0.6, 0.2, 1.7]}
        angle={0.3}
        penumbra={0.5}
        intensity={darkness * 15}
        distance={25}
        color="#ffffff"
        target-position={[car.x - 0.6, 0, car.z + 10]}
      />
      <spotLight
        ref={el => { if (el) headlightsRef.current[1] = el; }}
        position={[0.6, 0.2, 1.7]}
        angle={0.3}
        penumbra={0.5}
        intensity={darkness * 15}
        distance={25}
        color="#ffffff"
        target-position={[car.x + 0.6, 0, car.z + 10]}
      />

      {/* Headlight meshes */}
      <mesh position={[-0.6, 0.2, 1.7]}>
        <circleGeometry args={[0.15]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.6, 0.2, 1.7]}>
        <circleGeometry args={[0.15]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}
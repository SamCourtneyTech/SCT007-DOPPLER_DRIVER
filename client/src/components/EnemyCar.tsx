import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EnemyCar as EnemyCarType } from '../lib/stores/useDriving';
import { useDarkness } from './DayNightCycle';

interface EnemyCarProps {
  enemy: EnemyCarType;
}

export default function EnemyCar({ enemy }: EnemyCarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const darkness = useDarkness();

  useFrame(() => {
    if (!meshRef.current) return;
    
    // Update position from store data
    meshRef.current.position.set(enemy.x, 0.6, enemy.z);
  });

  // Different colors for different lanes
  const colors = ['#4444ff', '#44ff44', '#ffaa44'];
  const color = colors[enemy.lane] || '#888888';

  return (
    <mesh ref={meshRef} position={[enemy.x, 0.6, enemy.z]} castShadow>
      {/* Enemy car body */}
      <boxGeometry args={[1.4, 0.7, 2.8]} />
      <meshLambertMaterial color={color} />
      
      {/* Car details */}
      <mesh position={[0, 0.25, -0.6]}>
        <boxGeometry args={[1.1, 0.3, 0.8]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      
      {/* Wheels - rotated 90 degrees (45 + 22.5 + 22.5 to the right) */}
      <mesh position={[-0.7, -0.25, 0.8]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 0.15]} />
        <meshLambertMaterial color="#222222" />
      </mesh>
      <mesh position={[0.7, -0.25, 0.8]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 0.15]} />
        <meshLambertMaterial color="#222222" />
      </mesh>
      <mesh position={[-0.7, -0.25, -0.8]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 0.15]} />
        <meshLambertMaterial color="#222222" />
      </mesh>
      <mesh position={[0.7, -0.25, -0.8]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.25, 0.25, 0.15]} />
        <meshLambertMaterial color="#222222" />
      </mesh>

      {/* Headlights - always on, brighter at night */}
      <mesh position={[-0.4, 0.15, 1.5]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff"
          emissiveIntensity={darkness > 0.3 ? 0.7 : 0.25}
        />
      </mesh>
      <mesh position={[0.4, 0.15, 1.5]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff"
          emissiveIntensity={darkness > 0.3 ? 0.7 : 0.25}
        />
      </mesh>
      
      {/* Headlight beams for approaching enemies - always on, stronger at night */}
      <spotLight
        position={[-0.4, 0.15, 1.5]}
        target-position={[-2, 0, 10]}
        angle={0.25}
        penumbra={0.1}
        intensity={darkness > 0.3 ? 1.0 : 0.3}
        distance={15}
        color="#ffffff"
      />
      <spotLight
        position={[0.4, 0.15, 1.5]}
        target-position={[2, 0, 10]}
        angle={0.25}
        penumbra={0.1}
        intensity={darkness > 0.3 ? 1.0 : 0.3}
        distance={15}
        color="#ffffff"
      />

      {/* Brake lights - always visible but more prominent at night */}
      <mesh position={[-0.5, 0.25, -1.5]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000"
          emissiveIntensity={darkness > 0.3 ? 0.5 : 0.15}
        />
      </mesh>
      <mesh position={[0.5, 0.25, -1.5]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000"
          emissiveIntensity={darkness > 0.3 ? 0.5 : 0.15}
        />
      </mesh>
    </mesh>
  );
}

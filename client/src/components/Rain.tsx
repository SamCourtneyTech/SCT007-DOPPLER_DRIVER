import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RainProps {
  intensity?: number;
  dropCount?: number;
}

export default function Rain({ intensity = 1, dropCount = 1000 }: RainProps) {
  const rainRef = useRef<THREE.Points>(null);
  
  // Create rain drops geometry and material
  const { geometry, material } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(dropCount * 3);
    const velocities = new Float32Array(dropCount);
    
    // Initialize rain drops
    for (let i = 0; i < dropCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200; // x
      positions[i * 3 + 1] = Math.random() * 100 + 20; // y (start high)
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200; // z
      velocities[i] = Math.random() * 0.5 + 0.5; // fall speed
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));
    
    const mat = new THREE.PointsMaterial({
      color: 0x87CEEB, // Sky blue color for rain
      size: 0.1,
      transparent: true,
      opacity: 0.6
    });
    
    return { geometry: geo, material: mat };
  }, [dropCount]);
  
  // Animate rain drops
  useFrame((state, delta) => {
    if (!rainRef.current) return;
    
    const positions = rainRef.current.geometry.attributes.position.array as Float32Array;
    const velocities = rainRef.current.geometry.attributes.velocity.array as Float32Array;
    
    for (let i = 0; i < dropCount; i++) {
      // Move rain drop down
      positions[i * 3 + 1] -= velocities[i] * intensity * 50 * delta;
      
      // Reset to top when it hits the ground
      if (positions[i * 3 + 1] < -5) {
        positions[i * 3 + 1] = Math.random() * 50 + 50;
        positions[i * 3] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
      }
    }
    
    rainRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  return <points ref={rainRef} geometry={geometry} material={material} />;
}
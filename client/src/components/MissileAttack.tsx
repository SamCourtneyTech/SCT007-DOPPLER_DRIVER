import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MissileAttack as MissileAttackType } from '../lib/stores/useDriving';

interface MissileAttackProps {
  missile: MissileAttackType;
}

export default function MissileAttack({ missile }: MissileAttackProps) {
  const missileRef = useRef<THREE.Group>(null);
  const explosionRef = useRef<THREE.Group>(null);
  
  const lanePositions = [-4, 0, 4];
  const targetX = lanePositions[missile.targetLane];
  
  useFrame(() => {
    const timeElapsed = Date.now() - missile.startTime;
    
    if (missile.phase === 'impact' && explosionRef.current) {
      // Show explosion effect - stays on road and moves backward
      const explosionAge = timeElapsed - 23000; // Time since impact
      if (explosionAge > 0 && explosionAge < 3000) {
        const progress = explosionAge / 3000;
        const scale = Math.max(0.2, 2.5 - progress * 2); // Start big, shrink over time
        
        // Explosion stays on the road and moves backward with traffic
        const roadSpeed = 0.05; // Match enemy car speed
        const explosionZ = 5 - (explosionAge * roadSpeed); // Move backward down the road
        
        explosionRef.current.position.set(targetX, 0.5, explosionZ);
        explosionRef.current.scale.setScalar(scale);
        explosionRef.current.visible = true;
      } else {
        explosionRef.current.visible = false;
      }
    }
    
    if (missile.phase === 'incoming' && missileRef.current) {
      // Show incoming missile - delayed by 6 seconds
      const missileAge = timeElapsed - 22000; // Start dropping 6 seconds later (22s instead of 16s)
      if (missileAge > 0 && missileAge < 1150) {
        // Missile falls from sky over 1.15 seconds (double as fast again)
        const progress = missileAge / 1150;
        const y = 50 - (progress * 50); // Fall straight down from sky
        const z = 5; // Slightly farther back than before (was 10)
        
        missileRef.current.position.set(targetX, y, z);
        missileRef.current.visible = true;
        
        // No rotation - missile falls straight down like a real missile
      } else {
        missileRef.current.visible = false;
      }
    }
  });

  return (
    <group>
      {/* Incoming missile */}
      <group ref={missileRef} visible={false} rotation={[0, 0, Math.PI]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.3, 2]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
        <mesh position={[0, 1, 0]}>
          <coneGeometry args={[0.15, 0.5]} />
          <meshStandardMaterial color="#ff4444" />
        </mesh>
        {/* Smoke trail */}
        <mesh position={[0, -2, 0]}>
          <cylinderGeometry args={[0.5, 0.1, 3]} />
          <meshStandardMaterial 
            color="#666666" 
            transparent 
            opacity={0.3}
          />
        </mesh>
      </group>

      {/* Explosion effect */}
      <group ref={explosionRef} position={[targetX, 0, 5]} visible={false}>
        {/* Core blast - bright white hot center */}
        <mesh>
          <sphereGeometry args={[0.8, 12, 12]} />
          <meshStandardMaterial 
            color="#ffffff" 
            emissive="#ffffff"
            emissiveIntensity={2}
            transparent
            opacity={0.9}
          />
        </mesh>
        {/* Inner fire ball - orange */}
        <mesh scale={1.8}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial 
            color="#ff4400" 
            emissive="#ff6600"
            emissiveIntensity={1.5}
            transparent
            opacity={0.7}
          />
        </mesh>
        {/* Outer fire - red/orange */}
        <mesh scale={2.5}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial 
            color="#ff0000" 
            emissive="#ff3300"
            emissiveIntensity={1}
            transparent
            opacity={0.5}
          />
        </mesh>
        {/* Dark smoke cloud */}
        <mesh scale={3} position={[0, 2, 0]}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshStandardMaterial 
            color="#333333" 
            transparent
            opacity={0.6}
          />
        </mesh>
        {/* Debris particles */}
        <mesh scale={0.5} position={[1, 0.5, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
        <mesh scale={0.4} position={[-0.8, 0.3, 0.5]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
        <mesh scale={0.3} position={[0.5, 1, -0.5]}>
          <boxGeometry args={[0.25, 0.25, 0.25]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
      </group>

{/* Warning indicator removed - no visual indication of target lane */}
    </group>
  );
}
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
      // Show explosion effect
      const explosionAge = timeElapsed - 24000; // Time since impact
      if (explosionAge > 0 && explosionAge < 2000) {
        // Scale explosion based on age
        const scale = Math.min(3, explosionAge / 1000 * 3);
        explosionRef.current.scale.setScalar(scale);
        explosionRef.current.visible = true;
      } else {
        explosionRef.current.visible = false;
      }
    }
    
    if (missile.phase === 'incoming' && missileRef.current) {
      // Show incoming missile
      const missileAge = timeElapsed - 16000; // Time since missile phase started
      if (missileAge > 0 && missileAge < 6000) {
        // Missile falls from sky over 6 seconds
        const progress = missileAge / 6000;
        const y = 50 - (progress * 50); // Fall from sky
        const z = -5; // Slightly in front of player
        
        missileRef.current.position.set(targetX, y, z);
        missileRef.current.visible = true;
        
        // Add rotation for visual effect
        missileRef.current.rotation.z = progress * Math.PI * 2;
      } else {
        missileRef.current.visible = false;
      }
    }
  });

  return (
    <group>
      {/* Incoming missile */}
      <group ref={missileRef} visible={false}>
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
      <group ref={explosionRef} position={[targetX, 0, -5]} visible={false}>
        <mesh>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial 
            color="#ff8800" 
            emissive="#ff4400"
            emissiveIntensity={1}
            transparent
            opacity={0.8}
          />
        </mesh>
        <mesh scale={1.5}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial 
            color="#ffff00" 
            emissive="#ff8800"
            emissiveIntensity={0.8}
            transparent
            opacity={0.6}
          />
        </mesh>
        {/* Smoke */}
        <mesh scale={2} position={[0, 1, 0]}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshStandardMaterial 
            color="#444444" 
            transparent
            opacity={0.4}
          />
        </mesh>
      </group>

{/* Warning indicator removed - no visual indication of target lane */}
    </group>
  );
}
import React from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export default function Road() {
  const asphaltTexture = useTexture('/textures/asphalt.png');
  const grassTexture = useTexture('/textures/grass.png');

  // Configure texture repeating
  asphaltTexture.wrapS = asphaltTexture.wrapT = THREE.RepeatWrapping;
  asphaltTexture.repeat.set(2, 20);
  
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(4, 20);

  return (
    <>
      {/* Main road */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 100]} />
        <meshLambertMaterial map={asphaltTexture} />
      </mesh>

      {/* Road markings - center lines */}
      <mesh position={[-2, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.2, 100]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>
      
      <mesh position={[2, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.2, 100]} />
        <meshLambertMaterial color="#ffffff" />
      </mesh>

      {/* Road edges */}
      <mesh position={[-6, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.3, 100]} />
        <meshLambertMaterial color="#ffff00" />
      </mesh>
      
      <mesh position={[6, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.3, 100]} />
        <meshLambertMaterial color="#ffff00" />
      </mesh>

      {/* Grass on sides */}
      <mesh position={[-15, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 100]} />
        <meshLambertMaterial map={grassTexture} />
      </mesh>
      
      <mesh position={[15, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 100]} />
        <meshLambertMaterial map={grassTexture} />
      </mesh>
    </>
  );
}

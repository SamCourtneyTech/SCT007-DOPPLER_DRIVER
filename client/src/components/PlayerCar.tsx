import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { Controls } from '../App';
import { useDriving } from '../lib/stores/useDriving';
import { useDarkness } from './DayNightCycle';

export default function PlayerCar() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { playerLane, playerZ, setPlayerLane, setPlayerZ, gameState } = useDriving();
  const [subscribe] = useKeyboardControls<Controls>();
  const darkness = useDarkness();

  // Lane positions: -4 (left), 0 (center), 4 (right)
  const lanePositions = [-4, 0, 4];
  const targetX = lanePositions[playerLane];

  // Handle keyboard input
  useEffect(() => {
    if (gameState !== 'playing') return;

    const unsubscribeLeft = subscribe(
      state => state.left,
      pressed => {
        if (pressed && playerLane < 2) {
          const newLane = playerLane + 1;
          setPlayerLane(newLane);
          const position = lanePositions[newLane];
          console.log(`A/LEFT ARROW pressed: moved to lane ${newLane} at position ${position} (MOVING RIGHT)`);
        }
      }
    );

    const unsubscribeRight = subscribe(
      state => state.right,
      pressed => {
        if (pressed && playerLane > 0) {
          const newLane = playerLane - 1;
          setPlayerLane(newLane);
          const position = lanePositions[newLane];
          console.log(`D/RIGHT ARROW pressed: moved to lane ${newLane} at position ${position} (MOVING LEFT)`);
        }
      }
    );

    const unsubscribeForward = subscribe(
      state => state.forward,
      pressed => {
        if (pressed) {
          const newZ = playerZ + 0.5; // Move forward
          setPlayerZ(newZ);
          console.log(`W/UP ARROW pressed: moved forward to Z position ${newZ.toFixed(1)} (RISKY!)`);
        }
      }
    );

    const unsubscribeBack = subscribe(
      state => state.back,
      pressed => {
        if (pressed) {
          const newZ = playerZ - 0.5; // Move backward
          setPlayerZ(newZ);
          console.log(`S/DOWN ARROW pressed: moved backward to Z position ${newZ.toFixed(1)} (SAFER!)`);
        }
      }
    );

    return () => {
      unsubscribeLeft();
      unsubscribeRight();
      unsubscribeForward();
      unsubscribeBack();
    };
  }, [playerLane, playerZ, setPlayerLane, setPlayerZ, gameState, subscribe]);

  // Smooth lane switching animation
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Smoothly move to target lane position
    const currentX = meshRef.current.position.x;
    const diff = targetX - currentX;
    if (Math.abs(diff) > 0.01) {
      meshRef.current.position.x += diff * 8 * delta; // Smooth interpolation
    }

    // Add slight bobbing motion
    meshRef.current.position.y = 0.6 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
  });

  if (gameState === 'ready') return null;

  return (
    <mesh ref={meshRef} position={[0, 0.6, playerZ]} castShadow>
      {/* Player car body */}
      <boxGeometry args={[1.5, 0.8, 3]} />
      <meshLambertMaterial color="#ff4444" />
      
      {/* Car details */}
      <mesh position={[0, 0.3, 0.8]}>
        <boxGeometry args={[1.2, 0.4, 1]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      
      {/* Wheels - rotated 90 degrees (45 + 22.5 + 22.5 to the right) */}
      <mesh position={[-0.8, -0.3, 1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial color="#222222" />
      </mesh>
      <mesh position={[0.8, -0.3, 1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial color="#222222" />
      </mesh>
      <mesh position={[-0.8, -0.3, -1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial color="#222222" />
      </mesh>
      <mesh position={[0.8, -0.3, -1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial color="#222222" />
      </mesh>

      {/* Headlights - only visible when dark enough */}
      {darkness > 0.3 && (
        <>
          <mesh position={[-0.5, 0.2, 1.6]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial 
              color="#ffffff" 
              emissive="#ffffff"
              emissiveIntensity={0.8}
            />
          </mesh>
          <mesh position={[0.5, 0.2, 1.6]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial 
              color="#ffffff" 
              emissive="#ffffff"
              emissiveIntensity={0.8}
            />
          </mesh>
          
          {/* Headlight beams */}
          <spotLight
            position={[-0.5, 0.2, 1.6]}
            target-position={[-2, 0, 10]}
            angle={0.3}
            penumbra={0.1}
            intensity={1}
            distance={20}
            color="#ffffff"
          />
          <spotLight
            position={[0.5, 0.2, 1.6]}
            target-position={[2, 0, 10]}
            angle={0.3}
            penumbra={0.1}
            intensity={1}
            distance={20}
            color="#ffffff"
          />
        </>
      )}

      {/* Brake lights - always visible but more prominent at night */}
      <mesh position={[-0.6, 0.3, -1.6]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000"
          emissiveIntensity={darkness > 0.3 ? 0.6 : 0.2}
        />
      </mesh>
      <mesh position={[0.6, 0.3, -1.6]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000"
          emissiveIntensity={darkness > 0.3 ? 0.6 : 0.2}
        />
      </mesh>
    </mesh>
  );
}

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { Controls } from '../App';
import { useDriving } from '../lib/stores/useDriving';

export default function PlayerCar() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { playerLane, setPlayerLane, gameState } = useDriving();
  const [subscribe] = useKeyboardControls<Controls>();

  // Lane positions: -4 (left), 0 (center), 4 (right)
  const lanePositions = [-4, 0, 4];
  const targetX = lanePositions[playerLane];

  // Handle keyboard input
  useEffect(() => {
    if (gameState !== 'playing') return;

    const unsubscribeLeft = subscribe(
      state => state.left,
      pressed => {
        if (pressed && playerLane > 0) {
          setPlayerLane(playerLane - 1);
          console.log(`Switched to lane ${playerLane - 1} (LEFT)`);
        }
      }
    );

    const unsubscribeRight = subscribe(
      state => state.right,
      pressed => {
        if (pressed && playerLane < 2) {
          setPlayerLane(playerLane + 1);
          console.log(`Switched to lane ${playerLane + 1} (RIGHT)`);
        }
      }
    );

    return () => {
      unsubscribeLeft();
      unsubscribeRight();
    };
  }, [playerLane, setPlayerLane, gameState, subscribe]);

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
    <mesh ref={meshRef} position={[0, 0.6, -8]} castShadow>
      {/* Player car body */}
      <boxGeometry args={[1.5, 0.8, 3]} />
      <meshLambertMaterial color="#ff4444" />
      
      {/* Car details */}
      <mesh position={[0, 0.3, 0.8]}>
        <boxGeometry args={[1.2, 0.4, 1]} />
        <meshLambertMaterial color="#333333" />
      </mesh>
      
      {/* Wheels */}
      <mesh position={[-0.8, -0.3, 1]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial color="#222222" />
      </mesh>
      <mesh position={[0.8, -0.3, 1]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial color="#222222" />
      </mesh>
      <mesh position={[-0.8, -0.3, -1]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial color="#222222" />
      </mesh>
      <mesh position={[0.8, -0.3, -1]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial color="#222222" />
      </mesh>
    </mesh>
  );
}

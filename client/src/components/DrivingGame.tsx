import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useDriving } from '../lib/stores/useDriving';
import { useAudio } from '../lib/stores/useAudio';
import PlayerCar from './PlayerCar';
import EnemyCar from './EnemyCar';
import Road from './Road';
import GameUI from './GameUI';
import AudioManager from './AudioManager';
import MissileAttack from './MissileAttack';
import PoliceCar from './PoliceCar';

export default function DrivingGame() {
  const { 
    gameState, 
    survivalTime, 
    enemyCars, 
    missileAttacks,
    policeCars,
    cameraShake,
    spawnEnemy, 
    updateEnemies, 
    checkCollisions,
    updateSurvivalTime,
    gameOver,
    triggerMissileAttack,
    updateMissileAttacks,
    updatePoliceCars,
    triggerPoliceChase,
    updatePoliceChase
  } = useDriving();

  const lastSpawnTime = useRef(0);
  const gameStartTime = useRef(Date.now());

  // Game loop
  useFrame((state, delta) => {
    if (gameState !== 'playing') return;

    const now = Date.now();
    
    // Update survival time
    updateSurvivalTime(now - gameStartTime.current);

    // Spawn enemies periodically
    const timeSinceLastSpawn = now - lastSpawnTime.current;
    const spawnInterval = 1500; // Constant spawn rate for consistent audio timing

    if (timeSinceLastSpawn > spawnInterval) {
      spawnEnemy();
      lastSpawnTime.current = now;
    }

    // Update enemy positions
    updateEnemies(delta);

    // Check for collisions
    checkCollisions();

    // Handle missile attacks
    triggerMissileAttack(now);
    updateMissileAttacks(now);
    
    // Handle police chase
    triggerPoliceChase(now);
    updatePoliceChase(now);
    updatePoliceCars(delta);
  });

  // Reset game start time when game starts
  useEffect(() => {
    if (gameState === 'playing') {
      gameStartTime.current = Date.now();
    }
  }, [gameState]);

  return (
    <>
      <Road />
      <group position={[0, 0, 0]} rotation={[cameraShake * 0.02, cameraShake * 0.01, 0]}>
        <PlayerCar />
        {enemyCars.map(enemy => (
          <EnemyCar key={enemy.id} enemy={enemy} />
        ))}
        {policeCars.map(police => (
          <PoliceCar key={police.id} car={police} />
        ))}
        {missileAttacks.map(missile => (
          <MissileAttack key={missile.id} missile={missile} />
        ))}
      </group>
      <AudioManager />
      <GameUI />
    </>
  );
}

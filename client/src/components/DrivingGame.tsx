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
import Rain from './Rain';

export default function DrivingGame() {
  const { 
    gameState, 
    survivalTime, 
    enemyCars, 
    missileAttacks,
    policeCars,
    cameraShake,
    showRain,
    spawnEnemy, 
    updateEnemies, 
    checkCollisions,
    updateSurvivalTime,
    gameOver,
    triggerMissileAttack,
    updateMissileAttacks,
    updatePoliceCars,
    triggerPoliceChase,
    updatePoliceChase,
    checkLevel2Display,
    checkRainStart
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
    
    // Check for Level 2 display
    checkLevel2Display(now);
    
    // Check for rain start
    checkRainStart(now);
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
      
      {/* Rain effect */}
      {showRain && <Rain intensity={1.2} dropCount={800} />}
      
      <AudioManager />
      <GameUI />
    </>
  );
}

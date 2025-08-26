import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useDriving } from '../lib/stores/useDriving';
import { useAudio } from '../lib/stores/useAudio';
import PlayerCar from './PlayerCar';
import EnemyCar from './EnemyCar';
import Road from './Road';
import GameUI from './GameUI';
import AudioManager from './AudioManager';

export default function DrivingGame() {
  const { 
    gameState, 
    survivalTime, 
    enemyCars, 
    spawnEnemy, 
    updateEnemies, 
    checkCollisions,
    updateSurvivalTime,
    gameOver 
  } = useDriving();

  const lastSpawnTime = useRef(0);
  const gameStartTime = useRef(Date.now());

  // Game loop
  useFrame((state, delta) => {
    if (gameState !== 'playing') return;

    // Update survival time
    updateSurvivalTime(Date.now() - gameStartTime.current);

    // Spawn enemies periodically
    const now = Date.now();
    const timeSinceLastSpawn = now - lastSpawnTime.current;
    const spawnInterval = Math.max(2000 - (survivalTime * 10), 800); // Spawn more frequently over time

    if (timeSinceLastSpawn > spawnInterval) {
      spawnEnemy();
      lastSpawnTime.current = now;
    }

    // Update enemy positions
    updateEnemies(delta);

    // Check for collisions
    checkCollisions();
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
      <AudioManager />
      <GameUI />
    </>
  );
}

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type GameState = 'ready' | 'playing' | 'ended';

export interface EnemyCar {
  id: string;
  lane: number; // 0, 1, or 2
  x: number;
  z: number;
  speed: number;
}

interface DrivingState {
  gameState: GameState;
  playerLane: number; // 0 = left, 1 = center, 2 = right
  survivalTime: number;
  enemyCars: EnemyCar[];
  
  // Actions
  startGame: () => void;
  resetGame: () => void;
  gameOver: () => void;
  setPlayerLane: (lane: number) => void;
  updateSurvivalTime: (time: number) => void;
  spawnEnemy: () => void;
  updateEnemies: (delta: number) => void;
  checkCollisions: () => void;
}

export const useDriving = create<DrivingState>()(
  subscribeWithSelector((set, get) => ({
    gameState: 'ready',
    playerLane: 1, // Start in center lane
    survivalTime: 0,
    enemyCars: [],
    
    startGame: () => {
      console.log('Game started');
      set({
        gameState: 'playing',
        survivalTime: 0,
        enemyCars: [],
        playerLane: 1
      });
    },
    
    resetGame: () => {
      console.log('Game reset');
      set({
        gameState: 'ready',
        survivalTime: 0,
        enemyCars: [],
        playerLane: 1
      });
    },
    
    gameOver: () => {
      console.log('Game over - crashed!');
      set({ gameState: 'ended' });
    },
    
    setPlayerLane: (lane: number) => {
      set({ playerLane: Math.max(0, Math.min(2, lane)) });
    },
    
    updateSurvivalTime: (time: number) => {
      set({ survivalTime: time });
    },
    
    spawnEnemy: () => {
      const { enemyCars, survivalTime } = get();
      
      // Random lane selection
      const lane = Math.floor(Math.random() * 3);
      
      // Lane positions: -4 (left), 0 (center), 4 (right)
      const lanePositions = [-4, 0, 4];
      
      const newEnemy: EnemyCar = {
        id: `enemy_${Date.now()}_${Math.random()}`,
        lane,
        x: lanePositions[lane],
        z: 50, // Start far ahead
        speed: 15 + (survivalTime / 1000) * 2 // Speed increases over time
      };
      
      console.log(`Spawned enemy in lane ${lane} at position ${newEnemy.x}, ${newEnemy.z}`);
      
      set({
        enemyCars: [...enemyCars, newEnemy]
      });
    },
    
    updateEnemies: (delta: number) => {
      const { enemyCars } = get();
      
      const updatedEnemies = enemyCars
        .map(enemy => ({
          ...enemy,
          z: enemy.z - enemy.speed * delta // Move towards player
        }))
        .filter(enemy => enemy.z > -50); // Remove enemies that passed the player
      
      set({ enemyCars: updatedEnemies });
    },
    
    checkCollisions: () => {
      const { enemyCars, playerLane, gameState } = get();
      
      if (gameState !== 'playing') return;
      
      const lanePositions = [-4, 0, 4];
      const playerX = lanePositions[playerLane];
      const playerZ = -8; // Player's fixed Z position
      
      // Check collision with each enemy
      for (const enemy of enemyCars) {
        const distanceX = Math.abs(enemy.x - playerX);
        const distanceZ = Math.abs(enemy.z - playerZ);
        
        // Simple collision detection - if enemy is close enough to player
        if (distanceX < 1.5 && distanceZ < 2.5) {
          console.log(`Collision detected! Enemy at ${enemy.x}, ${enemy.z} vs Player at ${playerX}, ${playerZ}`);
          get().gameOver();
          break;
        }
      }
    }
  }))
);

// Handle restart key
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyR') {
      const { gameState, resetGame } = useDriving.getState();
      if (gameState === 'ended') {
        resetGame();
      }
    }
  });
}

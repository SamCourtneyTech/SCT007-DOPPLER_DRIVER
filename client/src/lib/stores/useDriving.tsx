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

export interface MissileAttack {
  id: string;
  targetLane: number;
  startTime: number;
  phase: 'warning' | 'incoming' | 'impact'; // warning = jet sound, incoming = missile sound, impact = hit
}

interface DrivingState {
  gameState: GameState;
  playerLane: number; // 0 = left, 1 = center, 2 = right
  playerZ: number; // Player's forward/backward position
  survivalTime: number;
  enemyCars: EnemyCar[];
  missileAttacks: MissileAttack[];
  lastMissileTime: number;
  
  // Actions
  startGame: () => void;
  resetGame: () => void;
  gameOver: () => void;
  setPlayerLane: (lane: number) => void;
  setPlayerZ: (z: number) => void;
  updateSurvivalTime: (time: number) => void;
  spawnEnemy: () => void;
  updateEnemies: (delta: number) => void;
  checkCollisions: () => void;
  updateMissileAttacks: (currentTime: number) => void;
  triggerMissileAttack: (currentTime: number) => void;
}

export const useDriving = create<DrivingState>()(
  subscribeWithSelector((set, get) => ({
    gameState: 'ready',
    playerLane: 1, // Start in center lane
    playerZ: -8, // Starting Z position
    survivalTime: 0,
    enemyCars: [],
    missileAttacks: [],
    lastMissileTime: 0,
    
    startGame: () => {
      console.log('Game started');
      set({
        gameState: 'playing',
        survivalTime: 0,
        enemyCars: [],
        missileAttacks: [],
        lastMissileTime: 0,
        playerLane: 1,
        playerZ: -8
      });
    },
    
    resetGame: () => {
      console.log('Game reset');
      set({
        gameState: 'ready',
        survivalTime: 0,
        enemyCars: [],
        missileAttacks: [],
        lastMissileTime: 0,
        playerLane: 1,
        playerZ: -8
      });
    },
    
    gameOver: () => {
      console.log('Game over - crashed!');
      set({ gameState: 'ended' });
    },
    
    setPlayerLane: (lane: number) => {
      set({ playerLane: Math.max(0, Math.min(2, lane)) });
    },
    
    setPlayerZ: (z: number) => {
      set({ playerZ: Math.max(-15, Math.min(10, z)) }); // Limit forward movement
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
        speed: 25 // Faster constant speed
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
      const { enemyCars, playerLane, playerZ, gameState } = get();
      
      if (gameState !== 'playing') return;
      
      const lanePositions = [-4, 0, 4];
      const playerX = lanePositions[playerLane];
      
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
    },

    triggerMissileAttack: (currentTime: number) => {
      const { lastMissileTime, missileAttacks } = get();
      
      // Don't trigger if there's already an active missile or one was triggered recently
      if (missileAttacks.length > 0 || currentTime - lastMissileTime < 30000) return;
      
      // Random chance to trigger (increased for testing - normally would be 0.001 for ~2-3 minutes)
      if (Math.random() < 0.005) { // 0.5% chance per frame check (about every 10-20 seconds for testing)
        const targetLane = Math.floor(Math.random() * 3);
        const newMissile: MissileAttack = {
          id: `missile_${Date.now()}`,
          targetLane,
          startTime: currentTime,
          phase: 'warning'
        };
        
        console.log(`Missile attack triggered! Target lane: ${targetLane}`);
        set({ 
          missileAttacks: [newMissile],
          lastMissileTime: currentTime
        });
      }
    },

    updateMissileAttacks: (currentTime: number) => {
      const { missileAttacks, playerLane, gameState } = get();
      
      if (gameState !== 'playing' || missileAttacks.length === 0) return;
      
      const updatedMissiles = missileAttacks.map(missile => {
        const timeElapsed = currentTime - missile.startTime;
        
        // Phase transitions based on timing
        if (timeElapsed >= 23000 && missile.phase !== 'impact') {
          // 23 seconds: Impact
          console.log(`Missile impact in lane ${missile.targetLane}!`);
          
          // Check if player is in the target lane
          if (playerLane === missile.targetLane) {
            console.log('Player hit by missile!');
            get().gameOver();
          }
          
          return { ...missile, phase: 'impact' as const };
        } else if (timeElapsed >= 16000 && missile.phase === 'warning') {
          // 16 seconds: Missile incoming sound
          console.log(`Missile incoming for lane ${missile.targetLane}!`);
          return { ...missile, phase: 'incoming' as const };
        }
        
        return missile;
      }).filter(missile => {
        const timeElapsed = currentTime - missile.startTime;
        return timeElapsed < 25000; // Remove missile after 25 seconds
      });
      
      set({ missileAttacks: updatedMissiles });
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

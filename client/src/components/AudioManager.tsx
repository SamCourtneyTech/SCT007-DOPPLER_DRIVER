import React, { useEffect, useRef } from 'react';
import { useDriving } from '../lib/stores/useDriving';
import { useAudio } from '../lib/stores/useAudio';

interface ActiveSound {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  pannerNode?: StereoPannerNode | null; // Optional since we're not using it anymore
  lane: number;
  startTime: number;
}

export default function AudioManager() {
  const { enemyCars, gameState } = useDriving();
  const { isMuted } = useAudio();
  const audioContextRef = useRef<AudioContext | null>(null);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const hornBufferRef = useRef<AudioBuffer | null>(null);
  const centerHornBuffersRef = useRef<{
    center1: AudioBuffer | null;
    center2: AudioBuffer | null;
    center3: AudioBuffer | null;
  }>({ center1: null, center2: null, center3: null });
  const rightHornBuffersRef = useRef<{
    right1: AudioBuffer | null;
    right2: AudioBuffer | null;
    right3: AudioBuffer | null;
  }>({ right1: null, right2: null, right3: null });
  const leftHornBuffersRef = useRef<{
    left1: AudioBuffer | null;
    left2: AudioBuffer | null;
    left3: AudioBuffer | null;
  }>({ left1: null, left2: null, left3: null });
  const activeSoundsRef = useRef<Map<number, ActiveSound>>(new Map());
  const lastHonkTimeRef = useRef<Map<number, number>>(new Map());
  const previousCarPositionsRef = useRef<Map<string, number>>(new Map());

  // Initialize audio context and load sounds
  useEffect(() => {
    // Initialize audio context
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Load background music
    backgroundMusicRef.current = new Audio('/sounds/background.mp3');
    backgroundMusicRef.current.loop = true;
    backgroundMusicRef.current.volume = 0.3;

    // Load horn sound as AudioBuffer for better control
    const loadHornSound = async () => {
      try {
        const response = await fetch('/sounds/horn.mp3');
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
        hornBufferRef.current = audioBuffer;
      } catch (error) {
        console.log('Failed to load horn sound:', error);
      }
    };

    // Load center, right, and left lane horn sounds with different variations
    const loadVariationHornSounds = async () => {
      try {
        // Load center lane sounds
        const centerFiles = [
          'CarHonkCenter1_1756176216637.mp3',
          'CarHonkCenter2_1756176259131.mp3', 
          'CarHonkCenter3_1756176284108.mp3'
        ];
        
        // Load right lane sounds
        const rightFiles = [
          'CarHonkRight1_1756176347426.mp3',
          'CarHonkRight2_1756176405172.mp3',
          'CarHonkRight3_1756176414004.mp3'
        ];

        // Load left lane sounds
        const leftFiles = [
          'CarHonkLeft1_1756176442069.mp3',
          'CarHonkLeft2_1756176448244.mp3',
          'CarHonkLeft3_1756176457203.mp3'
        ];

        // Load center lane sounds
        for (let i = 0; i < centerFiles.length; i++) {
          console.log(`Loading center sound ${i + 1}: ${centerFiles[i]}`);
          const response = await fetch(`/attached_assets/${centerFiles[i]}`);
          
          if (!response.ok) {
            console.error(`Failed to fetch ${centerFiles[i]}: ${response.status} ${response.statusText}`);
            continue;
          }
          
          const arrayBuffer = await response.arrayBuffer();
          console.log(`Center sound ${i + 1} buffer size:`, arrayBuffer.byteLength);
          const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
          
          if (i === 0) centerHornBuffersRef.current.center1 = audioBuffer;
          else if (i === 1) centerHornBuffersRef.current.center2 = audioBuffer;
          else centerHornBuffersRef.current.center3 = audioBuffer;
          
          console.log(`Center sound ${i + 1} loaded successfully`);
        }

        // Load right lane sounds
        for (let i = 0; i < rightFiles.length; i++) {
          console.log(`Loading right sound ${i + 1}: ${rightFiles[i]}`);
          const response = await fetch(`/attached_assets/${rightFiles[i]}`);
          
          if (!response.ok) {
            console.error(`Failed to fetch ${rightFiles[i]}: ${response.status} ${response.statusText}`);
            continue;
          }
          
          const arrayBuffer = await response.arrayBuffer();
          console.log(`Right sound ${i + 1} buffer size:`, arrayBuffer.byteLength);
          const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
          
          if (i === 0) rightHornBuffersRef.current.right1 = audioBuffer;
          else if (i === 1) rightHornBuffersRef.current.right2 = audioBuffer;
          else rightHornBuffersRef.current.right3 = audioBuffer;
          
          console.log(`Right sound ${i + 1} loaded successfully`);
        }

        // Load left lane sounds
        for (let i = 0; i < leftFiles.length; i++) {
          console.log(`Loading left sound ${i + 1}: ${leftFiles[i]}`);
          const response = await fetch(`/attached_assets/${leftFiles[i]}`);
          
          if (!response.ok) {
            console.error(`Failed to fetch ${leftFiles[i]}: ${response.status} ${response.statusText}`);
            continue;
          }
          
          const arrayBuffer = await response.arrayBuffer();
          console.log(`Left sound ${i + 1} buffer size:`, arrayBuffer.byteLength);
          const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
          
          if (i === 0) leftHornBuffersRef.current.left1 = audioBuffer;
          else if (i === 1) leftHornBuffersRef.current.left2 = audioBuffer;
          else leftHornBuffersRef.current.left3 = audioBuffer;
          
          console.log(`Left sound ${i + 1} loaded successfully`);
        }

        console.log('Center, right, and left horn sound variations loaded successfully');
      } catch (error) {
        console.log('Failed to load horn sound variations:', error);
      }
    };

    loadHornSound();
    loadVariationHornSounds();

    return () => {
      // Stop all active sounds
      activeSoundsRef.current.forEach(sound => {
        sound.source.stop();
      });
      activeSoundsRef.current.clear();
      
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Handle background music
  useEffect(() => {
    if (!backgroundMusicRef.current) return;

    if (gameState === 'playing' && !isMuted) {
      backgroundMusicRef.current.play().catch(console.log);
    } else {
      backgroundMusicRef.current.pause();
    }
  }, [gameState, isMuted]);

  // Play spatial honking warnings with doppler effect
  useEffect(() => {
    if (!audioContextRef.current || !hornBufferRef.current || isMuted || gameState !== 'playing') return;

    const currentTime = audioContextRef.current.currentTime;
    const HONK_COOLDOWN = 0.8; // Reduced cooldown for more immediate response
    const MIN_CAR_DISTANCE = 15; // Increased distance to prevent too many overlapping sounds

    enemyCars.forEach(enemy => {
      // Warn about cars that are approaching - increased range for earlier warning
      if (enemy.z > -35 && enemy.z < 5) {
        const lastHonkTime = lastHonkTimeRef.current.get(enemy.lane) || 0;
        
        // Check if enough time has passed since last honk in this lane
        if (currentTime - lastHonkTime > HONK_COOLDOWN) {
          // Find the closest car in this lane (priority to closest)
          const carsInLane = enemyCars.filter(car => car.lane === enemy.lane);
          const closestCar = carsInLane.reduce((closest, car) => 
            Math.abs(car.z) < Math.abs(closest.z) ? car : closest, enemy
          );
          
          // Only play sound for the closest car in each lane
          if (closestCar.id === enemy.id) {
            // Calculate velocity for doppler effect
            const previousZ = previousCarPositionsRef.current.get(enemy.id) || enemy.z;
            const velocity = previousZ - enemy.z; // Positive = approaching
            
            playHonkSound(enemy.lane, enemy.z, velocity);
            lastHonkTimeRef.current.set(enemy.lane, currentTime);
          }
        }
        
        // Update car position for next frame
        previousCarPositionsRef.current.set(enemy.id, enemy.z);
      }
    });

    // Clean up tracking for cars that are no longer in range
    const activeCarIds = new Set(enemyCars.map(car => car.id));
    Array.from(previousCarPositionsRef.current.keys()).forEach(carId => {
      if (!activeCarIds.has(carId)) {
        previousCarPositionsRef.current.delete(carId);
      }
    });

  }, [enemyCars, isMuted, gameState]);

  // Function to select center horn sound based on probabilities
  const selectCenterHornBuffer = (): AudioBuffer | null => {
    const random = Math.random();
    
    if (random < 0.80) {
      // 80% chance for CarHonkCenter1
      return centerHornBuffersRef.current.center1;
    } else if (random < 0.95) {
      // 15% chance for CarHonkCenter2 (80% + 15% = 95%)
      return centerHornBuffersRef.current.center2;
    } else {
      // 5% chance for CarHonkCenter3 (remaining 5%)
      return centerHornBuffersRef.current.center3;
    }
  };

  // Function to select right horn sound based on probabilities  
  const selectRightHornBuffer = (): AudioBuffer | null => {
    const random = Math.random();
    
    if (random < 0.80) {
      // 80% chance for CarHonkRight1
      return rightHornBuffersRef.current.right1;
    } else if (random < 0.95) {
      // 15% chance for CarHonkRight2 (80% + 15% = 95%)
      return rightHornBuffersRef.current.right2;
    } else {
      // 5% chance for CarHonkRight3 (remaining 5%)
      return rightHornBuffersRef.current.right3;
    }
  };

  // Function to select left horn sound based on probabilities  
  const selectLeftHornBuffer = (): AudioBuffer | null => {
    const random = Math.random();
    
    if (random < 0.80) {
      // 80% chance for CarHonkLeft1
      return leftHornBuffersRef.current.left1;
    } else if (random < 0.95) {
      // 15% chance for CarHonkLeft2 (80% + 15% = 95%)
      return leftHornBuffersRef.current.left2;
    } else {
      // 5% chance for CarHonkLeft3 (remaining 5%)
      return leftHornBuffersRef.current.left3;
    }
  };

  const playHonkSound = (lane: number, distance: number, velocity: number) => {
    if (!audioContextRef.current) return;

    // Select appropriate sound buffer based on lane
    let selectedBuffer: AudioBuffer | null = null;
    
    if (lane === 0) {
      // Left lane - use probability-based selection
      selectedBuffer = selectLeftHornBuffer();
    } else if (lane === 1) {
      // Center lane - use probability-based selection
      selectedBuffer = selectCenterHornBuffer();
    } else if (lane === 2) {
      // Right lane - use probability-based selection
      selectedBuffer = selectRightHornBuffer();
    }

    if (!selectedBuffer) return;

    try {
      // Stop any existing sound in this lane
      const existingSound = activeSoundsRef.current.get(lane);
      if (existingSound) {
        existingSound.source.stop();
        activeSoundsRef.current.delete(lane);
      }

      const source = audioContextRef.current.createBufferSource();
      const gainNode = audioContextRef.current.createGain();
      
      source.buffer = selectedBuffer;
      
      // Simple volume control based on distance
      const baseVolume = Math.max(0.3, Math.min(0.8, (30 - Math.abs(distance)) / 30));
      gainNode.gain.value = baseVolume;
      
      // Simple audio graph - no panning or filtering since audio is preprocessed
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      // Track this sound (simplified)
      const activeSound: ActiveSound = {
        source,
        gainNode,
        pannerNode: null as any, // Not used anymore
        lane,
        startTime: audioContextRef.current.currentTime
      };
      activeSoundsRef.current.set(lane, activeSound);
      
      // Auto-cleanup when sound ends
      source.onended = () => {
        activeSoundsRef.current.delete(lane);
      };
      
      source.start();
      
      // Log which sound variant is being used
      let soundVariant = 'original';
      if (lane === 0) {
        if (selectedBuffer === leftHornBuffersRef.current.left1) soundVariant = 'left1';
        else if (selectedBuffer === leftHornBuffersRef.current.left2) soundVariant = 'left2';
        else if (selectedBuffer === leftHornBuffersRef.current.left3) soundVariant = 'left3';
      } else if (lane === 1) {
        if (selectedBuffer === centerHornBuffersRef.current.center1) soundVariant = 'center1';
        else if (selectedBuffer === centerHornBuffersRef.current.center2) soundVariant = 'center2';
        else if (selectedBuffer === centerHornBuffersRef.current.center3) soundVariant = 'center3';
      } else if (lane === 2) {
        if (selectedBuffer === rightHornBuffersRef.current.right1) soundVariant = 'right1';
        else if (selectedBuffer === rightHornBuffersRef.current.right2) soundVariant = 'right2';
        else if (selectedBuffer === rightHornBuffersRef.current.right3) soundVariant = 'right3';
      }
      
      console.log(`Honk warning: Lane ${lane} (${['LEFT', 'CENTER', 'RIGHT'][lane]}), Sound: ${soundVariant}, Volume: ${baseVolume.toFixed(2)}`);
    } catch (error) {
      console.log('Audio play prevented:', error);
    }
  };

  return null; // This component doesn't render anything visible
}

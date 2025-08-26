import React, { useEffect, useRef } from 'react';
import { useDriving } from '../lib/stores/useDriving';
import { useAudio } from '../lib/stores/useAudio';

interface ActiveSound {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  pannerNode: StereoPannerNode;
  lane: number;
  startTime: number;
}

export default function AudioManager() {
  const { enemyCars, gameState } = useDriving();
  const { isMuted } = useAudio();
  const audioContextRef = useRef<AudioContext | null>(null);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const hornBufferRef = useRef<AudioBuffer | null>(null);
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

    loadHornSound();

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
            
            playHonkSoundWithDoppler(enemy.lane, enemy.z, velocity);
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

  const playHonkSoundWithDoppler = (lane: number, distance: number, velocity: number) => {
    if (!audioContextRef.current || !hornBufferRef.current) return;

    try {
      // Stop any existing sound in this lane
      const existingSound = activeSoundsRef.current.get(lane);
      if (existingSound) {
        existingSound.source.stop();
        activeSoundsRef.current.delete(lane);
      }

      const source = audioContextRef.current.createBufferSource();
      const gainNode = audioContextRef.current.createGain();
      const pannerNode = audioContextRef.current.createStereoPanner();
      
      source.buffer = hornBufferRef.current;
      
      // Enhanced spatial positioning - more pronounced left/right separation
      // Lane 0 (left) = -0.8, Lane 1 (center) = 0, Lane 2 (right) = 0.8
      const panValues = [-0.8, 0, 0.8];
      pannerNode.pan.value = panValues[lane];
      
      // More pronounced volume differences based on distance and lane
      const baseVolume = Math.max(0.25, Math.min(0.9, (30 - Math.abs(distance)) / 30));
      
      // Make center lane slightly louder, sides slightly different volumes for clarity
      const laneVolumeMultiplier = [0.85, 1.0, 0.75]; // Left slightly quieter, center loudest, right quieter
      const finalVolume = baseVolume * laneVolumeMultiplier[lane];
      gainNode.gain.value = finalVolume;
      
      // Enhanced doppler effect for better audio cues
      const dopplerFactor = 1 + (velocity * 0.15); // Increased effect strength
      source.playbackRate.value = Math.max(0.6, Math.min(1.7, dopplerFactor));
      
      // Add slight frequency filtering to distinguish lanes better
      const filterNode = audioContextRef.current.createBiquadFilter();
      if (lane === 0) {
        // Left lane: slightly lower frequency emphasis
        filterNode.type = 'lowpass';
        filterNode.frequency.value = 1200;
      } else if (lane === 2) {
        // Right lane: slightly higher frequency emphasis  
        filterNode.type = 'highpass';
        filterNode.frequency.value = 800;
      } else {
        // Center lane: no filtering for clarity
        filterNode.type = 'allpass';
      }
      
      // Connect the enhanced audio graph
      source.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(pannerNode);
      pannerNode.connect(audioContextRef.current.destination);
      
      // Track this sound
      const activeSound: ActiveSound = {
        source,
        gainNode,
        pannerNode,
        lane,
        startTime: audioContextRef.current.currentTime
      };
      activeSoundsRef.current.set(lane, activeSound);
      
      // Auto-cleanup when sound ends
      source.onended = () => {
        activeSoundsRef.current.delete(lane);
      };
      
      source.start();
      
      console.log(`Honk warning: Lane ${lane} (${['LEFT', 'CENTER', 'RIGHT'][lane]}), Pan: ${panValues[lane]}, Volume: ${finalVolume.toFixed(2)}, Doppler: ${dopplerFactor.toFixed(2)}`);
    } catch (error) {
      console.log('Audio play prevented:', error);
    }
  };

  return null; // This component doesn't render anything visible
}

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
    const HONK_COOLDOWN = 1.5; // Seconds between honks per lane
    const MIN_CAR_DISTANCE = 8; // Minimum distance between cars in same lane to honk

    enemyCars.forEach(enemy => {
      // Only warn about cars that are approaching and close enough to be dangerous
      if (enemy.z > -30 && enemy.z < 0) {
        const lastHonkTime = lastHonkTimeRef.current.get(enemy.lane) || 0;
        
        // Check if enough time has passed since last honk in this lane
        if (currentTime - lastHonkTime > HONK_COOLDOWN) {
          // Check if there's another car too close in the same lane
          const tooCloseToAnother = enemyCars.some(otherCar => 
            otherCar.id !== enemy.id && 
            otherCar.lane === enemy.lane && 
            Math.abs(otherCar.z - enemy.z) < MIN_CAR_DISTANCE &&
            lastHonkTimeRef.current.has(otherCar.lane)
          );
          
          if (!tooCloseToAnother) {
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
      
      // Set spatial position based on lane
      // Lane 0 (left) = -1, Lane 1 (center) = 0, Lane 2 (right) = 1
      const panValue = (lane - 1);
      pannerNode.pan.value = panValue;
      
      // Adjust volume based on distance (closer = louder)
      const volume = Math.max(0.15, Math.min(0.8, (25 - Math.abs(distance)) / 25));
      gainNode.gain.value = volume;
      
      // Doppler effect: adjust playback rate based on velocity
      // Approaching cars (positive velocity) = higher pitch
      // Receding cars (negative velocity) = lower pitch
      const dopplerFactor = 1 + (velocity * 0.1); // Scale factor for effect strength
      source.playbackRate.value = Math.max(0.7, Math.min(1.5, dopplerFactor));
      
      // Connect the audio graph
      source.connect(gainNode);
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
      
      console.log(`Honk warning: Lane ${lane}, Pan: ${panValue}, Volume: ${volume.toFixed(2)}, Doppler: ${dopplerFactor.toFixed(2)}`);
    } catch (error) {
      console.log('Audio play prevented:', error);
    }
  };

  return null; // This component doesn't render anything visible
}

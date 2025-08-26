import React, { useEffect, useRef } from 'react';
import { useDriving } from '../lib/stores/useDriving';
import { useAudio } from '../lib/stores/useAudio';

export default function AudioManager() {
  const { enemyCars, gameState } = useDriving();
  const { isMuted } = useAudio();
  const audioContextRef = useRef<AudioContext | null>(null);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const honkSoundsRef = useRef<{ [key: string]: HTMLAudioElement }>({});
  const playedWarnings = useRef<Set<string>>(new Set());

  // Initialize audio context and load sounds
  useEffect(() => {
    // Initialize audio context
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Load background music
    backgroundMusicRef.current = new Audio('/sounds/background.mp3');
    backgroundMusicRef.current.loop = true;
    backgroundMusicRef.current.volume = 0.3;

    // Load honking sounds for each lane
    honkSoundsRef.current = {
      '0': new Audio('/sounds/hit.mp3'), // Use hit sound as honk for now
      '1': new Audio('/sounds/hit.mp3'),
      '2': new Audio('/sounds/hit.mp3'),
    };

    return () => {
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

  // Play spatial honking warnings
  useEffect(() => {
    if (!audioContextRef.current || isMuted || gameState !== 'playing') return;

    enemyCars.forEach(enemy => {
      // Only warn about cars that are approaching (close enough to be dangerous)
      if (enemy.z > -20 && enemy.z < -5) {
        const warningId = `${enemy.id}-${Math.floor(enemy.z)}`;
        
        if (!playedWarnings.current.has(warningId)) {
          playedWarnings.current.add(warningId);
          playHonkSound(enemy.lane, enemy.z);
        }
      }
    });

    // Clean up old warnings
    const currentWarnings = new Set<string>();
    enemyCars.forEach(enemy => {
      if (enemy.z > -20 && enemy.z < -5) {
        currentWarnings.add(`${enemy.id}-${Math.floor(enemy.z)}`);
      }
    });
    playedWarnings.current = currentWarnings;

  }, [enemyCars, isMuted, gameState]);

  const playHonkSound = (lane: number, distance: number) => {
    if (!audioContextRef.current || !honkSoundsRef.current[lane.toString()]) return;

    try {
      const audio = honkSoundsRef.current[lane.toString()].cloneNode() as HTMLAudioElement;
      const source = audioContextRef.current.createMediaElementSource(audio);
      const panner = audioContextRef.current.createStereoPanner();
      
      // Set spatial position based on lane
      // Lane 0 (left) = -1, Lane 1 (center) = 0, Lane 2 (right) = 1
      const panValue = (lane - 1);
      panner.pan.value = panValue;
      
      // Adjust volume based on distance (closer = louder)
      const volume = Math.max(0.1, Math.min(1, (20 - Math.abs(distance)) / 20));
      
      source.connect(panner);
      panner.connect(audioContextRef.current.destination);
      
      audio.volume = volume * 0.7;
      audio.play().catch(console.log);
      
      console.log(`Honk warning: Lane ${lane}, Pan: ${panValue}, Volume: ${volume.toFixed(2)}`);
    } catch (error) {
      console.log('Audio play prevented:', error);
    }
  };

  return null; // This component doesn't render anything visible
}

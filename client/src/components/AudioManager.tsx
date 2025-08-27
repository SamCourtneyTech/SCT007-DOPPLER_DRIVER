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
  const { enemyCars, gameState, missileAttacks } = useDriving();
  const { isMuted, setJetSound, setMissileSound, playJet, playMissile } = useAudio();
  const audioContextRef = useRef<AudioContext | null>(null);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const engineSoundRef = useRef<HTMLAudioElement | null>(null);
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
  const activeSoundsRef = useRef<Map<string, ActiveSound>>(new Map()); // Use unique IDs instead of lane numbers
  const carHonkedRef = useRef<Set<string>>(new Set()); // Track which cars have already honked
  const previousCarPositionsRef = useRef<Map<string, number>>(new Map());

  // Initialize audio context and load sounds
  useEffect(() => {
    // Initialize audio context
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Load background music
    backgroundMusicRef.current = new Audio('/attached_assets/\'_1756177926740.mp3');
    backgroundMusicRef.current.loop = true;
    backgroundMusicRef.current.volume = 0.5; // Increased background music volume

    // Load engine sound for continuous playback
    engineSoundRef.current = new Audio('/attached_assets/CarDrivingSustaied_1756181540499.mp3');
    engineSoundRef.current.loop = true;
    engineSoundRef.current.volume = 0.2; // 20% volume engine sound

    // Load jet and missile sounds
    const jetAudio = new Audio('/attached_assets/Fighter jet sound effect_1756263897734.mp3');
    const missileAudio = new Audio('/attached_assets/MissileCenter_1756263962342.mp3');
    setJetSound(jetAudio);
    setMissileSound(missileAudio);

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
        try {
          sound.source.stop();
        } catch (e) {
          // Sound may have already ended
        }
      });
      activeSoundsRef.current.clear();
      
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
      }
      if (engineSoundRef.current) {
        engineSoundRef.current.pause();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);



  // Play spatial honking warnings - one sound per car
  useEffect(() => {
    if (!audioContextRef.current || isMuted || gameState !== 'playing') return;

    enemyCars.forEach(enemy => {
      // Check if this car is in warning range and hasn't honked yet
      if (enemy.z > -35 && enemy.z < 10 && !carHonkedRef.current.has(enemy.id)) {
        // Calculate velocity for volume adjustment
        const previousZ = previousCarPositionsRef.current.get(enemy.id) || enemy.z;
        const velocity = previousZ - enemy.z; // Positive = approaching
        
        // Mark this car as having honked to prevent double audio
        carHonkedRef.current.add(enemy.id);
        
        playHonkSound(enemy.lane, enemy.z, velocity);
      }
      
      // Update car position for next frame
      previousCarPositionsRef.current.set(enemy.id, enemy.z);
    });

    // Clean up tracking for cars that are no longer active
    const activeCarIds = new Set(enemyCars.map(car => car.id));
    Array.from(carHonkedRef.current.values()).forEach(carId => {
      if (!activeCarIds.has(carId)) {
        carHonkedRef.current.delete(carId);
        previousCarPositionsRef.current.delete(carId);
      }
    });

  }, [enemyCars, isMuted, gameState]);

  // Control background music and engine sound based on game state
  useEffect(() => {
    if (!backgroundMusicRef.current || !engineSoundRef.current) return;

    if (gameState === 'playing' && !isMuted) {
      // Start background music when game starts
      backgroundMusicRef.current.currentTime = 0;
      backgroundMusicRef.current.play().catch(error => {
        console.log('Background music play prevented:', error);
      });
      
      // Start engine sound when game starts
      engineSoundRef.current.currentTime = 0;
      engineSoundRef.current.play().catch(error => {
        console.log('Engine sound play prevented:', error);
      });
    } else {
      // Stop background music and engine sound when game ends or is muted
      backgroundMusicRef.current.pause();
      engineSoundRef.current.pause();
    }
  }, [gameState, isMuted]);

  // Function to select center horn sound based on probabilities
  const selectCenterHornBuffer = (): AudioBuffer | null => {
    const random = Math.random();
    
    if (random < 0.475) {
      // 47.5% chance for CarHonkCenter1
      return centerHornBuffersRef.current.center1;
    } else if (random < 0.525) {
      // 5% chance for CarHonkCenter2 (47.5% + 5% = 52.5%)
      return centerHornBuffersRef.current.center2;
    } else {
      // 47.5% chance for CarHonkCenter3 (remaining 47.5%)
      return centerHornBuffersRef.current.center3;
    }
  };

  // Function to select right horn sound based on probabilities  
  const selectRightHornBuffer = (): AudioBuffer | null => {
    const random = Math.random();
    
    if (random < 0.475) {
      // 47.5% chance for CarHonkRight1
      return rightHornBuffersRef.current.right1;
    } else if (random < 0.525) {
      // 5% chance for CarHonkRight2 (47.5% + 5% = 52.5%)
      return rightHornBuffersRef.current.right2;
    } else {
      // 47.5% chance for CarHonkRight3 (remaining 47.5%)
      return rightHornBuffersRef.current.right3;
    }
  };

  // Function to select left horn sound based on probabilities  
  const selectLeftHornBuffer = (): AudioBuffer | null => {
    const random = Math.random();
    
    if (random < 0.475) {
      // 47.5% chance for CarHonkLeft1
      return leftHornBuffersRef.current.left1;
    } else if (random < 0.525) {
      // 5% chance for CarHonkLeft2 (47.5% + 5% = 52.5%)
      return leftHornBuffersRef.current.left2;
    } else {
      // 47.5% chance for CarHonkLeft3 (remaining 47.5%)
      return leftHornBuffersRef.current.left3;
    }
  };

  const playHonkSound = (lane: number, distance: number, velocity: number) => {
    if (!audioContextRef.current) return;

    // 50% chance for honks to happen at all (5 out of 10 cars)
    if (Math.random() > 0.5) return;

    // Select appropriate sound buffer based on lane
    let selectedBuffer: AudioBuffer | null = null;
    
    if (lane === 0) {
      // Left lane (position -4) - use RIGHT audio (car approaching from player's right perspective)
      selectedBuffer = selectRightHornBuffer();
    } else if (lane === 1) {
      // Center lane - use center audio
      selectedBuffer = selectCenterHornBuffer();
    } else if (lane === 2) {
      // Right lane (position 4) - use LEFT audio (car approaching from player's left perspective)
      selectedBuffer = selectLeftHornBuffer();
    }

    if (!selectedBuffer) return;

    try {
      // Generate unique ID for this sound instance
      const soundId = `${lane}_${Date.now()}_${Math.random()}`;

      const source = audioContextRef.current.createBufferSource();
      const gainNode = audioContextRef.current.createGain();
      
      source.buffer = selectedBuffer;
      
      // Calculate volume based on distance and number of active sounds to prevent distortion
      const activeCount = activeSoundsRef.current.size;
      const distanceVolume = Math.max(0.1, Math.min(0.3, (30 - Math.abs(distance)) / 30)); // Reduced horn volume
      
      // Reduce volume when multiple sounds are playing to prevent distortion
      const volumeMultiplier = activeCount > 0 ? Math.max(0.2, 1.0 / Math.sqrt(activeCount + 1)) : 1.0;
      const finalVolume = distanceVolume * volumeMultiplier;
      
      gainNode.gain.value = finalVolume;
      
      // Simple audio graph - no panning or filtering since audio is preprocessed
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      // Track this sound with unique ID
      const activeSound: ActiveSound = {
        source,
        gainNode,
        pannerNode: null,
        lane,
        startTime: audioContextRef.current.currentTime
      };
      activeSoundsRef.current.set(soundId, activeSound);
      
      // Auto-cleanup when sound ends - let it play to completion
      source.onended = () => {
        activeSoundsRef.current.delete(soundId);
      };
      
      source.start();
      
      // Log which sound variant is being used (corrected for perspective)
      let soundVariant = 'original';
      if (lane === 0) {
        // Lane 0 uses right audio from player's perspective
        if (selectedBuffer === rightHornBuffersRef.current.right1) soundVariant = 'right1';
        else if (selectedBuffer === rightHornBuffersRef.current.right2) soundVariant = 'right2';
        else if (selectedBuffer === rightHornBuffersRef.current.right3) soundVariant = 'right3';
      } else if (lane === 1) {
        if (selectedBuffer === centerHornBuffersRef.current.center1) soundVariant = 'center1';
        else if (selectedBuffer === centerHornBuffersRef.current.center2) soundVariant = 'center2';
        else if (selectedBuffer === centerHornBuffersRef.current.center3) soundVariant = 'center3';
      } else if (lane === 2) {
        // Lane 2 uses left audio from player's perspective
        if (selectedBuffer === leftHornBuffersRef.current.left1) soundVariant = 'left1';
        else if (selectedBuffer === leftHornBuffersRef.current.left2) soundVariant = 'left2';
        else if (selectedBuffer === leftHornBuffersRef.current.left3) soundVariant = 'left3';
      }
      
      console.log(`Honk warning: Lane ${lane} (${['LEFT', 'CENTER', 'RIGHT'][lane]}), Sound: ${soundVariant}, Volume: ${finalVolume.toFixed(2)}, Active: ${activeCount + 1}`);
    } catch (error) {
      console.log('Audio play prevented:', error);
    }
  };

  // Monitor missile attacks and play sounds at the right time
  useEffect(() => {
    if (missileAttacks.length === 0) return;

    const missile = missileAttacks[0]; // Only handle one missile at a time
    const currentTime = Date.now();
    const timeElapsed = currentTime - missile.startTime;

    // Play jet sound when warning phase starts (immediately)
    if (missile.phase === 'warning' && timeElapsed < 1000) { // Only play once
      console.log('Playing jet warning sound');
      playJet();
    }
    
    // Play missile sound when incoming phase starts (after 14 seconds)
    else if (missile.phase === 'incoming' && timeElapsed >= 14000 && timeElapsed < 15000) { // Only play once
      console.log('Playing missile incoming sound');
      playMissile();
    }

  }, [missileAttacks, playJet, playMissile]);

  return null; // This component doesn't render anything visible
}

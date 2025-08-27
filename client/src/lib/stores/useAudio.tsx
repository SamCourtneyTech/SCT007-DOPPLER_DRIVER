import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  jetSound: HTMLAudioElement | null;
  missileSound: HTMLAudioElement | null;
  isMuted: boolean;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  setJetSound: (sound: HTMLAudioElement) => void;
  setMissileSound: (sound: HTMLAudioElement) => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  playJet: () => void;
  playMissile: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  jetSound: null,
  missileSound: null,
  isMuted: false, // Start unmuted for audio cues
  
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  setJetSound: (sound) => set({ jetSound: sound }),
  setMissileSound: (sound) => set({ missileSound: sound }),
  
  toggleMute: () => {
    const { isMuted } = get();
    const newMutedState = !isMuted;
    
    // Just update the muted state
    set({ isMuted: newMutedState });
    
    // Log the change
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  playHit: () => {
    const { hitSound, isMuted } = get();
    if (hitSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Hit sound skipped (muted)");
        return;
      }
      
      // Clone the sound to allow overlapping playback
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(error => {
        console.log("Hit sound play prevented:", error);
      });
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Success sound skipped (muted)");
        return;
      }
      
      successSound.currentTime = 0;
      successSound.play().catch(error => {
        console.log("Success sound play prevented:", error);
      });
    }
  },

  playJet: () => {
    const { jetSound, isMuted } = get();
    if (jetSound) {
      if (isMuted) {
        console.log("Jet sound skipped (muted)");
        return;
      }
      
      jetSound.currentTime = 0;
      jetSound.volume = 0.6;
      jetSound.play().catch(error => {
        console.log("Jet sound play prevented:", error);
      });
    }
  },

  playMissile: () => {
    const { missileSound, isMuted } = get();
    if (missileSound) {
      if (isMuted) {
        console.log("Missile sound skipped (muted)");
        return;
      }
      
      missileSound.currentTime = 0;
      missileSound.volume = 0.91; // 30% louder than 0.7 (0.7 * 1.3)
      missileSound.play().catch(error => {
        console.log("Missile sound play prevented:", error);
      });
    }
  }
}));

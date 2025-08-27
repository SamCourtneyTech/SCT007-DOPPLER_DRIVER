import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  jetSound: HTMLAudioElement | null;
  missileSound: HTMLAudioElement | null;
  crashLeftSound: HTMLAudioElement | null;
  crashCenterSound: HTMLAudioElement | null;
  crashRightSound: HTMLAudioElement | null;
  policeWarningSound: HTMLAudioElement | null;
  policeSirenSound: HTMLAudioElement | null;
  isMuted: boolean;
  masterVolume: number;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  setJetSound: (sound: HTMLAudioElement) => void;
  setMissileSound: (sound: HTMLAudioElement) => void;
  setCrashLeftSound: (sound: HTMLAudioElement) => void;
  setCrashCenterSound: (sound: HTMLAudioElement) => void;
  setCrashRightSound: (sound: HTMLAudioElement) => void;
  setPoliceWarningSound: (sound: HTMLAudioElement) => void;
  setPoliceSirenSound: (sound: HTMLAudioElement) => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  playJet: () => void;
  playMissile: () => void;
  playCrash: (lane: number) => void;
  playPoliceWarning: () => void;
  playPoliceSiren: () => void;
  stopPoliceSiren: () => void;
  setMasterVolume: (volume: number) => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  jetSound: null,
  missileSound: null,
  crashLeftSound: null,
  crashCenterSound: null,
  crashRightSound: null,
  policeWarningSound: null,
  policeSirenSound: null,
  isMuted: false, // Start unmuted for audio cues
  masterVolume: 0.7, // Default to 70% volume
  
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  setJetSound: (sound) => set({ jetSound: sound }),
  setMissileSound: (sound) => set({ missileSound: sound }),
  setCrashLeftSound: (sound) => set({ crashLeftSound: sound }),
  setCrashCenterSound: (sound) => set({ crashCenterSound: sound }),
  setCrashRightSound: (sound) => set({ crashRightSound: sound }),
  setPoliceWarningSound: (sound) => set({ policeWarningSound: sound }),
  setPoliceSirenSound: (sound) => set({ policeSirenSound: sound }),
  
  toggleMute: () => {
    const { isMuted } = get();
    const newMutedState = !isMuted;
    
    // Just update the muted state
    set({ isMuted: newMutedState });
    
    // Log the change
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  playHit: () => {
    const { hitSound, isMuted, masterVolume } = get();
    if (hitSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Hit sound skipped (muted)");
        return;
      }
      
      // Clone the sound to allow overlapping playback
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3 * masterVolume;
      soundClone.play().catch(error => {
        console.log("Hit sound play prevented:", error);
      });
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted, masterVolume } = get();
    if (successSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Success sound skipped (muted)");
        return;
      }
      
      successSound.currentTime = 0;
      successSound.volume = 0.6 * masterVolume;
      successSound.play().catch(error => {
        console.log("Success sound play prevented:", error);
      });
    }
  },

  playJet: () => {
    const { jetSound, isMuted, masterVolume } = get();
    if (jetSound) {
      if (isMuted) {
        console.log("Jet sound skipped (muted)");
        return;
      }
      
      jetSound.currentTime = 0;
      jetSound.volume = 0.6 * masterVolume;
      jetSound.play().catch(error => {
        console.log("Jet sound play prevented:", error);
      });
    }
  },

  playMissile: () => {
    const { missileSound, isMuted, masterVolume } = get();
    if (missileSound) {
      if (isMuted) {
        console.log("Missile sound skipped (muted)");
        return;
      }
      
      // Clone the sound to avoid MediaElementSource conflicts
      const soundClone = missileSound.cloneNode() as HTMLAudioElement;
      soundClone.currentTime = 0;
      soundClone.volume = Math.min(1.0, 1.0 * masterVolume); // Respect HTML5 volume limits
      soundClone.play().catch(error => {
        console.log("Missile sound play prevented:", error);
      });
    }
  },

  playCrash: (lane: number) => {
    const { crashLeftSound, crashCenterSound, crashRightSound, isMuted, masterVolume } = get();
    if (isMuted) {
      console.log("Crash sound skipped (muted)");
      return;
    }

    let crashSound: HTMLAudioElement | null = null;
    let laneName = "";
    
    // Select appropriate crash sound based on lane
    if (lane === 0) { // Left lane
      crashSound = crashLeftSound;
      laneName = "LEFT";
    } else if (lane === 1) { // Center lane
      crashSound = crashCenterSound;
      laneName = "CENTER";
    } else if (lane === 2) { // Right lane
      crashSound = crashRightSound;
      laneName = "RIGHT";
    }
    
    if (crashSound) {
      crashSound.currentTime = 0;
      crashSound.volume = 0.8 * masterVolume;
      crashSound.play().catch(error => {
        console.log(`Crash sound (${laneName}) play prevented:`, error);
      });
      console.log(`Playing crash sound for ${laneName} lane`);
    } else {
      console.log(`No crash sound available for lane ${lane} (${laneName})`);
    }
  },

  playPoliceWarning: () => {
    const { policeWarningSound, isMuted, masterVolume } = get();
    if (policeWarningSound) {
      if (isMuted) {
        console.log("Police warning sound skipped (muted)");
        return;
      }
      
      policeWarningSound.currentTime = 0;
      policeWarningSound.volume = 0.7 * masterVolume;
      policeWarningSound.play().catch(error => {
        console.log("Police warning sound play prevented:", error);
      });
      console.log("Playing police warning sound");
    }
  },

  playPoliceSiren: () => {
    const { policeSirenSound, isMuted, masterVolume } = get();
    if (policeSirenSound) {
      if (isMuted) {
        console.log("Police siren skipped (muted)");
        return;
      }
      
      policeSirenSound.currentTime = 0;
      policeSirenSound.volume = 0.6 * masterVolume;
      policeSirenSound.loop = true;
      policeSirenSound.play().catch(error => {
        console.log("Police siren play prevented:", error);
      });
      console.log("Playing police siren (looping)");
    }
  },

  stopPoliceSiren: () => {
    const { policeSirenSound } = get();
    if (policeSirenSound) {
      policeSirenSound.pause();
      policeSirenSound.currentTime = 0;
      policeSirenSound.loop = false;
      console.log("Stopped police siren");
    }
  },

  setMasterVolume: (volume: number) => {
    set({ masterVolume: Math.max(0, Math.min(1, volume)) });
  }
}));

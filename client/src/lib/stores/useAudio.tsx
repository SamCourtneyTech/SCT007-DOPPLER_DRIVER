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
      missileSound.volume = 1.0; // Maximum volume for missile sound
      missileSound.play().catch(error => {
        console.log("Missile sound play prevented:", error);
      });
    }
  },

  playCrash: (lane: number) => {
    const { crashLeftSound, crashCenterSound, crashRightSound, isMuted } = get();
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
      crashSound.volume = 0.8;
      crashSound.play().catch(error => {
        console.log(`Crash sound (${laneName}) play prevented:`, error);
      });
      console.log(`Playing crash sound for ${laneName} lane`);
    } else {
      console.log(`No crash sound available for lane ${lane} (${laneName})`);
    }
  },

  playPoliceWarning: () => {
    const { policeWarningSound, isMuted } = get();
    if (policeWarningSound) {
      if (isMuted) {
        console.log("Police warning sound skipped (muted)");
        return;
      }
      
      policeWarningSound.currentTime = 0;
      policeWarningSound.volume = 0.7;
      policeWarningSound.play().catch(error => {
        console.log("Police warning sound play prevented:", error);
      });
      console.log("Playing police warning sound");
    }
  },

  playPoliceSiren: () => {
    const { policeSirenSound, isMuted } = get();
    if (policeSirenSound) {
      if (isMuted) {
        console.log("Police siren skipped (muted)");
        return;
      }
      
      policeSirenSound.currentTime = 0;
      policeSirenSound.volume = 0.6;
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
  }
}));

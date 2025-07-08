"use client";

import { useCallback, useRef, useState } from "react";

export function useSounds() {
  const [soundsEnabled, setSoundsEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const initializeSounds = useCallback(() => {
    if (!soundsEnabled) {
      // Inicializar contexto de audio con interacción del usuario
      try {
        audioContextRef.current = new (window.AudioContext ||
          (
            window as Window &
              typeof globalThis & { webkitAudioContext?: typeof AudioContext }
          ).webkitAudioContext!)();
        setSoundsEnabled(true);
      } catch (error) {
        console.error("Error initializing audio context:", error);
      }
    }
  }, [soundsEnabled]);

  const playSound = useCallback(
    (soundName: string, volume = 0.3) => {
      if (!soundsEnabled) return;

      try {
        const audio = new Audio(`/sounds/${soundName}.wav`);
        audio.volume = volume;
        audio.play().catch((error) => {
          console.error(`Error playing sound ${soundName}:`, error);
        });
      } catch (error) {
        console.error("Error creating audio:", error);
      }
    },
    [soundsEnabled]
  );

  // const playSelect = useCallback(() => playSound("select", 0.2), [playSound]);
  const playCorrect = useCallback(() => playSound("correct", 0.4), [playSound]);
  const playIncorrect = useCallback(
    () => playSound("incorrect", 0.4),
    [playSound]
  );

  return {
    // playSelect,
    playCorrect,
    playIncorrect,
    initializeSounds,
    soundsEnabled,
  };
}

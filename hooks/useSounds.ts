"use client"

import { useCallback } from "react"

export function useSounds() {
  const playSound = useCallback((soundName: string) => {
    try {
      const audio = new Audio(`/sounds/${soundName}.mp3`)
      audio.volume = 0.3
      audio.play().catch(console.error)
    } catch (error) {
      console.error("Error playing sound:", error)
    }
  }, [])

  const playSelect = useCallback(() => playSound("select"), [playSound])
  const playCorrect = useCallback(() => playSound("correct"), [playSound])
  const playIncorrect = useCallback(() => playSound("incorrect"), [playSound])

  return { playSelect, playCorrect, playIncorrect }
}

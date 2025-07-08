"use client";

import { useState, useEffect, useCallback } from "react";
import type { SesionJuego, Participante } from "@/types/game";

const STORAGE_KEY = "paso-en-argentina-sesion";

export function useGamePersistence() {
  const [sesion, setSesion] = useState<SesionJuego | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar sesión solo una vez al montar el componente
  useEffect(() => {
    if (!isLoaded) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedSesion = JSON.parse(stored);
          setSesion(parsedSesion);
        }
      } catch (error) {
        console.error("Error loading session:", error);
      }
      setIsLoaded(true);
    }
  }, [isLoaded]);

  const cargarSesion = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSesion = JSON.parse(stored);
        setSesion(parsedSesion);
        return parsedSesion;
      }
    } catch (error) {
      console.error("Error loading session:", error);
    }
    return null;
  }, []);

  const guardarSesion = useCallback((nuevaSesion: SesionJuego) => {
    try {
      const serialized = JSON.stringify(nuevaSesion);
      localStorage.setItem(STORAGE_KEY, serialized);
      setSesion(nuevaSesion);
    } catch (error) {
      console.error("Error saving session:", error);
    }
  }, []);

  const crearNuevaSesion = useCallback(
    (participantes: Participante[]) => {
      const nuevaSesion: SesionJuego = {
        participantes,
        preguntaActual: 0,
        votos: [],
        juegoTerminado: false,
        totalPreguntas: 10,
        sesionesCompletadas: 0,
      };
      guardarSesion(nuevaSesion);
      return nuevaSesion;
    },
    [guardarSesion]
  );

  const continuarSesion = useCallback(
    (participantes: Participante[]) => {
      const sesionActual = cargarSesion();
      if (sesionActual) {
        const nuevaSesion: SesionJuego = {
          ...sesionActual,
          participantes,
          preguntaActual: 0,
          votos: [],
          juegoTerminado: false,
          sesionesCompletadas: sesionActual.sesionesCompletadas + 1,
        };
        guardarSesion(nuevaSesion);
        return nuevaSesion;
      }
      return crearNuevaSesion(participantes);
    },
    [cargarSesion, guardarSesion, crearNuevaSesion]
  );

  const resetearSesion = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setSesion(null);
      setIsLoaded(false);
    } catch (error) {
      console.error("Error resetting session:", error);
    }
  }, []);

  return {
    sesion,
    isLoaded,
    cargarSesion,
    guardarSesion,
    crearNuevaSesion,
    continuarSesion,
    resetearSesion,
  };
}

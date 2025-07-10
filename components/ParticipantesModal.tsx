"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X, UserPlus, Users } from "lucide-react";
import type { Participante } from "@/types/game";

interface ParticipantesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (participantes: Participante[]) => void;
}

export function ParticipantesModal({
  isOpen,
  onClose,
  onStartGame,
}: ParticipantesModalProps) {
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [nombreInput, setNombreInput] = useState("");
  const [error, setError] = useState("");

  const agregarParticipante = () => {
    const nombre = nombreInput.trim();

    // Validaciones
    if (!nombre) {
      setError("El nombre no puede estar vacío");
      return;
    }

    if (nombre.length > 25) {
      setError("El nombre no puede tener más de 25 caracteres");
      return;
    }

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s]+$/.test(nombre)) {
      setError("Solo se permiten letras, números y espacios");
      return;
    }

    if (
      participantes.some((p) => p.nombre.toLowerCase() === nombre.toLowerCase())
    ) {
      setError("Ya existe un participante con ese nombre");
      return;
    }

    if (participantes.length >= 25) {
      setError("Máximo 25 participantes");
      return;
    }

    const nuevoParticipante: Participante = {
      id: crypto.randomUUID(),
      nombre,
      aciertos: 0,
      errores: 0,
      puntaje: 0,
      rachaActual: 0,
      mejorRacha: 0,
    };

    setParticipantes([...participantes, nuevoParticipante]);
    setNombreInput("");
    setError("");
  };

  const eliminarParticipante = (id: string) => {
    setParticipantes(participantes.filter((p) => p.id !== id));
  };

  const iniciarJuego = () => {
    if (participantes.length === 0) {
      setError("Debe haber al menos un participante");
      return;
    }
    onStartGame(participantes);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      agregarParticipante();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-sky-50 to-white border-2 border-sky-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-sky-900 flex items-center gap-2">
            <Users className="h-6 w-6" />
            Añadir participante{participantes.length === 1 ? "" : "s"} (
            {participantes.length}/25)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Nombre del participante..."
                value={nombreInput}
                onChange={(e) => setNombreInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 border-sky-300 focus:border-sky-500"
                maxLength={25}
              />
              <Button
                onClick={agregarParticipante}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                disabled={participantes.length >= 25}
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>

            {error && (
              <p className="text-red-600 text-sm font-medium">{error}</p>
            )}

            <p className="text-sm text-sky-700">
              {25 - participantes.length} participantes restantes
            </p>
          </div>

          {participantes.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sky-900">
                Participantes agregados:
              </h3>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-sky-50 rounded-lg border border-sky-200">
                {participantes.map((participante) => (
                  <Badge
                    key={participante.id}
                    variant="secondary"
                    className="bg-white border border-sky-300 text-sky-800 px-3 py-1 flex items-center gap-2"
                  >
                    {participante.nombre}
                    <button
                      onClick={() => eliminarParticipante(participante.id)}
                      className="hover:bg-red-100 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3 text-red-500" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={iniciarJuego}
              disabled={participantes.length === 0}
              className="flex-1 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-bold py-3"
            >
              🎮 Iniciar Juego ({participantes.length} participante
              {participantes.length === 1 ? "" : "s"})
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-sky-300 text-sky-700 hover:bg-sky-50 bg-transparent"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

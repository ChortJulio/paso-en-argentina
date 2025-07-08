"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Flame, Target } from "lucide-react";
import type { Participante } from "@/types/game";

interface PosicionesModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantes: Participante[];
  preguntaActual: number;
  totalPreguntas: number;
}

export function PosicionesModal({
  isOpen,
  onClose,
  participantes,
  preguntaActual,
  totalPreguntas,
}: PosicionesModalProps) {
  const participantesOrdenados = [...participantes].sort((a, b) => {
    if (b.puntaje !== a.puntaje) return b.puntaje - a.puntaje;
    if (b.rachaActual !== a.rachaActual) return b.rachaActual - a.rachaActual;
    return b.mejorRacha - a.mejorRacha;
  });

  const getIcon = (posicion: number) => {
    switch (posicion) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <span className="w-5 h-5 flex items-center justify-center text-sky-700 font-bold text-sm">
            {posicion + 1}
          </span>
        );
    }
  };

  const getRowStyle = (posicion: number) => {
    switch (posicion) {
      case 0:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300";
      case 1:
        return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300";
      case 2:
        return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300";
      default:
        return "bg-white border-sky-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-sky-50 to-white border-2 border-sky-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-sky-900 flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Posiciones Actuales
          </DialogTitle>
          <p className="text-sky-700">
            Pregunta {preguntaActual + 1} de {totalPreguntas}
          </p>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-5 gap-2 p-3 bg-sky-100 rounded-lg font-semibold text-sky-900 text-sm">
            <div>Pos.</div>
            <div>Jugador</div>
            <div className="text-center">Puntos</div>
            <div className="text-center">Racha</div>
            <div className="text-center">Mejor</div>
          </div>

          {participantesOrdenados.map((participante, index) => (
            <div
              key={participante.id}
              className={`grid grid-cols-5 gap-2 p-3 rounded-lg border-2 transition-all duration-200 ${getRowStyle(
                index
              )}`}
            >
              <div className="flex items-center">{getIcon(index)}</div>
              <div className="flex items-center">
                <span className="font-semibold text-gray-800 truncate">
                  {participante.nombre}
                </span>
              </div>
              <div className="text-center">
                <Badge className="bg-sky-600 text-white font-bold">
                  {participante.puntaje}
                </Badge>
              </div>
              <div className="text-center">
                {participante.rachaActual > 0 ? (
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-800"
                  >
                    <Flame className="h-3 w-3 mr-1" />
                    {participante.rachaActual}
                  </Badge>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </div>
              <div className="text-center">
                <Badge
                  variant="outline"
                  className="border-green-300 text-green-700"
                >
                  <Target className="h-3 w-3 mr-1" />
                  {participante.mejorRacha}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={onClose}
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold mt-4"
        >
          Continuar Jugando
        </Button>
      </DialogContent>
    </Dialog>
  );
}

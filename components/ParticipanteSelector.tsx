"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import type { Participante } from "@/types/game";

interface ParticipanteSelectorProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly participantes: Participante[];
  readonly participantesQueVotaron: string[]; // IDs de participantes que ya votaron
  readonly onSeleccionar: (participanteId: string) => void;
  readonly opcionTexto: string;
}

export function ParticipanteSelector({
  isOpen,
  onClose,
  participantes,
  participantesQueVotaron,
  onSeleccionar,
  opcionTexto,
}: ParticipanteSelectorProps) {
  const handleSeleccionar = (participanteId: string) => {
    onSeleccionar(participanteId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-sky-50 to-white border-2 border-sky-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-sky-900 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Seleccionar participante
          </DialogTitle>
          <p className="text-sm text-sky-700 mt-2">
            ¿Quién eligió:{" "}
            <span className="font-semibold">&quot;{opcionTexto}&quot;</span>?
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2 max-h-60 overflow-y-auto">
            {participantes.map((participante) => {
              const yaVoto = participantesQueVotaron.includes(participante.id);

              return (
                <Button
                  key={participante.id}
                  onClick={() => handleSeleccionar(participante.id)}
                  variant="outline"
                  className={`justify-start p-4 h-auto transition-all ${
                    yaVoto
                      ? "border-green-300 bg-green-50 hover:bg-green-100 hover:border-green-400"
                      : "border-sky-200 hover:bg-sky-50 hover:border-sky-300"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {yaVoto && (
                        <span className="text-green-600 font-bold">✓</span>
                      )}
                      <span
                        className={`font-medium ${
                          yaVoto ? "text-green-900" : "text-sky-900"
                        }`}
                      >
                        {participante.nombre}
                      </span>
                      {yaVoto && (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800 text-xs"
                        >
                          Cambiar voto
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 text-xs"
                      >
                        {participante.puntaje}pts
                      </Badge>
                      {participante.rachaActual > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800 text-xs"
                        >
                          🔥{participante.rachaActual}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

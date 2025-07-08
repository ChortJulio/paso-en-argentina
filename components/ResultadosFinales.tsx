"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, RotateCcw, Home, Play } from "lucide-react";
import type { Participante } from "@/types/game";
import Link from "next/link";

interface ResultadosFinalesProps {
  participantes: Participante[];
  onReiniciar: () => void;
}

export function ResultadosFinales({
  participantes,
  onReiniciar,
}: ResultadosFinalesProps) {
  const participantesOrdenados = [...participantes].sort(
    (a, b) => b.puntaje - a.puntaje
  );

  const getIcon = (posicion: number) => {
    switch (posicion) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-sky-700 font-bold">
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
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full bg-white/95 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="text-center pb-6 bg-gradient-to-r from-sky-600 to-sky-700 text-white rounded-t-lg">
          <div className="text-6xl mb-4">🏆</div>
          <CardTitle className="text-3xl md:text-4xl mb-2">
            ¡Resultados Finales!
          </CardTitle>
          <p className="text-lg opacity-90">
            ¿Pasó en Argentina? - Partida completada
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-4 gap-4 p-3 bg-sky-100 rounded-lg font-semibold text-sky-900 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <span>Pos.</span>
              </div>
              <div>Jugador</div>
              <div className="text-center">Aciertos</div>
              <div className="text-center">Puntaje</div>
            </div>

            {participantesOrdenados.map((participante, index) => (
              <div
                key={participante.id}
                className={`grid grid-cols-4 gap-4 p-4 rounded-lg border-2 transition-all duration-200 ${getRowStyle(
                  index
                )}`}
              >
                <div className="flex items-center gap-2">{getIcon(index)}</div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-800 truncate">
                    {participante.nombre}
                  </span>
                </div>
                <div className="text-center">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    {participante.aciertos}/10
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge className="bg-sky-600 text-white font-bold">
                    {participante.puntaje} pts
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t border-sky-200">
            <Button
              onClick={onReiniciar}
              size="lg"
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Nueva Partida
            </Button>
            <Button
              onClick={() => {
                // Continuar con el mismo grupo
                if (typeof window !== "undefined") {
                  const sesion = JSON.parse(
                    localStorage.getItem("paso-en-argentina-sesion") || "{}"
                  );
                  if (sesion.participantes) {
                    const participantesActualizados = participantes.map(
                      (p) => ({
                        ...p,
                        rachaActual: 0, // Reset racha para nueva sesión
                      })
                    );
                    const nuevaSesion = {
                      ...sesion,
                      participantes: participantesActualizados,
                      preguntaActual: 0,
                      votos: [],
                      juegoTerminado: false,
                      sesionesCompletadas: sesion.sesionesCompletadas + 1,
                    };
                    localStorage.setItem(
                      "paso-en-argentina-sesion",
                      JSON.stringify(nuevaSesion)
                    );
                    window.location.href = "/jugar";
                  }
                }
              }}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold"
            >
              <Play className="mr-2 h-5 w-5" />
              Seguir Jugando
            </Button>
            <Link href="/">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-sky-300 text-sky-700 hover:bg-sky-50 bg-transparent"
              >
                <Home className="mr-2 h-5 w-5" />
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

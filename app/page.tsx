"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Zap,
  Trophy,
  Flag,
  RotateCcw,
  Play,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { ParticipantesModal } from "@/components/ParticipantesModal";
import { useGamePersistence } from "@/hooks/useGamePersistence";
import type { Participante } from "@/types/game";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [showModal, setShowModal] = useState(false);
  const [showContinueOption, setShowContinueOption] = useState(false);
  const { sesion, crearNuevaSesion, continuarSesion, resetearSesion } =
    useGamePersistence();
  const router = useRouter();

  useEffect(() => {
    if (sesion && sesion.participantes.length > 0) {
      setShowContinueOption(true);
    }
  }, [sesion]);

  const handleStartNewGame = (participantes: Participante[]) => {
    crearNuevaSesion(participantes);
    setShowModal(false);
    router.push("/jugar");
  };

  const handleContinueGame = () => {
    if (sesion) {
      const participantesActualizados = sesion.participantes.map((p) => ({
        ...p,
        rachaActual: 0, // Reset racha para nueva sesión
      }));
      continuarSesion(participantesActualizados);
      router.push("/jugar");
    }
  };

  const handleResetGame = () => {
    resetearSesion();
    setShowContinueOption(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-white to-sky-300 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Flag className="h-12 w-12 text-sky-600" />
            <h1 className="text-5xl md:text-7xl font-black text-sky-800 drop-shadow-lg">
              ¿PASÓ EN ARGENTINA?
            </h1>
            <Flag className="h-12 w-12 text-sky-600" />
          </div>
          <p className="text-xl md:text-2xl text-sky-700 font-medium">
            El juego de sucesos insólitos pero reales
          </p>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-sky-200">
          <CardHeader className="text-center pb-4 bg-gradient-to-r from-sky-50 to-white">
            <CardTitle className="text-2xl md:text-3xl text-sky-900">
              10 preguntas que te van a sorprender sobre Argentina
            </CardTitle>

            <div className="bg-gradient-to-r from-blue-50 to-sky-50 p-4 rounded-lg border border-sky-200 mt-4">
              <p className="text-sky-800 text-base leading-relaxed">
                En cada pregunta hay <strong>3 opciones</strong>: solo{" "}
                <strong>una realmente pasó en Argentina</strong> (todas con
                fuente) y las otras dos son falsas. El objetivo es{" "}
                <strong>identificar cuál es la verdadera</strong> entre los
                sucesos insólitos pero reales.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-sky-50 rounded-lg border border-sky-200">
                <Users className="h-8 w-8 text-sky-600" />
                <div>
                  <h3 className="font-semibold text-sky-900">Para grupos</h3>
                  <p className="text-sm text-sky-700">Hasta 25 participantes</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <Zap className="h-8 w-8 text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-900">Dinámico</h3>
                  <p className="text-sm text-yellow-700">
                    Pasá el celu al siguiente participante
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <Trophy className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">Competitivo</h3>
                  <p className="text-sm text-green-700">
                    Puntajes y posiciones
                  </p>
                </div>
              </div>
            </div>

            {showContinueOption && sesion && (
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border-2 border-green-200">
                <h3 className="font-semibold text-green-900 mb-3 text-lg flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Continuar partida anterior
                </h3>
                <p className="text-green-800 mb-4">
                  Tenés una partida guardada con {sesion.participantes.length}{" "}
                  participante{sesion.participantes.length !== 1 && "s"}.
                  {sesion.sesionesCompletadas > 0 &&
                    ` Completaron ${sesion.sesionesCompletadas} ronda${
                      sesion.sesionesCompletadas > 1 ? "s" : ""
                    }.`}
                </p>
                <div className="flex flex-col md:flex-row gap-3">
                  <Button
                    onClick={handleContinueGame}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Continuar Jugando
                  </Button>
                  <Button
                    onClick={handleResetGame}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Empezar de Cero
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-sky-50 to-white p-6 rounded-lg border-2 border-sky-200">
              <h3 className="font-semibold text-sky-900 mb-3 text-lg">
                ¿Cómo jugar?
              </h3>
              <ol className="space-y-3 text-sky-800 mb-6">
                <li className="flex items-start gap-3">
                  <span className="bg-sky-600 text-white rounded-full min-w-[28px] w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </span>
                  <span>
                    Agregá los nombres de <strong>todos</strong> los
                    participantes
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-sky-600 text-white rounded-full min-w-[28px] w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </span>
                  <span>
                    Votar por la opción que se crea correcta y{" "}
                    <strong>
                      pasar el celular, o computadora, al siguiente participante
                    </strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-sky-600 text-white rounded-full min-w-[28px] w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </span>
                  <span>
                    Cuando <strong>todos hayan votado</strong>, presionar
                    &quot;Mostrar la respuesta correcta&quot;
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-sky-600 text-white rounded-full min-w-[28px] w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    4
                  </span>
                  <span>
                    Repetir por las <strong>10 preguntas</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-sky-600 text-white rounded-full min-w-[28px] w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    5
                  </span>
                  <span>
                    <strong>¡El que más puntos tenga gana!</strong>
                  </span>
                </li>
              </ol>

              <div className="border-t border-sky-200 pt-4">
                <h4 className="font-semibold text-sky-900 mb-3 text-base">
                  Puntaje
                </h4>
                <ul className="space-y-2 text-sky-800">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✔️</span>
                    <span>
                      Ganá <strong>1 punto por pregunta acertada</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">🔥</span>
                    <span>
                      <strong>¡Bonus por racha!</strong> Más puntos por
                      respuestas consecutivas correctas
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">⚠️</span>
                    <span>
                      <strong>Errar = 0 puntos</strong>, pero perdés tu racha
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center pt-4">
              <Button
                onClick={() => setShowModal(true)}
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold text-xl px-12 py-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                🎮 {showContinueOption ? "NUEVA PARTIDA" : "¡EMPEZAR A JUGAR!"}
              </Button>
            </div>

            {/* GitHub Link */}
            <div className="text-center pt-6 border-t border-sky-200">
              <div className="flex items-center justify-center gap-2 text-xs text-sky-600">
                <Link
                  href="https://x.com/chortjulio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 transition-colors"
                >
                  <span>Hecho por Julio Chort</span>
                </Link>
                <span>•</span>
                <Link
                  href="https://github.com/ChortJulio/paso-en-argentina"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Código abierto</span>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ParticipantesModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onStartGame={handleStartNewGame}
      />
    </div>
  );
}

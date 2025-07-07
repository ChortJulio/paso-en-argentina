"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Home, Volume2 } from "lucide-react";
import { ResultadosFinales } from "@/components/ResultadosFinales";
import { useSounds } from "@/hooks/useSounds";
import type { Pregunta, Participante, Voto } from "@/types/game";
import { useRouter } from "next/navigation";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export default function JugarPage() {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [votos, setVotos] = useState<Voto[]>([]);
  const [mostrarRespuesta, setMostrarRespuesta] = useState(false);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { playSelect, playCorrect, playIncorrect } = useSounds();
  const router = useRouter();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar participantes desde sessionStorage
        const participantesData = sessionStorage.getItem("participantes");
        if (!participantesData) {
          router.push("/");
          return;
        }
        setParticipantes(JSON.parse(participantesData));

        // Cargar preguntas desde la API
        const response = await fetch("/api/preguntas");
        if (!response.ok) throw new Error("Error al cargar preguntas");

        const preguntasData = await response.json();
        setPreguntas(preguntasData);
        setLoading(false);
      } catch (error) {
        console.error("Error cargando datos:", error);
        setError("Error al cargar el juego");
        setLoading(false);
      }
    };

    cargarDatos();
  }, [router]);

  const handleVoto = (participanteId: string, opcionIndex: number) => {
    if (mostrarRespuesta) return;

    playSelect();

    // Remover voto anterior del participante si existe
    const nuevosVotos = votos.filter(
      (v) => v.participanteId !== participanteId
    );
    // Agregar nuevo voto
    setVotos([...nuevosVotos, { participanteId, opcionIndex }]);
  };

  const getVotosParaOpcion = (opcionIndex: number) => {
    return votos
      .filter((v) => v.opcionIndex === opcionIndex)
      .map((v) => participantes.find((p) => p.id === v.participanteId)?.nombre)
      .filter(Boolean);
  };

  const handleMostrarRespuesta = () => {
    setMostrarRespuesta(true);

    const pregunta = preguntas[preguntaActual];
    const indiceCorrecta = pregunta.opciones.findIndex(
      (opcion) => opcion === pregunta.correcta
    );

    // Actualizar puntajes
    const participantesActualizados = participantes.map((participante) => {
      const votoParticipante = votos.find(
        (v) => v.participanteId === participante.id
      );
      if (votoParticipante) {
        const acerto = votoParticipante.opcionIndex === indiceCorrecta;
        return {
          ...participante,
          aciertos: participante.aciertos + (acerto ? 1 : 0),
          errores: participante.errores + (acerto ? 0 : 1),
          puntaje: participante.puntaje + (acerto ? 1 : 0),
        };
      }
      return {
        ...participante,
        errores: participante.errores + 1,
      };
    });

    setParticipantes(participantesActualizados);

    // Reproducir sonidos
    setTimeout(() => {
      const votosCorrectos = votos.filter(
        (v) => v.opcionIndex === indiceCorrecta
      );
      if (votosCorrectos.length > 0) {
        playCorrect();
      }
      if (votos.length > votosCorrectos.length) {
        setTimeout(() => playIncorrect(), 500);
      }
    }, 500);
  };

  const handleSiguiente = () => {
    if (preguntaActual < preguntas.length - 1) {
      setPreguntaActual(preguntaActual + 1);
      setMostrarRespuesta(false);
      setVotos([]);
    } else {
      setJuegoTerminado(true);
    }
  };

  const reiniciarJuego = () => {
    setPreguntaActual(0);
    setVotos([]);
    setMostrarRespuesta(false);
    setJuegoTerminado(false);
    setParticipantes(
      participantes.map((p) => ({ ...p, aciertos: 0, errores: 0, puntaje: 0 }))
    );
    // Cargar nuevas preguntas
    fetch("/api/preguntas")
      .then((res) => res.json())
      .then(setPreguntas)
      .catch(console.error);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center">
        <div className="text-white text-2xl">Cargando preguntas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white">
          <CardContent className="text-center p-6">
            <p className="text-red-600 mb-4">{error}</p>
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (juegoTerminado) {
    return (
      <ResultadosFinales
        participantes={participantes}
        onReiniciar={reiniciarJuego}
      />
    );
  }

  const pregunta = preguntas[preguntaActual];
  const indiceCorrecta = mostrarRespuesta
    ? pregunta.opciones.findIndex((opcion) => opcion === pregunta.correcta)
    : -1;

  return (
    <div className="relative">
      <Analytics />
      <SpeedInsights />
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-500 to-sky-600 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Link href="/">
              <Button
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Home className="mr-2 h-4 w-4" />
                Inicio
              </Button>
            </Link>
            <Badge
              variant="secondary"
              className="bg-white/90 text-sky-800 text-lg px-4 py-2 font-bold"
            >
              Pregunta {preguntaActual + 1} de {preguntas.length}
            </Badge>
          </div>

          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-sky-200">
            <CardHeader className="text-center pb-6 bg-gradient-to-r from-sky-50 to-white">
              <CardTitle className="text-2xl md:text-3xl text-sky-900 leading-tight">
                {pregunta.pregunta}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {pregunta.opciones.map((opcion, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-lg border-2 transition-all duration-300 ${
                      mostrarRespuesta
                        ? index === indiceCorrecta
                          ? "bg-green-50 border-green-500 shadow-lg transform scale-105"
                          : "bg-red-50 border-red-300 opacity-75"
                        : "bg-sky-50 border-sky-200 hover:bg-sky-100 hover:border-sky-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-lg font-medium text-gray-800 flex-1">
                        {opcion}
                      </p>
                      {mostrarRespuesta && (
                        <div className="ml-4">
                          {index === indiceCorrecta ? (
                            <CheckCircle className="h-8 w-8 text-green-600" />
                          ) : (
                            <XCircle className="h-8 w-8 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-sky-700">
                        <Volume2 className="h-4 w-4" />
                        <span>Votos:</span>
                      </div>
                      <div className="flex flex-wrap gap-2 min-h-[2rem]">
                        {getVotosParaOpcion(index).map((nombre, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="bg-white border-sky-300 text-sky-800"
                          >
                            {nombre}
                          </Badge>
                        ))}
                        {getVotosParaOpcion(index).length === 0 && (
                          <span className="text-gray-400 text-sm italic">
                            Sin votos
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!mostrarRespuesta && (
                <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-3">
                    Participantes:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {participantes.map((participante) => {
                      const yaVoto = votos.some(
                        (v) => v.participanteId === participante.id
                      );
                      return (
                        <div key={participante.id} className="flex gap-1">
                          {pregunta.opciones.map((_, opcionIndex) => (
                            <Button
                              key={opcionIndex}
                              size="sm"
                              variant={
                                yaVoto &&
                                votos.find(
                                  (v) => v.participanteId === participante.id
                                )?.opcionIndex === opcionIndex
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() =>
                                handleVoto(participante.id, opcionIndex)
                              }
                              className={`text-xs ${
                                yaVoto &&
                                votos.find(
                                  (v) => v.participanteId === participante.id
                                )?.opcionIndex === opcionIndex
                                  ? "bg-sky-600 text-white"
                                  : "border-sky-300 text-sky-700 hover:bg-sky-50"
                              }`}
                            >
                              {participante.nombre} → {opcionIndex + 1}
                            </Button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {mostrarRespuesta && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg animate-in slide-in-from-left duration-500">
                  <h3 className="font-semibold text-blue-900 mb-2 text-lg">
                    ✨ Explicación:
                  </h3>
                  <p className="text-blue-800 text-lg leading-relaxed">
                    {pregunta.explicacion}
                  </p>
                </div>
              )}

              <div className="flex justify-center pt-4">
                {!mostrarRespuesta ? (
                  <Button
                    onClick={handleMostrarRespuesta}
                    size="lg"
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold text-xl px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    🎭 Mostrar Respuesta Correcta
                  </Button>
                ) : (
                  <Button
                    onClick={handleSiguiente}
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold text-xl px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    {preguntaActual < preguntas.length - 1
                      ? "➡️ Siguiente Pregunta"
                      : "🏁 Ver Resultados"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

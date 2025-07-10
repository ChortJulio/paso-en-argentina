"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Home,
  Volume2,
  Trophy,
  AlertCircle,
  Users,
  X,
} from "lucide-react";
import { ResultadosFinales } from "@/components/ResultadosFinales";
import { ParticipanteSelector } from "@/components/ParticipanteSelector";
import { PosicionesModal } from "@/components/PosicionesModal";
import { LoadingTransition } from "@/components/LoadingTransition";
import { useSounds } from "@/hooks/useSounds";
import { useGamePersistence } from "@/hooks/useGamePersistence";
import type {
  Pregunta,
  // PreguntaCompleta,
  Participante,
  Voto,
} from "@/types/game";
import { useRouter } from "next/navigation";
import { fetchPreguntas, revelarRespuesta } from "@/utils/apiSecurity";

export default function JugarPage() {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [respuestas, setRespuestas] = useState<
    Record<string, { correcta: string; explicacion: string; fuente: string }>
  >({});
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [votos, setVotos] = useState<Voto[]>([]);
  const [mostrarRespuesta, setMostrarRespuesta] = useState(false);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingTransition, setLoadingTransition] = useState(false);
  const [loadingRespuesta, setLoadingRespuesta] = useState(false);
  const [error, setError] = useState("");
  const [showSelector, setShowSelector] = useState(false);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(-1);
  const [showPosiciones, setShowPosiciones] = useState(false);

  const {
    // playSelect,
    playCorrect,
    playIncorrect,
    initializeSounds,
    soundsEnabled,
  } = useSounds();
  const { sesion, isLoaded, guardarSesion, continuarSesion } =
    useGamePersistence();
  const router = useRouter();
  const hasInitialized = useRef(false);

  // Efecto para cargar datos iniciales solo una vez
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Evitar múltiples ejecuciones
        if (hasInitialized.current) return;

        // Esperar a que se cargue la sesión desde localStorage
        if (!isLoaded) return;

        // Verificar si hay sesión válida
        if (!sesion?.participantes?.length) {
          router.push("/");
          return;
        }

        hasInitialized.current = true;

        setParticipantes(sesion.participantes);
        setPreguntaActual(sesion.preguntaActual);
        setVotos(sesion.votos);
        setJuegoTerminado(sesion.juegoTerminado);

        // Cargar preguntas desde la API
        const preguntasData = await fetchPreguntas();
        setPreguntas(preguntasData);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar el juego:", error);
        setError("Error al cargar el juego");
        setLoading(false);
      }
    };

    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, router]);

  const calcularPuntajeConRacha = (rachaActual: number): number => {
    if (rachaActual === 0) return 1;
    if (rachaActual === 1) return 2;
    return 3;
  };

  const handleAbrirSelector = (opcionIndex: number) => {
    if (mostrarRespuesta) return;

    if (!soundsEnabled) {
      initializeSounds();
    }

    setOpcionSeleccionada(opcionIndex);
    setShowSelector(true);
  };

  const handleSeleccionarParticipante = (participanteId: string) => {
    // Remover voto anterior del participante si existe
    const nuevosVotos = votos.filter(
      (v) => v.participanteId !== participanteId
    );
    // Agregar nuevo voto
    const votosActualizados = [
      ...nuevosVotos,
      { participanteId, opcionIndex: opcionSeleccionada },
    ];
    setVotos(votosActualizados);

    // Cerrar el dialog si todos los participantes han votado
    if (votosActualizados.length === participantes.length) {
      setShowSelector(false);
    }
  };

  const handleQuitarVoto = (participanteId: string) => {
    const nuevosVotos = votos.filter(
      (v) => v.participanteId !== participanteId
    );
    setVotos(nuevosVotos);
  };

  const getParticipantesDisponibles = () => {
    const participantesQueVotaron = votos.map((v) => v.participanteId);
    return participantes.filter((p) => !participantesQueVotaron.includes(p.id));
  };

  const getVotosParaOpcion = (opcionIndex: number) => {
    return votos
      .filter((v) => v.opcionIndex === opcionIndex)
      .map((v) => {
        const participante = participantes.find(
          (p) => p.id === v.participanteId
        );
        return {
          participanteId: v.participanteId,
          nombre: participante?.nombre ?? "",
        };
      })
      .filter((v) => v.nombre);
  };

  const todosVotaron = () => {
    return votos.length === participantes.length;
  };

  const handleMostrarRespuesta = async () => {
    if (!todosVotaron()) return;

    setMostrarRespuesta(true);
    setLoadingRespuesta(true);

    const pregunta = preguntas[preguntaActual];

    try {
      // Obtener la respuesta correcta desde la API
      const respuestaData = await revelarRespuesta(pregunta.id);

      // Guardar la respuesta revelada
      setRespuestas((prev) => ({
        ...prev,
        [pregunta.id]: {
          correcta: respuestaData.correcta,
          explicacion: respuestaData.explicacion,
          fuente: respuestaData.fuente,
        },
      }));

      // Encontrar el índice de la respuesta correcta
      const indiceCorrecta = pregunta.opciones.findIndex(
        (opcion) => opcion?.trim() === respuestaData.correcta?.trim()
      );

      // Actualizar puntajes con sistema de rachas
      const participantesActualizados = participantes.map((participante) => {
        const votoParticipante = votos.find(
          (v) => v.participanteId === participante.id
        );
        if (votoParticipante) {
          const acerto = votoParticipante.opcionIndex === indiceCorrecta;
          const nuevaRacha = acerto ? participante.rachaActual + 1 : 0;
          const puntosGanados = acerto
            ? calcularPuntajeConRacha(participante.rachaActual)
            : 0;

          return {
            ...participante,
            aciertos: participante.aciertos + (acerto ? 1 : 0),
            errores: participante.errores + (acerto ? 0 : 1),
            puntaje: participante.puntaje + puntosGanados,
            rachaActual: nuevaRacha,
            mejorRacha: Math.max(participante.mejorRacha, nuevaRacha),
          };
        }
        return {
          ...participante,
          errores: participante.errores + 1,
          rachaActual: 0,
        };
      });

      setParticipantes(participantesActualizados);

      // Guardar estado después de actualizar puntajes
      if (isLoaded && sesion && hasInitialized.current) {
        const sesionActualizada = {
          ...sesion,
          participantes: participantesActualizados,
          preguntaActual,
          votos,
          juegoTerminado,
        };
        guardarSesion(sesionActualizada);
      }

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
    } catch (error) {
      console.error("Error al revelar respuesta:", error);
      // En caso de error, seguir con el juego sin respuesta correcta
    } finally {
      setLoadingRespuesta(false);
    }
  };

  const handleSiguiente = () => {
    setLoadingTransition(true);

    setTimeout(() => {
      if (preguntaActual < preguntas.length - 1) {
        const nuevaPregunta = preguntaActual + 1;
        setPreguntaActual(nuevaPregunta);
        setMostrarRespuesta(false);
        setVotos([]);

        // Guardar progreso al avanzar pregunta
        if (isLoaded && sesion && hasInitialized.current) {
          const sesionActualizada = {
            ...sesion,
            participantes,
            preguntaActual: nuevaPregunta,
            votos: [],
            juegoTerminado: false,
          };
          guardarSesion(sesionActualizada);
        }
      } else {
        setJuegoTerminado(true);

        // Guardar estado final
        if (isLoaded && sesion && hasInitialized.current) {
          const sesionActualizada = {
            ...sesion,
            participantes,
            preguntaActual,
            votos,
            juegoTerminado: true,
          };
          guardarSesion(sesionActualizada);
        }
      }
      setLoadingTransition(false);
    }, 1500);
  };

  const reiniciarJuego = () => {
    if (sesion) {
      const participantesReset = participantes.map((p) => ({
        ...p,
        aciertos: 0,
        errores: 0,
        puntaje: 0,
        rachaActual: 0,
        mejorRacha: 0,
      }));
      continuarSesion(participantesReset);

      setPreguntaActual(0);
      setVotos([]);
      setMostrarRespuesta(false);
      setJuegoTerminado(false);
      setRespuestas({}); // Limpiar respuestas reveladas
      setLoadingRespuesta(false); // Resetear estado de loading

      // Reset initialization flag
      hasInitialized.current = false;

      // Cargar nuevas preguntas
      fetchPreguntas()
        .then((preguntasData) => {
          setPreguntas(preguntasData);
        })
        .catch(console.error);
    }
  };

  // Función auxiliar para determinar el tipo de fuente y el texto del enlace
  const getFuenteInfo = (fuente: string) => {
    if (!fuente) return null;

    const isYoutube =
      fuente.includes("youtube.com") || fuente.includes("youtu.be");
    const isInstagram = fuente.includes("instagram.com");
    const isTikTok = fuente.includes("tiktok.com");

    if (isYoutube) {
      return { icon: "🎥", text: "Ver video en YouTube", type: "video" };
    } else if (isInstagram) {
      return { icon: "📸", text: "Ver en Instagram", type: "social" };
    } else if (isTikTok) {
      return { icon: "🎬", text: "Ver en TikTok", type: "social" };
    } else {
      return { icon: "📰", text: "Leer artículo completo", type: "article" };
    }
  };

  if (loading) {
    return <LoadingTransition mensaje="Cargando preguntas..." />;
  }

  if (loadingTransition) {
    return <LoadingTransition />;
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
  const respuestaActual = respuestas[pregunta.id];
  const indiceCorrecta =
    mostrarRespuesta && respuestaActual
      ? pregunta.opciones.findIndex(
          (opcion) => opcion?.trim() === respuestaActual.correcta?.trim()
        )
      : -1;
  const participantesFaltantes = participantes.length - votos.length;

  return (
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

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowPosiciones(true)}
              variant="outline"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <Trophy className="mr-2 h-4 w-4" />
              Posiciones
            </Button>
            <Badge
              variant="secondary"
              className="bg-white/90 text-sky-800 text-sm px-4 py-2 font-bold"
            >
              Pregunta {preguntaActual + 1} de {preguntas.length}
            </Badge>
          </div>
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
                    mostrarRespuesta && !loadingRespuesta
                      ? index === indiceCorrecta
                        ? "bg-green-50 border-green-500 shadow-lg transform scale-105"
                        : "bg-red-50 border-red-300 opacity-75"
                      : mostrarRespuesta && loadingRespuesta
                      ? "bg-blue-50 border-blue-200"
                      : "bg-sky-50 border-sky-200 hover:bg-sky-100 hover:border-sky-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-lg font-medium text-gray-800 flex-1">
                      {opcion}
                    </p>
                    <div className="flex items-center gap-2">
                      {mostrarRespuesta && !loadingRespuesta && (
                        <div>
                          {index === indiceCorrecta ? (
                            <CheckCircle className="h-8 w-8 text-green-600" />
                          ) : (
                            <XCircle className="h-8 w-8 text-red-500" />
                          )}
                        </div>
                      )}
                      {mostrarRespuesta && loadingRespuesta && (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      )}
                      {!mostrarRespuesta && (
                        <Button
                          onClick={() => handleAbrirSelector(index)}
                          size="sm"
                          className="bg-sky-600 hover:bg-sky-700 text-white"
                        >
                          <Users className="h-4 w-4 mr-1" />
                          Votar
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-sky-700">
                      <Volume2 className="h-4 w-4" />
                      <span>Votos ({getVotosParaOpcion(index).length}):</span>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[2rem]">
                      {getVotosParaOpcion(index).map((voto, i) => (
                        <div
                          key={`${voto.participanteId}-${i}`}
                          className="flex items-center gap-1"
                        >
                          <Badge
                            variant="outline"
                            className="bg-white border-sky-300 text-sky-800"
                          >
                            {voto.nombre}
                          </Badge>
                          {!mostrarRespuesta && (
                            <button
                              onClick={() =>
                                handleQuitarVoto(voto.participanteId)
                              }
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-0.5 transition-colors"
                              title={`Quitar voto de ${voto.nombre}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
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

            {!mostrarRespuesta && participantesFaltantes > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800 mb-2">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-semibold">
                    Faltan votar: {participantesFaltantes} participante
                    {participantesFaltantes > 1 ? "s" : ""}
                  </span>
                </div>
                <p className="text-sm text-yellow-700">
                  Todos los participantes deben votar antes de revelar la
                  respuesta.
                </p>
              </div>
            )}

            {mostrarRespuesta && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg animate-in slide-in-from-left duration-500">
                <h3 className="font-semibold text-blue-900 mb-2 text-lg">
                  ✨ Explicación:
                </h3>
                {loadingRespuesta ? (
                  <div className="flex items-center gap-3 text-blue-800">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-lg">
                      Verificando respuesta correcta...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-blue-800 text-lg leading-relaxed">
                      {respuestaActual?.explicacion ||
                        "Explicación no disponible"}
                    </p>
                    {respuestaActual?.fuente && (
                      <div className="border-t border-blue-200 pt-4">
                        {(() => {
                          const fuenteInfo = getFuenteInfo(
                            respuestaActual.fuente
                          );
                          return fuenteInfo ? (
                            <a
                              href={respuestaActual.fuente}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors group"
                            >
                              <span className="text-xl">{fuenteInfo.icon}</span>
                              <span className="group-hover:underline">
                                {fuenteInfo.text}
                              </span>
                              <svg
                                className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path>
                                <path d="M5 5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-2a1 1 0 10-2 0v2H5V7h2a1 1 0 000-2H5z"></path>
                              </svg>
                            </a>
                          ) : (
                            <span className="text-blue-600 text-sm">
                              Fuente disponible
                            </span>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-center pt-4">
              {!mostrarRespuesta ? (
                <Button
                  onClick={handleMostrarRespuesta}
                  disabled={!todosVotaron()}
                  size="lg"
                  className={`font-bold text-xl px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform transition-all duration-200 ${
                    todosVotaron()
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black hover:scale-105"
                      : "bg-gray-400 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  🎭 Mostrar Respuesta Correcta
                </Button>
              ) : (
                <Button
                  onClick={handleSiguiente}
                  disabled={loadingRespuesta}
                  size="lg"
                  className={`bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold text-xl px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
                    loadingRespuesta ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loadingRespuesta ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Cargando...
                    </>
                  ) : preguntaActual < preguntas.length - 1 ? (
                    "➡️ Siguiente Pregunta"
                  ) : (
                    "🏁 Ver Resultados"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <ParticipanteSelector
        isOpen={showSelector}
        onClose={() => setShowSelector(false)}
        participantesDisponibles={getParticipantesDisponibles()}
        onSeleccionar={handleSeleccionarParticipante}
        opcionTexto={
          opcionSeleccionada >= 0 ? pregunta.opciones[opcionSeleccionada] : ""
        }
      />

      <PosicionesModal
        isOpen={showPosiciones}
        onClose={() => setShowPosiciones(false)}
        participantes={participantes}
        preguntaActual={preguntaActual}
        totalPreguntas={preguntas.length}
      />
    </div>
  );
}

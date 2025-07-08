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
import type { Pregunta, Participante, Voto } from "@/types/game";
import { useRouter } from "next/navigation";

export default function JugarPage() {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [votos, setVotos] = useState<Voto[]>([]);
  const [mostrarRespuesta, setMostrarRespuesta] = useState(false);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingTransition, setLoadingTransition] = useState(false);
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
        console.log("Carga primera pregunta API");
        const response = await fetch("/api/preguntas");
        if (!response.ok) throw new Error("Error al cargar preguntas");

        const preguntasData = await response.json();
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

  const handleMostrarRespuesta = () => {
    if (!todosVotaron()) return;

    setMostrarRespuesta(true);

    const pregunta = preguntas[preguntaActual];
    const indiceCorrecta = pregunta.opciones.findIndex(
      (opcion) => opcion === pregunta.correcta
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

      // Reset initialization flag
      hasInitialized.current = false;

      // Cargar nuevas preguntas
      console.log("Recargando preguntas API");
      fetch("/api/preguntas")
        .then((res) => res.json())
        .then(setPreguntas)
        .catch(console.error);
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
  const indiceCorrecta = mostrarRespuesta
    ? pregunta.opciones.findIndex((opcion) => opcion === pregunta.correcta)
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
                    <div className="flex items-center gap-2">
                      {mostrarRespuesta && (
                        <div>
                          {index === indiceCorrecta ? (
                            <CheckCircle className="h-8 w-8 text-green-600" />
                          ) : (
                            <XCircle className="h-8 w-8 text-red-500" />
                          )}
                        </div>
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
                <p className="text-blue-800 text-lg leading-relaxed">
                  {pregunta.explicacion}
                </p>
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

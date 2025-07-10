"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Home, Volume2, Trophy } from "lucide-react";
import { ResultadosFinales } from "@/components/ResultadosFinales";
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
  const [loadingRespuesta, setLoadingRespuesta] = useState(false);
  const [error, setError] = useState("");
  const [showPosiciones, setShowPosiciones] = useState(false);

  // Nuevos estados para el flujo por turnos
  const [participanteActual, setParticipanteActual] =
    useState<Participante | null>(null);
  const [esperandoTurno, setEsperandoTurno] = useState(true); // Pantalla "Es el turno de X"
  const [votandoEnTurno, setVotandoEnTurno] = useState(false); // Dentro del turno votando
  const [opcionSeleccionadaEnTurno, setOpcionSeleccionadaEnTurno] =
    useState(-1);
  const [
    todosVotaronPendienteConfirmacion,
    setTodosVotaronPendienteConfirmacion,
  ] = useState(false);
  const [mostrandoCambioVoto, setMostrandoCambioVoto] = useState(false);

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

        // Inicializar el primer turno si no hay votos
        if (sesion.votos.length === 0) {
          const primerParticipante =
            sesion.participantes[
              Math.floor(Math.random() * sesion.participantes.length)
            ];
          setParticipanteActual(primerParticipante);
          setEsperandoTurno(true);
        }

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

  // Función para seleccionar un participante aleatorio que no haya votado en la ronda actual
  const seleccionarSiguienteParticipante = (votosActuales = votos) => {
    // Usar los votos actuales pasados como parámetro o el estado actual
    const participantesQueVotaron = votosActuales.map((v) => v.participanteId);
    const participantesSinVotar = participantes.filter(
      (p) => !participantesQueVotaron.includes(p.id)
    );

    if (participantesSinVotar.length > 0) {
      const indiceAleatorio = Math.floor(
        Math.random() * participantesSinVotar.length
      );
      return participantesSinVotar[indiceAleatorio];
    }
    return null;
  };

  // Comenzar el turno del participante actual
  const comenzarTurno = () => {
    setEsperandoTurno(false);
    setVotandoEnTurno(true);
    setOpcionSeleccionadaEnTurno(-1);
  };

  // Seleccionar una opción durante el turno
  const seleccionarOpcionEnTurno = (opcionIndex: number) => {
    if (!votandoEnTurno) return;
    setOpcionSeleccionadaEnTurno(opcionIndex);
  };

  // Confirmar el voto del participante actual
  const confirmarVoto = () => {
    if (!participanteActual || opcionSeleccionadaEnTurno === -1) return;

    // Remover voto anterior del participante si existe
    const nuevosVotos = votos.filter(
      (v) => v.participanteId !== participanteActual.id
    );

    // Agregar nuevo voto
    const votosActualizados = [
      ...nuevosVotos,
      {
        participanteId: participanteActual.id,
        opcionIndex: opcionSeleccionadaEnTurno,
      },
    ];
    setVotos(votosActualizados);

    // Verificar si quedan participantes por votar usando los votos actualizados
    const siguienteParticipante =
      seleccionarSiguienteParticipante(votosActualizados);

    if (siguienteParticipante) {
      // Hay más participantes, pasar al siguiente
      setParticipanteActual(siguienteParticipante);
      setEsperandoTurno(true);
      setVotandoEnTurno(false);
      setOpcionSeleccionadaEnTurno(-1);
    } else {
      // Todos votaron, mostrar confirmación
      setVotandoEnTurno(false);
      setEsperandoTurno(false);
      setTodosVotaronPendienteConfirmacion(true);
    }
  };

  // Permitir cambio de voto
  const permitirCambioVoto = () => {
    setMostrandoCambioVoto(true);
    setTodosVotaronPendienteConfirmacion(false);
  };

  // Cambiar voto de un participante específico
  const cambiarVotoParticipante = (participanteId: string) => {
    const participante = participantes.find((p) => p.id === participanteId);
    if (participante) {
      setParticipanteActual(participante);
      setMostrandoCambioVoto(false);
      setVotandoEnTurno(true);
      setOpcionSeleccionadaEnTurno(-1);
    }
  };

  // Proceder sin cambiar votos
  const procederSinCambios = async () => {
    setTodosVotaronPendienteConfirmacion(false);
    setMostrandoCambioVoto(false);

    // Mostrar la respuesta
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

          if (acerto) {
            const nuevaRacha = participante.rachaActual + 1;
            const puntajeGanado = calcularPuntajeConRacha(
              participante.rachaActual
            );

            if (!soundsEnabled) {
              initializeSounds();
            }
            playCorrect();

            return {
              ...participante,
              aciertos: participante.aciertos + 1,
              puntaje: participante.puntaje + puntajeGanado,
              rachaActual: nuevaRacha,
              mejorRacha: Math.max(participante.mejorRacha, nuevaRacha),
            };
          } else {
            if (!soundsEnabled) {
              initializeSounds();
            }
            playIncorrect();

            return {
              ...participante,
              errores: participante.errores + 1,
              rachaActual: 0,
            };
          }
        }
        return participante;
      });

      setParticipantes(participantesActualizados);
      setLoadingRespuesta(false);

      // Guardar sesión actualizada
      guardarSesion({
        participantes: participantesActualizados,
        preguntaActual,
        votos,
        juegoTerminado: false,
        sesionesCompletadas: 0,
        totalPreguntas: preguntas.length,
      });
    } catch (error) {
      console.error("Error al obtener la respuesta:", error);
      setLoadingRespuesta(false);
    }
  };

  const getVotosParaOpcion = (opcionIndex: number) => {
    // Solo devolver votos si se mostró la respuesta
    if (!mostrarRespuesta) return [];

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

  const handleSiguiente = () => {
    if (preguntaActual < preguntas.length - 1) {
      // Ir a la siguiente pregunta
      const nuevaPregunta = preguntaActual + 1;
      setPreguntaActual(nuevaPregunta);

      // Reiniciar estados para la nueva pregunta
      setVotos([]);
      setMostrarRespuesta(false);
      setTodosVotaronPendienteConfirmacion(false);
      setMostrandoCambioVoto(false);
      setVotandoEnTurno(false);
      setOpcionSeleccionadaEnTurno(-1);
      setLoadingRespuesta(false);

      // Seleccionar primer participante aleatorio para la nueva pregunta
      const primerParticipante =
        participantes[Math.floor(Math.random() * participantes.length)];
      setParticipanteActual(primerParticipante);
      setEsperandoTurno(true);

      // Guardar progreso
      guardarSesion({
        participantes,
        preguntaActual: nuevaPregunta,
        votos: [],
        juegoTerminado: false,
        sesionesCompletadas: 0,
        totalPreguntas: preguntas.length,
      });
    } else {
      // Terminar el juego
      setJuegoTerminado(true);
      guardarSesion({
        participantes,
        preguntaActual: preguntaActual,
        votos,
        juegoTerminado: true,
        sesionesCompletadas: 1,
        totalPreguntas: preguntas.length,
      });
    }
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

  // Renderizar pantalla según el estado actual
  const renderizarPantalla = () => {
    // Pantalla: Esperando turno (Es el turno de X)
    if (esperandoTurno && participanteActual) {
      const participantesQueVotaron = votos.length;
      const totalParticipantes = participantes.length;
      const progreso = (participantesQueVotaron / totalParticipantes) * 100;

      return (
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-sky-200 max-w-2xl mx-auto">
          <CardHeader className="text-center pb-6 bg-gradient-to-r from-sky-50 to-white">
            <CardTitle className="text-3xl md:text-4xl text-sky-900 leading-tight">
              🎯 Es el turno de
            </CardTitle>
            <div className="text-4xl md:text-6xl font-black text-yellow-600 mt-4">
              {participanteActual.nombre}
            </div>
          </CardHeader>
          <CardContent className="text-center p-8">
            <p className="text-lg text-sky-800 mb-6">
              Preparate para votar en la pregunta {preguntaActual + 1} de{" "}
              {preguntas.length}
            </p>

            {/* Indicador de progreso */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-sky-700">
                  Progreso de votación
                </span>
                <span className="text-sm font-bold text-sky-900">
                  {participantesQueVotaron} de {totalParticipantes}
                </span>
              </div>

              {/* Barra de progreso */}
              <div className="w-full bg-sky-100 rounded-full h-3 shadow-inner">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${progreso}%` }}
                ></div>
              </div>

              {/* Participantes que ya votaron */}
              {participantesQueVotaron > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-sky-600 mb-2">Ya votaron:</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {votos.map((voto) => {
                      const participante = participantes.find(
                        (p) => p.id === voto.participanteId
                      );
                      return participante ? (
                        <span
                          key={voto.participanteId}
                          className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full border border-green-200"
                        >
                          ✓ {participante.nombre}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={comenzarTurno}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-xl px-12 py-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              🚀 Comenzar mi turno
            </Button>
          </CardContent>
        </Card>
      );
    }

    // Pantalla: Votando en turno
    if (votandoEnTurno && participanteActual) {
      return (
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-sky-200">
          <CardHeader className="text-center pb-6 bg-gradient-to-r from-sky-50 to-white">
            <CardTitle className="text-2xl md:text-3xl text-sky-900 leading-tight">
              {pregunta.pregunta}
            </CardTitle>
            <div className="mt-4 text-lg font-semibold text-green-700">
              Votando: {participanteActual.nombre}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              {pregunta.opciones.map((opcion, index) => (
                <button
                  key={index}
                  onClick={() => seleccionarOpcionEnTurno(index)}
                  className={`p-6 rounded-lg border-2 transition-all duration-300 text-left ${
                    opcionSeleccionadaEnTurno === index
                      ? "bg-yellow-50 border-yellow-500 shadow-lg transform scale-105"
                      : "bg-sky-50 border-sky-200 hover:bg-sky-100 hover:border-sky-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-medium text-gray-800 flex-1">
                      {opcion}
                    </p>
                    {opcionSeleccionadaEnTurno === index && (
                      <CheckCircle className="h-8 w-8 text-yellow-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="text-center pt-4">
              <Button
                onClick={confirmarVoto}
                disabled={opcionSeleccionadaEnTurno === -1}
                size="lg"
                className={`font-bold text-xl px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform transition-all duration-200 ${
                  opcionSeleccionadaEnTurno !== -1
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:scale-105"
                    : "bg-gray-400 text-gray-600 cursor-not-allowed"
                }`}
              >
                ✅ Confirmar mi voto
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Pantalla: Todos votaron, opción de cambiar voto
    if (todosVotaronPendienteConfirmacion) {
      const totalParticipantes = participantes.length;

      return (
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-sky-200 max-w-2xl mx-auto">
          <CardHeader className="text-center pb-6 bg-gradient-to-r from-green-50 to-white">
            <CardTitle className="text-3xl md:text-4xl text-green-900 leading-tight">
              ✅ ¡Todos han votado!
            </CardTitle>

            {/* Indicador de completado */}
            <div className="mt-4 max-w-sm mx-auto">
              <div className="flex items-center justify-center mb-3">
                <span className="text-sm font-bold text-green-800">
                  {totalParticipantes} de {totalParticipantes} participantes
                </span>
              </div>
              <div className="w-full bg-green-100 rounded-full h-3">
                <div className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full w-full animate-pulse"></div>
              </div>
              <div className="flex flex-wrap gap-1 justify-center mt-3">
                {votos.map((voto) => {
                  const participante = participantes.find(
                    (p) => p.id === voto.participanteId
                  );
                  return participante ? (
                    <span
                      key={voto.participanteId}
                      className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full border border-green-200"
                    >
                      ✓ {participante.nombre}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-center p-8 space-y-6">
            <p className="text-lg text-gray-800">
              ¿Alguno desea cambiar su voto antes de revelar la respuesta?
            </p>

            <div className="flex flex-col gap-4">
              <Button
                onClick={permitirCambioVoto}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xl px-8 py-4 rounded-full"
              >
                🔄 Cambiar un voto
              </Button>

              <Button
                onClick={procederSinCambios}
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold text-xl px-8 py-4 rounded-full"
              >
                🎭 Revelar respuesta correcta
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Pantalla: Seleccionar participante para cambiar voto
    if (mostrandoCambioVoto) {
      return (
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-sky-200 max-w-2xl mx-auto">
          <CardHeader className="text-center pb-6 bg-gradient-to-r from-orange-50 to-white">
            <CardTitle className="text-2xl md:text-3xl text-orange-900 leading-tight">
              🔄 ¿Quién quiere cambiar su voto?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {participantes.map((participante) => (
                <Button
                  key={participante.id}
                  onClick={() => cambiarVotoParticipante(participante.id)}
                  variant="outline"
                  className="justify-start p-4 h-auto border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium text-orange-900">
                      {participante.nombre}
                    </span>
                    <Badge className="bg-orange-100 text-orange-800">
                      {participante.puntaje}pts
                    </Badge>
                  </div>
                </Button>
              ))}
            </div>

            <div className="text-center pt-4">
              <Button
                onClick={() => {
                  setMostrandoCambioVoto(false);
                  setTodosVotaronPendienteConfirmacion(true);
                }}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Pantalla: Mostrar respuesta correcta
    if (mostrarRespuesta) {
      const respuestaActual = respuestas[pregunta.id];
      const indiceCorrecta = respuestaActual
        ? pregunta.opciones.findIndex(
            (opcion) => opcion?.trim() === respuestaActual.correcta?.trim()
          )
        : -1;

      return (
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-sky-200">
          <CardHeader className="text-center pb-6 bg-gradient-to-r from-sky-50 to-white">
            <CardTitle className="text-2xl md:text-3xl text-sky-900 leading-tight">
              {pregunta.pregunta}
            </CardTitle>
            <div className="mt-4 text-xl font-semibold text-green-700">
              ✅ Respuesta revelada
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mostrar opciones con resultados */}
            <div className="grid gap-4">
              {pregunta.opciones.map((opcion, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-lg border-2 transition-all duration-300 ${
                    loadingRespuesta
                      ? "bg-blue-50 border-blue-200"
                      : index === indiceCorrecta
                      ? "bg-green-50 border-green-500 shadow-lg transform scale-105"
                      : "bg-red-50 border-red-300 opacity-75"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-lg font-medium text-gray-800 flex-1">
                      {opcion}
                    </p>
                    <div className="flex items-center gap-2">
                      {loadingRespuesta ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      ) : (
                        <div>
                          {index === indiceCorrecta ? (
                            <CheckCircle className="h-8 w-8 text-green-600" />
                          ) : (
                            <XCircle className="h-8 w-8 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mostrar quién votó por cada opción */}
                  {!loadingRespuesta && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-sky-700">
                        <Volume2 className="h-4 w-4" />
                        <span>Votos ({getVotosParaOpcion(index).length}):</span>
                      </div>
                      <div className="flex flex-wrap gap-2 min-h-[2rem]">
                        {getVotosParaOpcion(index).map((voto, i) => (
                          <Badge
                            key={`${voto.participanteId}-${i}`}
                            variant="outline"
                            className="bg-white border-sky-300 text-sky-800"
                          >
                            {voto.nombre}
                          </Badge>
                        ))}
                        {getVotosParaOpcion(index).length === 0 && (
                          <span className="text-gray-400 text-sm italic">
                            Sin votos
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Explicación */}
            {!loadingRespuesta && respuestaActual && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
                <h3 className="font-bold text-blue-900 text-xl mb-3 flex items-center gap-2">
                  🔍 Explicación
                </h3>
                <p className="text-blue-800 text-lg leading-relaxed mb-4">
                  {respuestaActual.explicacion}
                </p>
                {respuestaActual.fuente && (
                  <div className="border-t border-blue-200 pt-4">
                    <p className="text-blue-700 font-medium mb-2">📚 Fuente:</p>
                    {(() => {
                      const fuenteInfo = getFuenteInfo(respuestaActual.fuente);
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

            {/* Loading de explicación */}
            {loadingRespuesta && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                <div className="flex items-center gap-3 text-blue-800">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-lg">
                    Verificando respuesta correcta...
                  </span>
                </div>
              </div>
            )}

            {/* Botón siguiente */}
            <div className="text-center pt-4">
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
            </div>
          </CardContent>
        </Card>
      );
    }

    // Pantalla por defecto: mostrar pregunta normal (para depuración)
    return (
      <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-sky-200">
        <CardHeader className="text-center pb-6 bg-gradient-to-r from-sky-50 to-white">
          <CardTitle className="text-2xl md:text-3xl text-sky-900 leading-tight">
            {pregunta.pregunta}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            Estado del juego no reconocido
          </p>
        </CardContent>
      </Card>
    );
  };

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

        {renderizarPantalla()}
      </div>

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

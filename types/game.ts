export interface Pregunta {
  id: string;
  pregunta: string;
  opciones: string[];
  categoria: string;
  // correcta y explicacion se obtienen después via API separada
}

export interface PreguntaCompleta extends Pregunta {
  correcta: string;
  explicacion: string;
  fuente: string;
}

export interface Participante {
  id: string;
  nombre: string;
  aciertos: number;
  errores: number;
  puntaje: number;
  rachaActual: number;
  mejorRacha: number;
}

export interface Voto {
  participanteId: string;
  opcionIndex: number;
}

export interface SesionJuego {
  participantes: Participante[];
  preguntaActual: number;
  votos: Voto[];
  juegoTerminado: boolean;
  totalPreguntas: number;
  sesionesCompletadas: number;
}

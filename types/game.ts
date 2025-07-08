export interface Pregunta {
  id: string;
  pregunta: string;
  opciones: string[];
  correcta: string;
  explicacion: string;
  categoria: string;
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

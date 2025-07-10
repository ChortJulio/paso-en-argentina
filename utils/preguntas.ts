import { createClient } from "@/utils/supabase/server";
import type { Pregunta } from "@/types/game";

export async function obtenerPreguntasAleatorias(
  limite: number = 10
): Promise<Pregunta[]> {
  try {
    const supabase = createClient();

    // Obtener preguntas aleatorias
    const { data: rows, error } = await supabase
      .from("preguntas_random")
      .select()
      .limit(limite);

    if (error) {
      throw new Error(`Error al obtener preguntas: ${error.message}`);
    }

    // Transformar los datos para el frontend
    const preguntas: Pregunta[] = (rows ?? []).map((row) => ({
      id: row.id,
      pregunta: row.pregunta,
      opciones: [row.correcta, row.alternativa_1, row.alternativa_2].sort(
        () => Math.random() - 0.5
      ),
      correcta: row.correcta,
      explicacion: row.explicacion,
      categoria: row.categoria,
    }));

    return preguntas;
  } catch (error) {
    console.error("Error fetching preguntas:", error);
    throw new Error("Error al cargar preguntas");
  }
}

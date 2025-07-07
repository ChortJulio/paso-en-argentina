import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createClient();
    // Obtener 10 preguntas aleatorias
    const { data: rows } = await supabase
      .from("preguntas_random")
      .select()
      .limit(10);

    // Transformar los datos para el frontend
    const preguntas = (rows ?? []).map((row) => ({
      id: row.id,
      pregunta: row.pregunta,
      opciones: [row.correcta, row.alternativa_1, row.alternativa_2].sort(
        () => Math.random() - 0.5
      ),
      correcta: row.correcta,
      explicacion: row.explicacion,
      categoria: row.categoria,
    }));

    return NextResponse.json(preguntas);
  } catch (error) {
    console.error("Error fetching preguntas:", error);
    return NextResponse.json(
      { error: "Error al cargar preguntas" },
      { status: 500 }
    );
  }
}

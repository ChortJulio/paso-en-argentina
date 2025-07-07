import { sql } from "@vercel/postgres"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Obtener 10 preguntas aleatorias
    const { rows } = await sql`
      SELECT id, pregunta, correcta, alternativa_1, alternativa_2, explicacion, categoria
      FROM preguntas 
      ORDER BY RANDOM() 
      LIMIT 10
    `

    // Transformar los datos para el frontend
    const preguntas = rows.map((row) => ({
      id: row.id,
      pregunta: row.pregunta,
      opciones: [row.correcta, row.alternativa_1, row.alternativa_2].sort(() => Math.random() - 0.5),
      correcta: row.correcta,
      explicacion: row.explicacion,
      categoria: row.categoria,
    }))

    return NextResponse.json(preguntas)
  } catch (error) {
    console.error("Error fetching preguntas:", error)
    return NextResponse.json({ error: "Error al cargar preguntas" }, { status: 500 })
  }
}

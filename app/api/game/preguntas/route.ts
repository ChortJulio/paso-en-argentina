import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { validateSessionToken } from "@/utils/sessionAuth";

// Función para mezclar un array usando el algoritmo Fisher-Yates
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET(request: Request) {
  try {
    // 1. Verificación de rate limiting básico usando headers
    const userAgent = request.headers.get("user-agent");
    const xForwardedFor = request.headers.get("x-forwarded-for");
    const clientIP = xForwardedFor?.split(",")[0]?.trim() || "unknown";

    // 2. Verificar que la petición viene del mismo dominio
    const referer = request.headers.get("referer");
    const origin = request.headers.get("origin");

    // Usar variables de entorno para los dominios permitidos
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_SITE_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      process.env.NODE_ENV === "development" ? "http://localhost:3000" : null,
      process.env.PRODUCTION_DOMAIN,
      process.env.ALLOWED_DOMAIN_1,
      process.env.ALLOWED_DOMAIN_2,
    ].filter(Boolean);

    // 3. Verificación estricta de origen
    if (!referer && !origin) {
      console.warn(
        `[SECURITY] Request without referer/origin from IP: ${clientIP}`
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const requestOrigin = origin || new URL(referer || "").origin;
    const isAllowedOrigin = allowedOrigins.some((allowed) => {
      if (!allowed) return false;

      try {
        const allowedUrl = new URL(allowed);
        const requestUrl = new URL(requestOrigin);

        // Comparación exacta de host y protocolo
        return (
          allowedUrl.host === requestUrl.host &&
          allowedUrl.protocol === requestUrl.protocol
        );
      } catch {
        return false;
      }
    });

    if (!isAllowedOrigin) {
      console.warn(
        `[SECURITY] Unauthorized origin: ${requestOrigin} from IP: ${clientIP}`
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 4. Verificación adicional de User-Agent para detectar bots maliciosos
    if (!userAgent || userAgent.length < 10) {
      console.warn(
        `[SECURITY] Suspicious user-agent: ${userAgent} from IP: ${clientIP}`
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 5. Verificación de token de sesión (si está habilitada la autenticación avanzada)
    if (process.env.NODE_ENV === "production" && process.env.API_SECRET_KEY) {
      const sessionToken = request.headers.get("x-session-token");

      if (!sessionToken) {
        console.warn(`[SECURITY] Missing session token from IP: ${clientIP}`);
        return NextResponse.json(
          { error: "Session token required" },
          { status: 401 }
        );
      }

      if (!validateSessionToken(sessionToken, requestOrigin)) {
        console.warn(`[SECURITY] Invalid session token from IP: ${clientIP}`);
        return NextResponse.json(
          { error: "Invalid or expired session token" },
          { status: 401 }
        );
      }
    }

    const supabase = createClient();

    // Obtener 10 preguntas aleatorias
    const { data: rows, error } = await supabase
      .from("preguntas_random")
      .select()
      .limit(10);

    if (error) {
      throw new Error(`Error al obtener preguntas: ${error.message}`);
    }

    // Transformar los datos para el frontend SIN exponer las respuestas correctas hasta que se necesiten
    const preguntas = (rows ?? []).map((row) => {
      // Crear todas las opciones y limpiar posibles espacios en blanco
      const todasLasOpciones = [
        row.correcta?.trim(),
        row.alternativa_1?.trim(),
        row.alternativa_2?.trim(),
      ].filter(Boolean); // Filtrar valores vacíos o null

      // Mezclar aleatoriamente las opciones usando Fisher-Yates
      const opcionesMezcladas = shuffleArray(todasLasOpciones);

      return {
        id: row.id,
        pregunta: row.pregunta,
        opciones: opcionesMezcladas, // Solo opciones mezcladas
        categoria: row.categoria,
        // NO incluir correcta ni explicacion aquí - se obtendrán después
      };
    });

    return NextResponse.json(preguntas);
  } catch (error) {
    console.error("Error fetching preguntas:", error);
    return NextResponse.json(
      { error: "Error al cargar preguntas" },
      { status: 500 }
    );
  }
}

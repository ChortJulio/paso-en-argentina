import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { validateSessionToken } from "@/utils/sessionAuth";

export async function POST(request: Request) {
  try {
    // 1. Verificar que la petición viene del mismo dominio
    const referer = request.headers.get("referer");
    const origin = request.headers.get("origin");
    const userAgent = request.headers.get("user-agent");
    const xForwardedFor = request.headers.get("x-forwarded-for");
    const clientIP = xForwardedFor?.split(",")[0]?.trim() || "unknown";

    const allowedOrigins = [
      process.env.NEXT_PUBLIC_SITE_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      process.env.NODE_ENV === "development" ? "http://localhost:3000" : null,
      process.env.PRODUCTION_DOMAIN,
      process.env.ALLOWED_DOMAIN_1,
      process.env.ALLOWED_DOMAIN_2,
    ].filter(Boolean);

    if (!referer && !origin) {
      console.warn(
        `[SECURITY] Answer request without referer/origin from IP: ${clientIP}`
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const requestOrigin = origin || new URL(referer || "").origin;
    const isAllowedOrigin = allowedOrigins.some((allowed) => {
      if (!allowed) return false;

      try {
        const allowedUrl = new URL(allowed);
        const requestUrl = new URL(requestOrigin);
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
        `[SECURITY] Unauthorized answer request from: ${requestOrigin} IP: ${clientIP}`
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Verificación de User-Agent
    if (!userAgent || userAgent.length < 10) {
      console.warn(
        `[SECURITY] Suspicious user-agent for answer request: ${userAgent} from IP: ${clientIP}`
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Verificación de token de sesión (en producción)
    if (process.env.NODE_ENV === "production" && process.env.API_SECRET_KEY) {
      const sessionToken = request.headers.get("x-session-token");

      if (!sessionToken) {
        console.warn(
          `[SECURITY] Missing session token for answer request from IP: ${clientIP}`
        );
        return NextResponse.json(
          { error: "Session token required" },
          { status: 401 }
        );
      }

      if (!validateSessionToken(sessionToken, requestOrigin)) {
        console.warn(
          `[SECURITY] Invalid session token for answer request from IP: ${clientIP}`
        );
        return NextResponse.json(
          { error: "Invalid or expired session token" },
          { status: 401 }
        );
      }
    }

    // 4. Obtener el ID de la pregunta del body
    const body = await request.json();
    const { preguntaId } = body;

    if (!preguntaId) {
      return NextResponse.json(
        { error: "preguntaId es requerido" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // 5. Obtener solo la respuesta correcta, explicación y fuente de la pregunta específica
    const { data: pregunta, error } = await supabase
      .from("preguntas_random")
      .select("correcta, explicacion, fuente")
      .eq("id", preguntaId)
      .single();

    if (error) {
      console.error("Error al obtener respuesta:", error);
      return NextResponse.json(
        { error: "Error al obtener respuesta" },
        { status: 500 }
      );
    }

    if (!pregunta) {
      return NextResponse.json(
        { error: "Pregunta no encontrada" },
        { status: 404 }
      );
    }

    console.log(
      `[INFO] Answer revealed for question ${preguntaId} from IP: ${clientIP}`
    );

    return NextResponse.json({
      correcta: pregunta.correcta?.trim(),
      explicacion: pregunta.explicacion,
      fuente: pregunta.fuente,
    });
  } catch (error) {
    console.error("Error revealing answer:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

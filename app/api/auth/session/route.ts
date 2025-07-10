import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";

export async function POST(request: Request) {
  try {
    // 1. Verificar que la petición viene del mismo dominio
    const referer = request.headers.get("referer");
    const origin = request.headers.get("origin");

    const allowedOrigins = [
      process.env.NEXT_PUBLIC_SITE_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      process.env.NODE_ENV === "development" ? "http://localhost:3000" : null,
      process.env.PRODUCTION_DOMAIN,
      process.env.ALLOWED_DOMAIN_1,
      process.env.ALLOWED_DOMAIN_2,
    ].filter(Boolean);

    if (!referer && !origin) {
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
        `[SECURITY] Unauthorized token request from: ${requestOrigin}`
      );
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Generar token temporal
    const timestamp = Date.now();
    const randomData = randomBytes(16).toString("hex");
    const salt = process.env.SESSION_SALT || "default-salt";
    const secretKey = process.env.API_SECRET_KEY || "";

    // Crear un hash único basado en timestamp, datos aleatorios y secretos del servidor
    const tokenData = `${timestamp}-${randomData}-${requestOrigin}`;
    const token = createHash("sha256")
      .update(tokenData + salt + secretKey)
      .digest("hex");

    // 3. Configurar expiración (default: 1 hora)
    const expirySeconds = parseInt(process.env.SESSION_TOKEN_EXPIRY || "3600");
    const expiresAt = timestamp + expirySeconds * 1000;

    // 4. El token incluye su timestamp de expiración para validación
    const sessionToken = `${token}.${expiresAt}`;

    console.log(`[AUTH] Generated session token for origin: ${requestOrigin}`);

    return NextResponse.json({
      token: sessionToken,
      expiresAt,
      expiresIn: expirySeconds,
    });
  } catch (error) {
    console.error("Error generating session token:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

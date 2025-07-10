/**
 * Utilidad para hacer peticiones seguras a la API del juego
 */

interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean;
}

// Variable global para almacenar el token de sesión actual
let currentSessionToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Obtiene un token de sesión temporal del servidor
 */
async function getSessionToken(): Promise<string> {
  try {
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get session token: ${response.status}`);
    }

    const data = await response.json();
    currentSessionToken = data.token;
    tokenExpiresAt = data.expiresAt;

    return data.token;
  } catch (error) {
    console.error("Error getting session token:", error);
    throw error;
  }
}

/**
 * Verifica si el token actual es válido
 */
function isTokenValid(): boolean {
  return currentSessionToken !== null && Date.now() < tokenExpiresAt;
}

/**
 * Obtiene un token válido (actual o nuevo)
 */
async function getValidToken(): Promise<string> {
  if (isTokenValid()) {
    return currentSessionToken!;
  }

  return await getSessionToken();
}

/**
 * Realiza una petición segura a la API del juego
 */
export async function secureApiRequest(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const { requireAuth = true, headers = {}, ...requestOptions } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  // Agregar token de sesión en producción si está habilitada la autenticación
  if (requireAuth && process.env.NODE_ENV === "production") {
    try {
      const token = await getValidToken();
      requestHeaders["x-session-token"] = token;
    } catch (error) {
      console.error("Failed to get session token:", error);
      throw new Error("Authentication failed");
    }
  }

  return fetch(endpoint, {
    headers: requestHeaders,
    ...requestOptions,
  });
}

/**
 * Obtiene las preguntas del juego de forma segura
 */
export async function fetchPreguntas() {
  try {
    const response = await secureApiRequest("/api/game/preguntas");

    if (!response.ok) {
      throw new Error(`Error al cargar preguntas: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching preguntas:", error);
    throw error;
  }
}

/**
 * Revela la respuesta correcta de una pregunta específica
 */
export async function revelarRespuesta(preguntaId: string) {
  try {
    const response = await secureApiRequest("/api/game/revelar", {
      method: "POST",
      body: JSON.stringify({ preguntaId }),
    });

    if (!response.ok) {
      throw new Error(`Error al revelar respuesta: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error revealing answer:", error);
    throw error;
  }
}

/**
 * Genera una clave API aleatoria para uso en desarrollo/testing
 */
export function generateApiKey(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

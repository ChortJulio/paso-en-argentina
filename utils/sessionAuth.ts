/**
 * Valida un token de sesión temporal
 */
export function validateSessionToken(token: string, origin: string): boolean {
  try {
    // El token tiene formato: hash.timestamp
    const [tokenHash, expirationStr] = token.split(".");

    if (!tokenHash || !expirationStr) {
      return false;
    }

    const expirationTime = parseInt(expirationStr);
    const currentTime = Date.now();

    // Verificar si el token ha expirado
    if (currentTime > expirationTime) {
      console.warn(`[AUTH] Expired token from origin: ${origin}`);
      return false;
    }

    // El token es válido por ahora - en una implementación más robusta,
    // aquí podrías validar el hash contra una lista de tokens activos
    // almacenados en una base de datos o cache (Redis, etc.)

    return true;
  } catch (error) {
    console.error("Error validating session token:", error);
    return false;
  }
}

/**
 * Extrae información del token sin validarlo completamente
 */
export function getTokenInfo(token: string): {
  expiresAt: number;
  isExpired: boolean;
} {
  try {
    const [, expirationStr] = token.split(".");
    const expiresAt = parseInt(expirationStr) || 0;
    const isExpired = Date.now() > expiresAt;

    return { expiresAt, isExpired };
  } catch {
    return { expiresAt: 0, isExpired: true };
  }
}

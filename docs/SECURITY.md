# Seguridad de la API - ¿Pasó en Argentina?

Este documento explica las medidas de seguridad implementadas para proteger la API del juego, especialmente importante al ser un proyecto open source.

## 🔒 Capas de Seguridad Implementadas

### 1. Verificación de Origen (Origin/Referer)

- **Qué hace**: Verifica que las peticiones vengan únicamente de dominios autorizados
- **Configuración**: Variables de entorno en `.env`
- **Beneficio**: Previene peticiones desde sitios web no autorizados

### 2. Validación de User-Agent

- **Qué hace**: Bloquea bots maliciosos y scripts automatizados simples
- **Implementación**: Verifica que el User-Agent tenga una longitud mínima
- **Beneficio**: Primera barrera contra scraping automatizado

### 3. Autenticación por Tokens de Sesión Temporales

- **Qué hace**: Genera tokens temporales únicos para cada sesión de juego
- **Funcionamiento**:
  1. Frontend solicita token a `/api/auth/session`
  2. Servidor genera token único con timestamp de expiración
  3. Token se incluye en peticiones posteriores como `x-session-token`
- **Beneficio**: No hay claves secretas expuestas en el cliente, tokens expiran automáticamente

### 4. Logging de Seguridad

- **Qué hace**: Registra intentos de acceso no autorizados
- **Información loggeada**: IP, origen, user-agent
- **Beneficio**: Permite monitorear ataques y patrones sospechosos

### 5. Rate Limiting a Nivel de Headers

- **Qué hace**: Detecta y registra peticiones sospechosas
- **Implementación**: Análisis de headers HTTP
- **Beneficio**: Detecta comportamiento anómalo

## 🛠️ Configuración

### Variables de Entorno Requeridas

```bash
# Dominios permitidos
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
PRODUCTION_DOMAIN=https://www.tu-dominio.com
ALLOWED_DOMAIN_1=https://dominio-adicional.com

# Clave secreta del servidor (NUNCA debe ser pública)
API_SECRET_KEY=tu_clave_super_secreta_aquí

# Configuración de tokens de sesión
SESSION_TOKEN_EXPIRY=3600  # Tiempo de vida en segundos (1 hora)
SESSION_SALT=tu_salt_único_aquí
```

### Generación de API Key Segura

```bash
# Opción 1: OpenSSL
openssl rand -base64 32

# Opción 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Opción 3: Función incluida en el proyecto
import { generateApiKey } from '@/utils/apiSecurity';
console.log(generateApiKey());
```

## 📋 Niveles de Protección

### Desarrollo (`NODE_ENV=development`)

- ✅ Verificación de origen (permite localhost:3000)
- ✅ Validación de User-Agent
- ❌ API Key (opcional)
- ✅ Logging de seguridad

### Producción (`NODE_ENV=production`)

- ✅ Verificación de origen (solo dominios configurados)
- ✅ Validación de User-Agent
- ✅ API Key (si está configurada)
- ✅ Logging de seguridad
- ✅ Verificación estricta de protocolos (HTTPS)

## 🚨 Respuestas de Seguridad

| Código | Razón                 | Descripción                                 |
| ------ | --------------------- | ------------------------------------------- |
| 403    | Forbidden             | Origen no autorizado o falta referer/origin |
| 401    | Unauthorized          | API Key inválida o faltante                 |
| 500    | Internal Server Error | Error en la base de datos o servidor        |

## 📊 Monitoreo

Los logs de seguridad aparecen en la consola del servidor con el prefijo `[SECURITY]`:

```
[SECURITY] Request without referer/origin from IP: 192.168.1.100
[SECURITY] Unauthorized origin: https://malicious-site.com from IP: 10.0.0.5
[SECURITY] Suspicious user-agent: Bot from IP: 203.0.113.1
[SECURITY] Invalid API key from IP: 198.51.100.2
```

## 🔧 Implementación en el Frontend

El proyecto incluye utilidades para hacer peticiones seguras:

```typescript
import { fetchPreguntas, secureApiRequest } from "@/utils/apiSecurity";

// Forma recomendada
const preguntas = await fetchPreguntas();

// Petición personalizada
const response = await secureApiRequest("/api/custom", {
  method: "POST",
  body: JSON.stringify(data),
  includeApiKey: true,
});
```

## ⚠️ Consideraciones de Seguridad

### Variables Públicas

- `NEXT_PUBLIC_API_SECRET_KEY` es visible en el cliente
- Sirve como primera barrera, no como seguridad absoluta
- El verdadero control está en el servidor (`API_SECRET_KEY`)

### Limitaciones

- La verificación de origen puede ser bypass con herramientas avanzadas
- API Key visible en el cliente no es 100% segura
- Para máxima seguridad, considera implementar autenticación de usuarios

### Recomendaciones Adicionales

1. **Rotar API Keys regularmente** en producción
2. **Monitorear logs** para detectar patrones de ataque
3. **Implementar rate limiting** a nivel de infraestructura (Vercel, Cloudflare)
4. **Usar HTTPS siempre** en producción
5. **Considerar CAPTCHA** para peticiones excesivas

## 🔄 Actualización de Seguridad

Para actualizar las medidas de seguridad:

1. Modifica las variables de entorno
2. Reinicia la aplicación
3. Verifica los logs para confirmar funcionamiento
4. Testa desde diferentes dominios para validar restricciones

## 📚 Recursos Adicionales

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [Vercel Security](https://vercel.com/docs/security)

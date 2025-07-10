# 🇦🇷 ¿Pasó en Argentina?

<div align="center">

![Logo del juego](public/og-image.png)

**El juego de noticias increíbles pero reales sobre Argentina**

[![Demo](https://img.shields.io/badge/🎮_Demo-Jugar_Ahora-yellow?style=for-the-badge)](https://www.paso-en-argentina.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Código_Abierto-blue?style=for-the-badge&logo=github)](https://github.com/ChortJulio/paso-en-argentina)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

</div>

## 🎯 ¿Qué es esto?

**¿Pasó en Argentina?** es un juego interactivo de preguntas y respuestas donde los jugadores deben adivinar si noticias increíbles realmente ocurrieron en Argentina.

### 🌟 Características principales

- 🎮 **Para grupos**: Hasta 25 participantes simultáneos
- 🏆 **Sistema de puntuación**: 1 punto por acierto + bonus por rachas
- ⚡ **Dinámico**: Pasar el celular o computadora al siguiente jugador
- 🔥 **Sistema de rachas**: Otorga más puntos por respuestas consecutivas
- 🎯 **Competitivo**: Ranking en tiempo real de participantes
- 📱 **Responsive**: Funciona en móviles, tablets y desktop
- 💾 **Progreso guardado**: Continúa partidas donde las dejaste

## 🎲 ¿Cómo se juega?

1. **Agrega participantes**: Cada jugador ingresa su nombre
2. **Votación obligatoria**: Todos deben votar en cada pregunta
3. **Pasar el dispositivo**: El jugador actual pasa el celular o computadora al siguiente
4. **Sistema de puntos**:
   - ✅ **1 punto** por respuesta correcta
   - 🔥 **2 puntos** en racha de 1 acierto
   - 🔥 **3 puntos** en racha de 2+ aciertos consecutivos
   - ❌ **0 puntos** por error (se pierde la racha)
5. **Compite**: ¡El que más puntos tenga gana!

## 🚀 Demo en vivo

**👉 [Jugar ahora en paso-en-argentina.com](https://www.paso-en-argentina.com/)**

## 🛠️ Instalación local

### Prerequisitos

- Node.js 18+
- npm, yarn, pnpm o bun

### Paso a paso

1. **Clona el repositorio**

   ```bash
   git clone https://github.com/ChortJulio/paso-en-argentina.git
   cd paso-en-argentina
   ```

2. **Instala las dependencias**

   ```bash
   npm install
   # o
   yarn install
   # o
   pnpm install
   ```

3. **Configura las variables de entorno**

   ```bash
   cp .env.example
   ```

   > **Nota**: Actualmente se requieren variables de entorno especiales. El juego funciona PARCIALMENTE en el frontend.

4. **Inicia el servidor de desarrollo**

   ```bash
   npm run dev
   # o
   yarn dev
   # o
   pnpm dev
   ```

5. **¡Listo!** Abre [http://localhost:3000](http://localhost:3000) en tu navegador

### Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build para producción
npm run start    # Servidor de producción
npm run lint     # Ejecutar linter
```

## 🏗️ Stack tecnológico

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Componentes**: [Radix UI](https://www.radix-ui.com/)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Deploy**: [Vercel](https://vercel.com/)

## 🔒 Características de Seguridad

Este proyecto incluye múltiples capas de seguridad para proteger la API:

- **Verificación de origen**: Solo dominios autorizados pueden acceder a la API
- **API Key opcional**: Protección adicional en producción
- **Logging de seguridad**: Monitoreo de intentos de acceso no autorizados
- **Validación de User-Agent**: Bloqueo de bots maliciosos básicos

Para más detalles, consulta la [documentación de seguridad](docs/SECURITY.md).

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Lee nuestra [guía de contribución](CONTRIBUTING.md) para saber cómo participar.

### Formas de contribuir

- 🐛 Reportar bugs
- 💡 Sugerir nuevas funcionalidades
- 📝 Mejorar la documentación
- 🎨 Mejorar el diseño
- ❓ Agregar más preguntas al juego

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**ChortJulio**

- GitHub: [@ChortJulio](https://github.com/ChortJulio)
- Twitter: [@chortjulio](https://twitter.com/chortjulio)

---

<div align="center">

**¿Te gustó el proyecto? ¡Dale una ⭐ en GitHub!**

[🎮 Jugar ahora](https://www.paso-en-argentina.com/) • [🐛 Reportar bug](https://github.com/ChortJulio/paso-en-argentina/issues) • [💡 Sugerir feature](https://github.com/ChortJulio/paso-en-argentina/issues)

</div>

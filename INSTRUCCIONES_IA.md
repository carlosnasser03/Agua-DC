# Protocolo Maestro: Análisis y Capacitación de Agua DC

Este documento contiene las instrucciones exactas para que un IA (como Claude o Antigravity) realice una inmersión completa en la aplicación, identifique puntos de falla y eleve las capacidades del sistema.

---

## Directriz General para la IA
"Actúa como un Arquitecto de Software Senior y Especialista en Ciberseguridad. Tu objetivo es mapear la arquitectura completa de Agua DC (Backend NestJS, Admin Panel React, App Móvil Flutter), detectar inconsistencias técnicas y proponer/ejecutar mejoras siguiendo principios de **Zero Trust** y **Clean Architecture**."

---

## Fase 1: Mapeo de Ecosistema y Estructura
1.  Lista y analiza la estructura de directorios en `Agua DC/` y `AguaDC V2/`.
2.  Identifica las dependencias clave en cada `package.json` y `pubspec.yaml`.
3.  Lee el archivo `backend/src/prisma/schema.prisma` para entender el modelo de datos actual.
4.  Verifica la configuración de Docker (`docker-compose.yml`, `Dockerfile`) para asegurar la consistencia del entorno de desarrollo.

---

## Fase 2: Auditoría de Integridad y Errores
1.  **Backend:** Revisa los servicios de NestJS en `backend/src/`. Busca logs de error, validaciones faltantes en DTOs y manejo de excepciones global.
2.  **Base de Datos:** Verifica si hay migraciones pendientes y si los tipos de Prisma coinciden con lo esperado por el frontend.
3.  **Frontend/Mobile:** Revisa la conexión con el API. Asegúrate de que las URLs de base y los tokens de autenticación estén bien gestionados.
4.  **Limpieza:** Detecta "dead code" y propón su eliminación.

---

## Fase 3: Hardening y Seguridad (Zero Trust)
1.  Audita los endpoints del backend: Asegura el uso de `@UseGuards(JwtAuthGuard)`.
2.  Verifica el manejo de archivos: Valida tipos y tamaños.
3.  Revisa el flujo de "Citizen Reports": Asegura que la generación de tokens por dispositivo sea robusta.

---

## Fase 4: Expansión de Capacidades
1.  Implementa la lógica necesaria para los módulos faltantes (ej: Reportes Ciudadanos, Notificaciones Push).
2.  Optimiza la carga de datos (Paginación, Caching).
3.  Mejora el UI/UX con diseños premium y micro-animaciones.

---

## Fase 5: Documentación y Memoria
1.  Genera `ARCHITECTURE.md`.
2.  Mantén un `CHANGELOG.md`.
3.  Crea ítems de conocimiento (KIs) para mantener el contexto.

---

## Cómo Ejecutar este Plan
Provee el contenido de este archivo al iniciar una sesión con la IA.

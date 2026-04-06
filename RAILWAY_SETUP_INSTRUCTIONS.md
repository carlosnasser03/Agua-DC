# Railway Setup - Instrucciones Paso a Paso

Guía rápida para configurar y desplegar AguaDC V2 en Railway.

---

## Paso 1: Instalación de Herramientas (5 minutos)

### 1.1 Instalar Node.js (si no lo tienes)
- Descargar: https://nodejs.org/ (versión 20 LTS)
- Instalar
- Verificar:
  ```bash
  node --version    # debe ser v20.x.x
  npm --version     # debe ser 9.x.x
  ```

### 1.2 Instalar Railway CLI
```bash
npm install -g @railway/cli
railway --version
```

---

## Paso 2: Crear Cuenta Railway (5 minutos)

1. Ir a https://railway.app
2. Click en **Sign Up**
3. Crear cuenta (email, Google, GitHub)
4. Confirmar email
5. Login

---

## Paso 3: Crear Proyecto en Railway (10 minutos)

### 3.1 En Railway UI
1. Click en **+ New Project**
2. Nombrar: `AguaDC V2`
3. Click en **+ New Service**
4. Seleccionar **Database → PostgreSQL**
5. Esperar a que se cree (2-3 minutos)

### 3.2 Verificar que PostgreSQL está listo
- En el dashboard verás la variable `DATABASE_URL` creada automáticamente
- Copiar esta URL (la necesitarás después)

---

## Paso 4: Autenticarse con Railway CLI (5 minutos)

```bash
railway login
```

Esto abrirá una ventana del navegador para autenticarte. Después:

```bash
railway whoami
# Debe mostrar tu email de Railway
```

---

## Paso 5: Pre-Deployment Check (5 minutos)

Antes de desplegar, verifica que todo está bien:

```powershell
# Desde la raíz del proyecto
.\railway-check.ps1 -Environment staging
```

Este script verifica:
- ✓ Node.js y npm
- ✓ Railway CLI
- ✓ Archivos requeridos
- ✓ TypeScript compilation
- ✓ Tests

Si falla algo, el script te indicará qué arreglar.

---

## Paso 6: Configurar Variables de Entorno en Railway (10 minutos)

1. En Railway Dashboard:
   - Ir a: **Projects → AguaDC V2**
   - Click en el servicio `api` (o el que creaste)
   - Click en **Variables** (tab)

2. Agregar estas variables:

   ```
   NODE_ENV = production
   PORT = 3000
   JWT_EXPIRATION = 24h
   ADMIN_PANEL_URL = https://staging-admin.aguadc.hn
   INITIAL_ADMIN_USER = carlos_admin
   ```

3. **Generar valores seguros** para:

   **JWT_SECRET** (debe tener min 32 caracteres, usar generador online):
   ```
   JWT_SECRET = [generar algo como: abc123XYZ!@#$%^&*()_+-=[]{}|;',.<>?/~ ... mínimo 32 caracteres]
   ```

   **INITIAL_ADMIN_PASS**:
   ```
   INITIAL_ADMIN_PASS = [crear contraseña segura, ej: Clave@2026#Temporal123]
   ```

4. **DATABASE_URL** ya debe estar creada automáticamente por Railway

5. Click en **Save** o **Deploy** después de cada cambio

---

## Paso 7: Deploy a Staging (5-10 minutos)

### Opción A: Script PowerShell (Recomendado)

```powershell
cd C:\ruta\a\AguaDC-V2
.\deploy-script.ps1 -Environment staging
```

El script automáticamente:
1. Verifica requisitos
2. Ejecuta tests
3. Compila el código
4. Sube a Railway
5. Verifica logs

### Opción B: Manual via CLI

```bash
cd backend
railway link        # Link al proyecto (selecciona AguaDC V2)
railway up          # Deploy
railway logs -f     # Ver logs en tiempo real
```

### Opción C: Auto-deploy via GitHub

1. Hacer push a rama `staging`:
   ```bash
   git push origin staging
   ```

2. Railway detectará automáticamente y desplegará

---

## Paso 8: Verificar que el Deployment Funcionó (10 minutos)

### 8.1 Ver logs
```bash
railway logs --tail 50
```

Buscar mensajes como:
```
[SeedService] Creating admin role...
[SeedService] Creating initial admin user...
[NestFactory] Application successfully started
```

### 8.2 Obtener URL del servicio
```bash
railway status
# O
railway open    # Abre en navegador
```

### 8.3 Test del API

```bash
# Health check
curl https://your-service.railway.app/api/health

# Swagger UI (ver todos los endpoints)
https://your-service.railway.app/api/docs

# Test login
curl -X POST https://your-service.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlos_admin",
    "password": "Clave@2026#Temporal123",
    "strategyName": "jwt"
  }'
```

Si el login retorna un JWT token, ¡felicidades! El backend funciona.

---

## Paso 9: Deploy a Production (cuando estés listo)

⚠️ **Solo después de probar completamente en staging**

### 9.1 Crear entorno production en Railway

En Railway UI:
1. Ir a: **Project → Settings → Environments**
2. Click en **+ New Environment**
3. Nombrar: `production`
4. Copiar todas las variables de `staging`
5. Actualizar `ADMIN_PANEL_URL` a production URL

### 9.2 Deploy
```powershell
.\deploy-script.ps1 -Environment production
```

### 9.3 Verificar
```bash
railway logs --tail 100
railway open
```

---

## Troubleshooting Rápido

### "Build failed"
```bash
cd backend
npm install
npm run build
# Revisar errores, arreglar, hacer git push
```

### "Database connection error"
```bash
# Verificar DATABASE_URL en Railway UI
# Debe verse así: postgresql://user:pass@host:port/db?sslmode=require

# Si no está, crear nueva BD:
# En Railway UI: + New Service → Database → PostgreSQL
```

### "Prisma migration failed"
```bash
railway run npx prisma migrate deploy
```

### "Port already in use"
```bash
# Railway automáticamente asigna puerto, pero verifica:
# En Railway UI → Variables → PORT debe ser 3000
# El servicio expondrá en puerto 443/80
```

---

## Próximos Pasos

1. **Deploy Admin Panel**
   - Similar pero en diferente servicio de Railway
   - URL de API será: https://your-api.railway.app/api

2. **Deploy Mobile App**
   - Usar Expo EAS para iOS/Android
   - Configurar `EXPO_PUBLIC_API_URL_PROD` con URL de Railway

3. **Configurar dominio personalizado**
   - En Railway UI → Project → Domain
   - Apuntar DNS a Railway

4. **Monitoreo**
   - Railway incluye logs en tiempo real
   - Configurar alertas en planes pagos

---

## Comandos Útiles

```bash
# Ver status
railway status

# Ver deployments
railway deployments

# Ver logs
railway logs --tail 50
railway logs --follow

# Ejecutar comando en el servicio
railway run npm test
railway run npx prisma studio

# Abrir en navegador
railway open

# Ver variables
railway variables

# Reiniciar servicio
railway redeploy    # Pero esto redeploya, no solo reinicia
```

---

## Preguntas Frecuentes

**P: ¿Puedo usar Railway gratis?**
R: Sí, Railway da $5/mes gratis. AguaDC V2 cabe fácilmente en eso. Después cobran por uso.

**P: ¿Dónde veo las migraciones de base de datos?**
R: En los logs: `railway logs | grep -i "migrate"`

**P: ¿Cómo reseteo la base de datos?**
R: En Railway UI → Database → puede resetear desde ahí (⚠️ borra todos los datos)

**P: ¿Cómo cambio la contraseña de admin después?**
R: Via API o directamente en la base de datos con Prisma Studio:
```bash
railway run npx prisma studio
```

**P: ¿Qué pasa si hay error 401 después de deploy?**
R: Verificar que `JWT_SECRET` es igual en todas partes. Si cambió, redeploy:
```bash
railway up
```

---

## Soportar

- Railway Help: https://railway.app/support
- Discord NestJS: https://discord.gg/nestjs
- GitHub Issues: Crear issue en el repo

---

**Tiempo total estimado: 45-60 minutos**

Empezar desde Paso 1 si nunca has usado Railway.

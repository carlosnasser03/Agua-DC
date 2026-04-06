# 🚀 GUÍA DE EJECUCIÓN DEPLOYMENT - RAILWAY

**Fecha**: 2026-04-06
**Duración Total Estimada**: ~25 minutos
**Entorno**: Staging (aguadc-staging.up.railway.app)

---

## 📋 ÍNDICE

1. [Preparación](#1-preparación)
2. [Autenticación](#2-autenticación)
3. [Configuración de Proyecto](#3-configuración-de-proyecto)
4. [Variables de Entorno](#4-variables-de-entorno)
5. [Deployment](#5-deployment)
6. [Verificación](#6-verificación)
7. [Troubleshooting](#7-troubleshooting)
8. [Rollback](#8-rollback)

---

## 1. PREPARACIÓN ⏱️ (5 minutos)

### Paso 1.1: Descargar Railway CLI

**Windows (PowerShell):**
```powershell
iwr https://cli.railway.app/install.ps1 -useb | iex
```

**Mac/Linux (Bash):**
```bash
curl -sSL https://cli.railway.app/install.sh | sh
```

### Paso 1.2: Verificar Instalación

```powershell
railway --version
```

**Resultado esperado:**
```
railway/v6.x.x (o versión más reciente)
```

### Paso 1.3: Ubicarse en la Carpeta Correcta

```powershell
cd "C:\ruta\a\AguaDC V2\backend"
```

**Verificar que estás en la carpeta correcta:**
```powershell
pwd
# Debe mostrar: ...AguaDC V2\backend
ls
# Debe mostrar: package.json, src/, prisma/, etc.
```

---

## 2. AUTENTICACIÓN ⏱️ (2 minutos)

### Paso 2.1: Iniciar Sesión en Railway

```powershell
railway login
```

**Qué esperar ver:**
1. Se abrirá tu navegador predeterminado
2. Verás la página de login de Railway (https://railway.app)
3. Inicia sesión con tu cuenta de Railway
4. Serás redirigido a una página de confirmación
5. En PowerShell aparecerá:
   ```
   ✓ Successfully logged in
   ```

**Si no se abre el navegador:**
- Railway te dará un código/URL para copiar en el navegador manualmente
- Copia el código mostrado en PowerShell
- Pega en el navegador
- Completa el login

### Paso 2.2: Verificar Autenticación

```powershell
railway whoami
```

**Resultado esperado:**
```
You are logged in as: <tu-email@example.com>
```

---

## 3. CONFIGURACIÓN DE PROYECTO ⏱️ (3 minutos)

### Paso 3.1: Vincular Proyecto Existente

```powershell
railway link
```

**Qué esperar ver:**
```
? Select a project (Use arrow keys)
❯ AguaDC-Staging
  AguaDC-Production
  (Create new project)
```

**Acción:**
- Selecciona `AguaDC-Staging` con las flechas del teclado
- Presiona ENTER

**Resultado esperado:**
```
✓ Linked to project: AguaDC-Staging
✓ Environment: staging
```

### Paso 3.2: Verificar Proyecto Vinculado

```powershell
railway status
```

**Resultado esperado:**
```
Project: AguaDC-Staging
Environment: staging
Status: Ready
```

---

## 4. VARIABLES DE ENTORNO ⏱️ (5 minutos)

### Paso 4.1: Listar Variables Actuales

```powershell
railway variables
```

**Resultado esperado:**
```
DATABASE_URL = postgresql://...
JWT_SECRET = agua_dc_secure_secret_2026
...
```

### Paso 4.2: Copiar Variables desde .env.staging

**Opción A: Copiar una por una (manual, más seguro)**

```powershell
# Abre el archivo .env.staging en tu editor
# Copia cada variable y usa este comando:

railway variables set <NOMBRE_VARIABLE>=<VALOR>
```

**Ejemplo:**
```powershell
railway variables set JWT_SECRET="agua_dc_secure_secret_2026"
railway variables set JWT_EXPIRATION="24h"
railway variables set PORT="3000"
railway variables set NODE_ENV="staging"
railway variables set ADMIN_PANEL_URL="https://aguadc-staging.up.railway.app"
railway variables set INITIAL_ADMIN_USER="carlos_admin"
railway variables set INITIAL_ADMIN_PASS="Tu_Clave_Secreta_Aqui_2026!"
```

**Opción B: Desde archivo .env (automático)**

Si tu entorno soporta archivos:
```powershell
# Primero, asegúrate de tener .env.staging en la raíz
cat .env.staging | ForEach-Object {
    if ($_ -match '^[^#]' -and $_ -match '=') {
        railway variables set $_
    }
}
```

### Paso 4.3: Verificar Variables Guardadas

```powershell
railway variables
```

**Verificar que aparezcan todas estas variables:**
- ✅ DATABASE_URL
- ✅ JWT_SECRET
- ✅ JWT_EXPIRATION
- ✅ PORT
- ✅ NODE_ENV
- ✅ ADMIN_PANEL_URL
- ✅ INITIAL_ADMIN_USER
- ✅ INITIAL_ADMIN_PASS

---

## 5. DEPLOYMENT ⏱️ (5 minutos)

### Paso 5.1: Iniciar Deployment

```powershell
railway up
```

**Qué esperar ver:**

```
🚀 Starting deployment...

📦 Building backend service...
  - Installing dependencies...
  - Building application...
  ✓ Build completed

🔄 Deploying to Railway...
  - Pushing Docker image...
  - Starting service...
  ✓ Service started

📊 Deployment Status:
  Project: AguaDC-Staging
  Service: backend
  Status: Running
  URL: https://aguadc-staging.up.railway.app

✨ Deployment completed successfully!
```

### Paso 5.2: Esperar a que se Estabilice

El deployment toma **3-5 minutos** para:
- Construir la imagen Docker
- Descargar dependencias
- Inicializar la base de datos
- Iniciar la aplicación

**En PowerShell verás:**
```
⏳ Waiting for service to be ready...
✓ Service is ready
```

---

## 6. VERIFICACIÓN ⏱️ (5 minutos)

### Paso 6.1: Ver Logs en Tiempo Real

```powershell
railway logs
```

**Qué buscar:**
```
✓ Database migrations completed
✓ Seed service initialized
✓ NestJS application started
✓ Swagger documentation ready
```

**Presiona CTRL+C para salir de los logs**

### Paso 6.2: Verificar API Documentation

Abre en tu navegador:
```
https://aguadc-staging.up.railway.app/api/docs
```

**Resultado esperado:**
- Ves la interfaz de Swagger
- Todos los endpoints listados
- Status de la API: `200 OK`

### Paso 6.3: Test de Login

**Opción A: Con Swagger UI (más fácil)**

1. Ve a: `https://aguadc-staging.up.railway.app/api/docs`
2. Busca el endpoint `POST /api/auth/login`
3. Haz clic en "Try it out"
4. Copia este JSON en el request body:
   ```json
   {
     "email": "carlos_admin",
     "password": "Tu_Clave_Secreta_Aqui_2026!",
     "strategyName": "jwt"
   }
   ```
5. Haz clic en "Execute"

**Resultado esperado:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid...",
    "email": "carlos_admin",
    "role": "Super Admin"
  }
}
```

**Opción B: Con PowerShell (cURL)**

```powershell
$url = "https://aguadc-staging.up.railway.app/api/auth/login"
$body = @{
    email = "carlos_admin"
    password = "Tu_Clave_Secreta_Aqui_2026!"
    strategyName = "jwt"
} | ConvertTo-Json

Invoke-WebRequest -Uri $url -Method POST -ContentType "application/json" -Body $body
```

### Paso 6.4: Copiar Access Token

Del response anterior, copia el valor de `access_token` (la cadena larga que comienza con `eyJ...`)

### Paso 6.5: Test de Refresh Token

**En Swagger UI:**

1. Busca el endpoint `POST /api/auth/refresh`
2. Haz clic en "Try it out"
3. En el header, agrega:
   ```
   Authorization: Bearer <PEGA_TU_ACCESS_TOKEN_AQUI>
   ```
4. Haz clic en "Execute"

**Resultado esperado:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

### Paso 6.6: Verificar Status de Railway

```powershell
railway status
```

**Resultado esperado:**
```
Project: AguaDC-Staging
Environment: staging
Service: backend
Status: Running ✓
URL: https://aguadc-staging.up.railway.app
Region: us-west-2
Uptime: 5m 42s
```

---

## 7. TROUBLESHOOTING 🔧

### ❌ Error: PORT Already in Use

**Síntomas:**
```
Error: listen EADDRINUSE :::3000
```

**Solución:**

```powershell
# Ver qué proceso está usando el puerto 3000
netstat -ano | findstr :3000

# Matar el proceso (reemplaza PID)
taskkill /PID <PID_NUMBER> /F

# Reintentar deployment
railway up
```

---

### ❌ Error: Cannot Connect to Database

**Síntomas:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
Error: getaddrinfo ENOTFOUND postgres
```

**Solución:**

1. Verifica que la variable `DATABASE_URL` es correcta:
   ```powershell
   railway variables
   # Busca DATABASE_URL y verifica que sea una URL Neon válida
   ```

2. Si la URL es incorrecta, actualízala:
   ```powershell
   railway variables set DATABASE_URL="postgresql://neondb_owner:npg_8GD1nboAOzNr@ep-icy-paper-anwrb2gm.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require"
   ```

3. Redeploy:
   ```powershell
   railway up
   ```

---

### ❌ Error: Module Not Found

**Síntomas:**
```
Error: Cannot find module '@nestjs/common'
Error: Cannot find module 'prisma'
```

**Solución:**

```powershell
# Asegúrate de que package.json está en backend/
ls package.json

# Limpia dependencias en local
rm -r node_modules package-lock.json

# Reinstala
npm install

# Redeploy
railway up
```

---

### ❌ Error: Swagger UI Returns 404

**Síntomas:**
```
GET /api/docs → 404 Not Found
```

**Solución:**

1. Verifica que el backend está corriendo:
   ```powershell
   railway status
   ```

2. Si no está running, revisa los logs:
   ```powershell
   railway logs
   # Busca errores de NestJS
   ```

3. Si ve `Error: Swagger not initialized`, asegúrate de que `NODE_ENV=staging` o `development`:
   ```powershell
   railway variables set NODE_ENV="staging"
   railway up
   ```

---

### ❌ Error: 401 Unauthorized en Login

**Síntomas:**
```
Error: Unauthorized - Invalid credentials
```

**Solución:**

1. Verifica las credenciales exactas:
   ```powershell
   railway variables
   # Busca: INITIAL_ADMIN_USER y INITIAL_ADMIN_PASS
   ```

2. Asegúrate de que la base de datos fue inicializada:
   ```powershell
   railway logs
   # Busca: "✓ Seed service initialized"
   ```

3. Si el usuario no fue creado, resetea la base de datos:
   ```powershell
   # Ver todas las variables
   railway variables

   # Busca DATABASE_URL y cópiala
   # Accede a Neon dashboard y resetea la BD
   # O ejecuta en local:
   npm run build
   npx prisma migrate reset
   ```

---

### ❌ Error: Build Timeout (>15 minutos)

**Síntomas:**
```
Build timeout - Please try again
```

**Solución:**

1. Intenta deployment incremental:
   ```powershell
   railway up --log
   ```

2. Si sigue fallando, usa Railway Dashboard:
   - Ve a https://railway.app
   - Abre el proyecto AguaDC-Staging
   - Haz clic en "Deploy" manualmente
   - Monitorea el progreso en el dashboard

---

### ⚠️ Performance: Logs se Ven Lentos

**Síntomas:**
```
[muy lento escribiendo logs]
```

**Solución:**

```powershell
# Aumenta el nivel de logs
railway variables set LOG_LEVEL="warn"

# O desactiva algunos logs
railway variables set DEBUG="false"

# Redeploy
railway up
```

---

## 8. ROLLBACK 🔙

Si algo no funciona después del deployment:

### Paso 8.1: Ver Deployments Anteriores

```powershell
railway deployments
```

**Resultado esperado:**
```
ID                    Status      Created At
1a2b3c4d5e6f7g8h9i   Running     2026-04-06 10:45:00
9i8h7g6f5e4d3c2b1a   Success     2026-04-06 09:30:00 ← Anterior
0z9y8x7w6v5u4t3s2r   Success     2026-04-06 08:15:00
```

### Paso 8.2: Rollback a la Versión Anterior

```powershell
railway rollback 9i8h7g6f5e4d3c2b1a
```

Reemplaza `9i8h7g6f5e4d3c2b1a` con el ID del deployment anterior.

**Qué esperar:**
```
🔄 Rolling back to deployment: 9i8h7g6f5e4d3c2b1a
⏳ Waiting for service to restart...
✓ Rollback completed successfully
✓ Service is now running previous version
```

### Paso 8.3: Verificar Rollback

```powershell
railway logs
railway status
```

---

## ✅ CHECKLIST FINAL

Antes de dar por completado el deployment:

- [ ] PowerShell muestra: `Successfully logged in`
- [ ] `railway status` muestra: `Status: Running ✓`
- [ ] Swagger UI abre sin errores: `https://aguadc-staging.up.railway.app/api/docs`
- [ ] Login con `carlos_admin` retorna JWT válido
- [ ] Refresh token funciona sin errores
- [ ] `railway logs` no muestra errores críticos
- [ ] Base de datos está inicializada (logs muestran "Seed service initialized")
- [ ] Admin panel puede conectar a `/api/docs`

---

## 📞 SOPORTE

**Si algo falla:**

1. **Revisa los logs:**
   ```powershell
   railway logs --tail 50
   ```

2. **Verifica variables:**
   ```powershell
   railway variables
   ```

3. **Resetea la conexión:**
   ```powershell
   railway logout
   railway login
   railway link
   railway up
   ```

4. **Contacta al equipo** con:
   - Salida de `railway logs`
   - Salida de `railway status`
   - El error exacto que ves

---

**Última actualización**: 2026-04-06
**Versión**: 1.0
**Estado**: ✅ Listo para producción

# 🚀 DEPLOYMENT A RAILWAY - PLAN COMPLETO

**Plataforma**: Railway (PaaS)
**Base de Datos**: Neon PostgreSQL (misma que dev)
**Tiempo Estimado**: 30-45 minutos
**Riesgo**: ⚠️ Bajo (puedes revertir en minutos)

---

## 📋 RESUMEN DE CONFIGURACIÓN

```
Infraestructura:       Railway (PaaS)
Base de Datos:         Neon PostgreSQL (ya conectada)
Acceso:                Railway CLI + Dashboard web
Variables de Entorno:  Ya preparadas en .env
Dominio:               Railway asigna automáticamente (ej: aguadc-staging.up.railway.app)
```

---

## ✅ PRE-REQUISITOS

Verificar que ya tienes:

```bash
# 1️⃣ Backend compilado sin errores
npm run build
# ✅ Exit code: 0

# 2️⃣ Tests E2E pasando
npm run test:e2e
# ✅ Test Suites: 2 passed, 2 total
# ✅ Tests: 4 passed, 4 total

# 3️⃣ Variables de entorno listas
cat .env
# Debe mostrar:
# - DATABASE_URL="postgresql://..." (Neon)
# - JWT_SECRET="agua_dc_secure_secret_2026"
# - JWT_EXPIRATION="24h"
# - PORT=3000
```

---

## 🔧 PASO 1: PREPARAR RAILWAY CLI

### Instalar Railway CLI

```bash
# Windows (PowerShell)
iwr https://railway.app/install.sh -useb | iex

# O descargar manualmente:
# https://docs.railway.app/guides/cli
```

### Verificar instalación

```bash
railway --version
# Esperado: railway version X.X.X
```

---

## 🔑 PASO 2: AUTENTICARSE EN RAILWAY

```bash
railway login
# Se abrirá navegador
# Inicia sesión con tu cuenta de Railway (crear si no existe)
# Aprova el acceso en el browser
# Regresa a PowerShell
```

**Esperado**:
```
✓ Logged in as: tu-email@example.com
✓ Account saved
```

---

## 📁 PASO 3: CREAR PROYECTO EN RAILWAY

### Opción A: Crear nuevo proyecto (Recomendado)

```bash
cd C:\Users\LENOVO\Desktop\Nueva carpeta\Proyecto\AguaDC V2

railway init
# Seleccionar: Create a new project
# Nombre: aguadc-staging
# Seleccionar región: us-east (o tu preferencia)
```

**Esperado**: Se crea archivo `railway.json` con config

### Opción B: Usar proyecto existente

Si ya tienes un proyecto en Railway:

```bash
railway init
# Seleccionar: Link existing project
# Buscar y seleccionar proyecto
```

---

## 🔐 PASO 4: CONFIGURAR VARIABLES DE ENTORNO

### Ver variables actuales

```bash
railway variables
# Mostrará variables del proyecto
```

### Agregar variables de staging

```bash
# Agregar DATABASE_URL
railway variables set DATABASE_URL "postgresql://neondb_owner:npg_8GD1nboAOzNr@ep-icy-paper-anwrb2gm.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Agregar JWT_SECRET
railway variables set JWT_SECRET "agua_dc_secure_secret_2026"

# Agregar JWT_EXPIRATION
railway variables set JWT_EXPIRATION "24h"

# Agregar NODE_ENV
railway variables set NODE_ENV "production"

# Agregar PORT
railway variables set PORT "3000"

# (Opcional) Agregar CORS/URLs
railway variables set ADMIN_PANEL_URL "https://staging-admin.tudominio.com"
```

### Verificar variables

```bash
railway variables
# Mostrará todas las variables configuradas
```

---

## 📦 PASO 5: PREPARAR DOCKERFILE (SI ES NECESARIO)

Railway puede usar `Dockerfile` o `railway.toml`. Verificar que exists:

### Opción A: Usar railway.toml (Recomendado)

Railway detecta automáticamente si es NestJS y usa `npm run start:prod`

```bash
cat railway.toml
# Debe contener configuración de Node.js
```

### Opción B: Crear Dockerfile si no existe

```dockerfile
# Dockerfile en raíz del backend
FROM node:22-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código
COPY . .

# Compilar TypeScript
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "run", "start:prod"]
```

---

## 🚀 PASO 6: HACER DEPLOY

### Opción A: Deploy automático (Recomendado)

```bash
cd C:\Users\LENOVO\Desktop\Nueva carpeta\Proyecto\AguaDC V2\backend

railway up
# Compila, empaqueta y sube a Railway
# Esperado tiempo: 3-5 minutos
```

**Esperado**:
```
Building image...
Pushing image...
Deploying...
✓ Deployment successful
✓ Service running at: https://aguadc-staging.up.railway.app
```

### Opción B: Deploy vía Git (si tienes repo)

```bash
git add .
git commit -m "Deploy to staging"
git push origin main
# Railway webhook detecta y hace deploy automático
```

---

## ✅ PASO 7: VERIFICAR DEPLOYMENT

### Ver logs del deployment

```bash
railway logs
# Mostrará logs en tiempo real
# Esperado: "API running on http://localhost:3000"
```

### Probar API en staging

```bash
# Obtener URL de Railway
railway open
# O visita: https://aguadc-staging.up.railway.app

# Test 1: Swagger UI
https://aguadc-staging.up.railway.app/api/docs

# Test 2: Login
curl -X POST https://aguadc-staging.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlos_admin",
    "password": "Tu_Clave_Secreta_Aqui_2026!",
    "strategyName": "jwt"
  }'

# Esperado: 201 Created + access_token

# Test 3: Refresh Token
curl -X POST https://aguadc-staging.up.railway.app/api/auth/refresh \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Esperado: 200 OK + new access_token
```

---

## 📊 PASO 8: MONITOREO

### Ver estado en Railway Dashboard

```bash
railway open
# Abre dashboard en navegador
# Ver: Deployments, Logs, Metrics, Environment
```

### Comandos útiles

```bash
# Ver URL del servicio
railway status

# Ver variables configuradas
railway variables

# Ver logs en tiempo real
railway logs --follow

# Ver métricas (CPU, memoria)
railway metrics
```

---

## 🔄 PASO 9: ACTUALIZAR DESPUÉS DE CAMBIOS

Después de hacer cambios en el código:

```bash
cd backend

# Compilar localmente
npm run build

# Probar localmente
npm run start:dev

# Hacer deploy a staging
railway up
```

---

## ⚠️ PROBLEMAS COMUNES Y SOLUCIONES

### ❌ Error: "PORT already in use"

**Solución**:
```bash
# Railway asigna puerto automáticamente
# Asegurar que .env no tiene PORT hardcodeado
railway variables set PORT "3000"
```

### ❌ Error: "Cannot connect to database"

**Solución**:
```bash
# Verificar DATABASE_URL
railway variables

# Si es incorrecto, actualizar:
railway variables set DATABASE_URL "postgresql://..."

# Hacer redeploy:
railway up --force
```

### ❌ Error: "Deployment timeout"

**Solución**:
```bash
# Build muy lento - optimizar
npm prune  # Remover node_modules innecesarios
railway up --force
```

### ❌ Error: "Module not found"

**Solución**:
```bash
# Falta hacer npm install antes de deploy
npm install
npm run build
railway up
```

---

## 🔙 ROLLBACK (SI ALGO FALLA)

```bash
# Ver deployment anterior
railway deployments

# Revertir a versión anterior
railway rollback <deployment-id>
```

---

## 📈 PRÓXIMOS PASOS DESPUÉS DE DEPLOYMENT

### 1️⃣ Conectar Admin Panel a Staging

En `admin-panel/.env`:
```
VITE_API_URL=https://aguadc-staging.up.railway.app/api
```

Luego deploy del admin panel también.

### 2️⃣ Conectar Mobile App a Staging

En `mobile/.env`:
```
EXPO_PUBLIC_API_URL_DEV=https://aguadc-staging.up.railway.app/api
```

### 3️⃣ Configurar Dominio Personalizado (Opcional)

Si tienes dominio `staging.aguadc.hn`:

```bash
# En Railway Dashboard:
# → Settings → Domains → Add Custom Domain
# → Apuntar DNS a Railway nameservers
```

### 4️⃣ Configurar Backups Automáticos

Railway + Neon tienen backups automáticos, pero verifica:

```bash
# En dashboard de Neon:
# → Settings → Backups → Verificar retention policy
```

---

## ✅ CHECKLIST PRE-DEPLOY

- [ ] Backend compilado sin errores (`npm run build` → Exit 0)
- [ ] Tests E2E pasando (`npm run test:e2e` → 4/4 passed)
- [ ] Railway CLI instalado (`railway --version`)
- [ ] Autenticado en Railway (`railway login`)
- [ ] Proyecto creado en Railway (`railway init`)
- [ ] Variables de entorno configuradas (`railway variables`)
- [ ] DATABASE_URL apuntando a Neon (`railway variables` → DATABASE_URL visible)
- [ ] JWT_SECRET configurado (`railway variables` → JWT_SECRET visible)
- [ ] Dockerfile o railway.toml presente

---

## 📝 COMANDOS RÁPIDOS RESUMEN

```bash
# Instalación y autenticación
railway login

# Crear/inicializar proyecto
railway init

# Configurar variables
railway variables set KEY "value"

# Deploy
railway up

# Ver logs
railway logs --follow

# Ver estado
railway status

# Abrir dashboard
railway open

# Rollback
railway rollback <deployment-id>
```

---

## 🎯 RESULTADO ESPERADO

Después de 30-45 minutos:

```
✅ Backend corriendo en Railway
✅ URL asignada automáticamente (ej: aguadc-staging.up.railway.app)
✅ API accesible en /api/docs (Swagger)
✅ Logs disponibles en Railway Dashboard
✅ Database conectada a Neon
✅ Tests pasando en staging
✅ Listo para integración con admin panel y mobile app
```

---

*Plan de Deployment a Railway*
*Generado: 06/04/2026*

# AguaDC V2 - Railway Deployment Guide

Guía completa para desplegar AguaDC V2 en Railway.app, incluyendo configuración, deployment y rollback.

---

## Table of Contents

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración Inicial](#configuración-inicial)
3. [Deployment a Staging](#deployment-a-staging)
4. [Deployment a Production](#deployment-a-production)
5. [Verificación Post-Deployment](#verificación-post-deployment)
6. [Rollback](#rollback)
7. [Troubleshooting](#troubleshooting)
8. [Archivos de Configuración](#archivos-de-configuración)

---

## Requisitos Previos

### Software
- **Node.js** 20+ ([descargar](https://nodejs.org/))
- **npm** 9+ (incluido con Node.js)
- **Git** ([descargar](https://git-scm.com/))
- **PowerShell** 5.0+ (Windows) o Bash (Linux/Mac)

### Cuenta Railway
1. Crear cuenta en [railway.app](https://railway.app)
2. Conectar repositorio GitHub (recomendado para CI/CD automático)
3. Crear proyecto "AguaDC V2"

### Railway CLI
```bash
npm install -g @railway/cli
railway login
```

---

## Configuración Inicial

### 1. Crear Proyecto en Railway

```bash
# Desde la raíz del proyecto
railway init

# Seleccionar opciones:
# - Project name: AguaDC V2
# - Environment: staging (y luego crear production después)
```

### 2. Agregar Base de Datos PostgreSQL

En el dashboard de Railway:

1. Ir a: **Dashboard → AguaDC V2 Project**
2. Click en **+ New Service**
3. Seleccionar **Database → PostgreSQL**
4. Esperar a que se cree e inicialice (2-3 minutos)

La variable `DATABASE_URL` se creará automáticamente.

### 3. Configurar Variables de Entorno

En Railway UI (**Variables**):

```
NODE_ENV = production
PORT = 3000
JWT_EXPIRATION = 24h
ADMIN_PANEL_URL = https://staging-admin.aguadc.hn  (o production URL)
INITIAL_ADMIN_USER = carlos_admin
```

**Genera valores seguros para:**
```
JWT_SECRET = [usar generador de contraseñas: min 32 caracteres, alphanumeric + símbolos]
INITIAL_ADMIN_PASS = [contraseña segura, cambiar después del primer login]
```

### 4. Verificar Dockerfile

Railway usará el `Dockerfile` en `/backend`:

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma ./prisma
COPY --from=build /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /usr/src/app/data ./data

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
```

---

## Deployment a Staging

### Opción 1: Usar Script PowerShell (Recomendado)

```powershell
# En Windows PowerShell o PowerShell Core
cd C:\ruta\a\AguaDC-V2

.\deploy-script.ps1 -Environment staging
```

**Qué hace el script:**
- ✓ Verifica Node.js, npm, Railway CLI
- ✓ Ejecuta pruebas (`npm test`)
- ✓ Construye la aplicación (`npm run build`)
- ✓ Sube a Railway (`railway up`)
- ✓ Verifica logs y estado

### Opción 2: Manual via Railway CLI

```bash
cd backend

# Link al proyecto Railway
railway link

# Deploy
railway up

# Monitorear logs
railway logs --tail 50
```

### Opción 3: Auto-deployment via GitHub

Si conectaste tu repositorio GitHub a Railway:

1. Haz push a la rama `staging`:
   ```bash
   git push origin staging
   ```

2. Railway detectará el cambio automáticamente y desplegará

3. Ver progreso en Railway Dashboard → Deployments

---

## Deployment a Production

⚠️ **IMPORTANTE**: Antes de desplegar a production:

- [ ] Pruebas completadas en staging
- [ ] Todas las variables de entorno configuradas
- [ ] Base de datos production creada
- [ ] Backup de datos staging hecho
- [ ] Team revisó los cambios

### Pasos

1. **Crear entorno production en Railway:**

   En Railway UI:
   - Ir a: **Project Settings → Environments**
   - Crear nuevo environment: `production`
   - Copiar la configuración de `staging`
   - Actualizar `ADMIN_PANEL_URL` a production

2. **Deploy:**

   ```powershell
   .\deploy-script.ps1 -Environment production -SetVariables
   ```

3. **Verificar:**

   ```bash
   railway logs --tail 100
   railway open  # Abre en navegador
   ```

4. **Test Post-Deploy:**

   ```bash
   # Health check
   curl https://aguadc-prod.railway.app/api/health

   # API Docs
   https://aguadc-prod.railway.app/api/docs

   # Login test
   curl -X POST https://aguadc-prod.railway.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "carlos_admin",
       "password": "Tu_Clave_Secreta_Aqui_2026!",
       "strategyName": "jwt"
     }'
   ```

---

## Verificación Post-Deployment

### 1. Revisar Logs

```bash
# Últimas 50 líneas
railway logs --tail 50

# Filtrar por nivel
railway logs --grep "ERROR"
railway logs --grep "migration"
```

### 2. Verificar Estado del Servicio

```bash
# Ver información del deployment actual
railway status

# Ver historial de deployments
railway deployments
```

### 3. Test API

```bash
# Health check
curl https://your-service.railway.app/api/health

# Swagger/OpenAPI Docs
https://your-service.railway.app/api/docs

# Login
curl -X POST https://your-service.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carlos_admin","password":"...","strategyName":"jwt"}'
```

### 4. Verificar Prisma Migrations

```bash
# Ejecutar migraciones pendientes
railway run npx prisma migrate deploy

# Ver estado de migraciones
railway run npx prisma migrate status
```

### 5. Verificar Seed Data

El `SeedService` se ejecuta automáticamente al iniciar:

```bash
# Ver en logs
railway logs --grep "SeedService"

# Debería ver algo como:
# [SeedService] Creating admin role...
# [SeedService] Creating initial admin user...
# [SeedService] Seed completed successfully
```

---

## Rollback

### Opción 1: Script PowerShell

```powershell
.\rollback-script.ps1
```

El script mostrará:
- Lista de deployments anteriores
- Confirmación de rollback
- Status post-rollback

### Opción 2: Manual via Railway UI

1. Ir a: **Dashboard → Project → Deployments**
2. Encontrar el deployment anterior estable
3. Click **Redeploy** en ese deployment
4. Esperar a que complete (2-5 minutos)
5. Verificar logs: `railway logs --tail 50`

### Opción 3: Manual via CLI

```bash
# Ver deployments
railway deployments

# Redeployar un deployment específico
railway redeploy [deployment-id]

# Monitorear
railway logs --follow
```

---

## Troubleshooting

### Error: "Build failed"

**Causa**: Errores en `npm install` o `npm run build`

**Solución:**
```bash
cd backend
npm install
npm run build
# Revisar errores
```

### Error: "Database connection refused"

**Causa**: `DATABASE_URL` no válida o PostgreSQL no iniciado

**Solución:**
```bash
# Verificar DATABASE_URL en Railway UI
# Debe ser: postgresql://user:pass@host:port/dbname?sslmode=require

# O crear nueva base de datos:
# En Railway UI: + New Service → Database → PostgreSQL
```

### Error: "Prisma migration failed"

**Causa**: Schema mismatch o migraciones pendientes

**Solución:**
```bash
# Ejecutar migraciones manualmente
railway run npx prisma migrate deploy

# Si falló, resetear (⚠️ PELIGRO - borra datos):
# railway run npx prisma migrate reset --force

# Ver estado
railway run npx prisma migrate status
```

### Error: "JWT token invalid"

**Causa**: `JWT_SECRET` mal configurado o cambió

**Solución:**
1. Verificar `JWT_SECRET` en Railway UI Variables
2. Debe ser la misma en todos los deployments
3. Redeploy después de cambiar: `railway up`

### Error: "Initial admin user not created"

**Causa**: `INITIAL_ADMIN_USER` o `INITIAL_ADMIN_PASS` no configurados

**Solución:**
```bash
# Verificar en Railway UI → Variables
# Deben estar presentes ambas variables

# Si ya desplegó sin ellas:
railway run npx prisma db push  # Recrear schema
railway up  # Redeploy
```

### Service keeps restarting (CrashLoop)

**Causas comunes:**
1. Database connection failed
2. Migration failed
3. Missing environment variables
4. Port conflict

**Solución:**
```bash
# Ver logs detallados
railway logs --tail 100

# Buscar errores específicos
railway logs --grep "ERROR"

# Si necesitas SSH:
railway run bash
```

### Puertos o dominios

**Para obtener la URL del servicio:**
```bash
railway open  # Abre en navegador
# O muestra en terminal:
railway status
```

---

## Archivos de Configuración

### railway.json
```json
{
  "build": {
    "builder": "dockerfile",
    "context": "./backend"
  },
  "deploy": {
    "startCommand": "npm run start:prod"
  },
  "env": {
    "NODE_ENV": "production",
    "PORT": "3000",
    ...
  }
}
```

### .env.staging / .env.production

Plantillas de variables de entorno. **No commitear con valores reales.**

### .railwayrc

Configuración local de Railway CLI. Ignorado por `.gitignore`.

### Dockerfile (backend/)

Multi-stage build:
1. **Build stage**: Instala deps, compila TypeScript
2. **Production stage**: Copia dist, ejecuta migraciones, inicia servicio

---

## Variables de Entorno Requeridas

| Variable | Tipo | Ejemplo | Notas |
|----------|------|---------|-------|
| `NODE_ENV` | string | `production` | Requerido |
| `PORT` | number | `3000` | Requerido |
| `DATABASE_URL` | string | `postgresql://...` | Requerido, de Railway PostgreSQL |
| `JWT_SECRET` | string | `abc123...` | Requerido, min 32 chars |
| `JWT_EXPIRATION` | string | `24h` | Requerido |
| `ADMIN_PANEL_URL` | string | `https://admin.aguadc.hn` | Requerido |
| `INITIAL_ADMIN_USER` | string | `carlos_admin` | Usado en seed |
| `INITIAL_ADMIN_PASS` | string | `Clave123!` | Usado en seed, cambiar post-login |

---

## Monitoring y Logs

### Ver logs en tiempo real

```bash
railway logs --follow
```

### Filtrar logs por nivel

```bash
railway logs --grep "ERROR"
railway logs --grep "WARNING"
railway logs --grep "Database"
```

### Exportar logs

```bash
railway logs > deployment_logs.txt
```

### Railway UI Dashboard

1. Ir a: https://railway.app/dashboard
2. Seleccionar proyecto "AguaDC V2"
3. Ver en tiempo real: CPU, memoria, logs, deployments

---

## Mejores Prácticas

1. **Siempre testear en staging primero**
   ```bash
   .\deploy-script.ps1 -Environment staging
   ```

2. **Revisar logs antes de cada deployment**
   ```bash
   railway logs --tail 50
   ```

3. **Mantener un historial de deployments**
   - Railway guarda historial automático
   - Puedes volver a deployments anteriores fácilmente

4. **Variables de entorno seguras**
   - No commitear `.env.production` con valores reales
   - Usar Railway UI o CLI para configurar valores sensibles
   - Rotar `JWT_SECRET` periódicamente

5. **Database backups**
   - Railway incluye backups automáticos
   - Configurar retención en Railway UI → Database → Backups

6. **Monitoreo continuo**
   - Ver logs regularmente
   - Configurar alertas en Railway (planes pagos)
   - Revisar Swagger UI para verificar endpoints

---

## Recursos

- **Railway Docs**: https://railway.app/docs
- **NestJS Deployment**: https://docs.nestjs.com/deployment
- **Prisma Deployment**: https://www.prisma.io/docs/guides/deployment
- **PostgreSQL on Railway**: https://railway.app/docs/databases/postgresql

---

## Soporte

Para problemas:

1. Revisar logs: `railway logs --tail 100`
2. Consultar esta guía (sección Troubleshooting)
3. Railway Support: https://railway.app/support
4. Comunidad Discord NestJS: https://discord.gg/nestjs

---

**Última actualización**: 2026-04-06
**Versión**: 1.0
**Autor**: AguaDC V2 DevOps Team

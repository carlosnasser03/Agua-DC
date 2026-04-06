# 🚀 Railway Deployment Checklist

**Status**: ✅ Backend LISTO

---

## Pre-Deployment (Antes de Railway)

- ✅ Compilación: `npm run build` — Funciona
- ✅ Tests: `npm run test:e2e` — Configurado
- ✅ Variables .env: Todas presentes
- ✅ Archivos críticos: Completos
- ✅ Seguridad: Implementada
- ✅ Docker: Dockerfile presente

**Archivo de validación**: `VALIDACION_PRE_DEPLOY.md`

---

## Railway Dashboard Setup

### 1. Crear Proyecto
```
https://railway.app
→ New Project
→ Deploy from GitHub repo
→ Seleccionar AguaDC V2 repo
```

### 2. Crear Service
```
Service → Backend (Node.js)
- Branch: main
- Root Directory: /backend
```

### 3. Añadir PostgreSQL
```
Add → Postgres
- (Railway lo configura automáticamente)
```

### 4. Variables de Entorno
En Railway Dashboard → Variables:

```env
NODE_ENV=production
PORT=3000

JWT_SECRET=tu_string_seguro_32_caracteres_CAMBIAR_ESTO
JWT_EXPIRATION=24h

INITIAL_ADMIN_USER=admin@aguadc.hn
INITIAL_ADMIN_PASS=contraseña_segura_CAMBIAR_ESTO

ADMIN_PANEL_URL=https://admin.aguadc.hn

# DATABASE_URL se inyecta automáticamente desde PostgreSQL addon
```

### 5. Configurar Build & Deploy
```
Settings → Build
- Build Command: npm run build
- Start Command: node dist/main.js

Deploy on Push: Enabled
```

---

## Pasos de Deployment (Durante Railway)

1. **Push a main**
   ```bash
   git push origin main
   ```

2. **Railway Build Automático**
   - Detecta `package.json`
   - Ejecuta `npm install`
   - Ejecuta `npm run build`
   - Inicia servidor con `node dist/main.js`

3. **Verificación de Logs**
   ```
   Railway Dashboard → Logs
   Buscar: "NestApplication successfully started"
   ```

---

## Post-Deployment Validation

### 1. API Health Check
```bash
curl https://api.aguadc.hn/api/health
# Response: { "status": "ok" }
```

### 2. Swagger Documentation
```
https://api.aguadc.hn/api/docs
```

### 3. Test Login
```bash
curl -X POST https://api.aguadc.hn/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@aguadc.hn",
    "password": "[tu_contraseña]",
    "strategyName": "jwt"
  }'
```

### 4. Check Logs
```
Railway Dashboard → Logs
- Verificar no hay errores
- Verificar seed service creó admin user
```

---

## Configuración Post-Deploy (Seguridad Crítica)

**INMEDIATAMENTE después de first login**:

1. Cambiar contraseña admin
   - Admin Panel → Users → [admin user]
   - Cambiar password a algo seguro

2. Cambiar JWT_SECRET (si cambió en Railway)
   - Redeploy necesario (Railway auto-redeploya)

3. Configurar dominio custom
   - Railway → Custom Domain
   - Apuntar DNS a Railroad IP

---

## Troubleshooting Railway

### Build fails: "Cannot find module"
```
Solución: Railway ejecuta npm install automáticamente
- Check logs en Dashboard
- Verificar package.json syntax
```

### Database connection error
```
Solución: PostgreSQL addon debe estar conectado
- Check DATABASE_URL en Variables
- Verify Postgres service está running
```

### Port conflict
```
Railway automáticamente asigna port
- No necesita configuración manual
- Lee PORT from Railway environment
```

### API returns 502 Bad Gateway
```
Solución:
1. Check logs en Dashboard
2. Verificar NestApp startó correctamente
3. Verificar DATABASE_URL está presente
```

---

## Monitoreo Post-Deploy

### Logs
```
Railway → Logs (tiempo real)
- Errores de aplicación
- Logs de requests
- Performance metrics
```

### Métricas
```
Railway → Metrics
- CPU usage
- Memory usage
- Request count
- Response time
```

### Alerts (Configurar)
```
Railway → Monitoring
- Create alert si CPU > 80%
- Create alert si Memory > 90%
- Create alert si crash
```

---

## Referencias Rápidas

| Recurso | URL |
|---------|-----|
| Railway Dashboard | https://railway.app/dashboard |
| API Docs (Prod) | https://api.aguadc.hn/api/docs |
| Validación Completa | `VALIDACION_PRE_DEPLOY.md` |
| Guía de Proyecto | `CLAUDE.md` |

---

## Status Final

✅ **Backend completamente listo para Railway deployment**

Tiempo estimado: 5-10 minutos desde que presionas "Deploy"


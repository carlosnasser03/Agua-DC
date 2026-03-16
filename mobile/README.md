# Agua DC — App Ciudadana (React Native + Expo)

## Instalación

```bash
cd mobile
npm install
```

## Desarrollo local

```bash
# Iniciar servidor de desarrollo
npx expo start

# Android (con emulador corriendo)
npx expo start --android

# iOS (solo en Mac)
npx expo start --ios
```

## Configurar URL del backend

En `src/api/client.ts` cambia las URLs:
- **Emulador Android:** `http://10.0.2.2:3000/api`
- **Dispositivo físico:** `http://TU_IP_LOCAL:3000/api` (ej. `http://192.168.1.5:3000/api`)
- **Producción:** `https://api.aguadc.hn/api`

## Build para publicar

### Instalar EAS CLI
```bash
npm install -g eas-cli
eas login
```

### Configurar proyecto
```bash
eas build:configure
```
> Reemplaza `REPLACE_WITH_EAS_PROJECT_ID` en `app.json` con tu ID de proyecto.

### Build Android (APK para pruebas)
```bash
eas build --platform android --profile preview
```

### Build iOS
```bash
eas build --platform ios --profile production
```

### Subir a tiendas
```bash
# Google Play
eas submit --platform android

# App Store
eas submit --platform ios
```

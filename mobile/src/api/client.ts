/**
 * © 2026 AguaDC - Propiedad Privada.
 * Queda prohibida la reproducción, distribución o modificación total o parcial
 * de este código sin autorización expresa del autor.
 *
 * Proyecto  : AguaDC — Horario de Agua para el Distrito Central
 * Entidad   : U.M.A.P.S. — Unidad Municipal de Agua Potable y Saneamiento
 * Municipio : Distrito Central, Honduras
 */
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEVICE_UUID_KEY } from '../utils/deviceId';

// URLs leídas desde variables de entorno Expo (EXPO_PUBLIC_*)
// Crea mobile/.env y define EXPO_PUBLIC_API_URL_DEV y EXPO_PUBLIC_API_URL_PROD
const BASE_URL = __DEV__
  ? (process.env.EXPO_PUBLIC_API_URL_DEV ?? 'http://192.168.56.1:3000/api')
  : (process.env.EXPO_PUBLIC_API_URL_PROD ?? 'https://api.aguadc.hn/api');

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Adjunta el device UUID en cada request de la app ciudadana
apiClient.interceptors.request.use(async (config) => {
  const deviceId = await AsyncStorage.getItem(DEVICE_UUID_KEY);
  if (deviceId) {
    config.headers['x-device-id'] = deviceId;
  }
  return config;
});

export default apiClient;

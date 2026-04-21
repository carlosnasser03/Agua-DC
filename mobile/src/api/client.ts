/**
 * © 2026 AguaDC - Propiedad Privada.
 * Queda prohibida la reproducción, distribución o modificación total o parcial
 * de este código sin autorización expresa del autor.
 *
 * Proyecto  : AguaDC — Horario de Agua para el Distrito Central
 * Entidad   : U.M.A.P.S. — Unidad Municipal de Agua Potable y Saneamiento
 * Municipio : Distrito Central, Honduras
 */
import axios, { AxiosError } from 'axios';
import { SecureStorageProvider } from '../services/storage/SecureStorageProvider';
import { DEVICE_UUID_KEY } from '../utils/deviceId';
import { API_BASE_URL } from '../config/api';
import type { IStorageProvider } from '../services/storage/IStorageProvider';

const BASE_URL = API_BASE_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

const storageProvider: IStorageProvider = new SecureStorageProvider();
const TOKENS_KEY = 'auth_tokens';

// Flag para evitar múltiples intentos de refresh
let isRefreshing = false;
let failedQueue: Array<(token: string) => void> = [];

const processQueue = (token: string) => {
  failedQueue.forEach(prom => prom(token));
  failedQueue = [];
};

// Interceptor REQUEST: Adjunta device ID y token
apiClient.interceptors.request.use(async (config) => {
  const deviceId = await storageProvider.getItem(DEVICE_UUID_KEY);
  if (deviceId) {
    config.headers['x-device-id'] = deviceId;
  }

  // Agregar token de acceso si existe
  const tokensJson = await storageProvider.getItem(TOKENS_KEY);
  if (tokensJson) {
    try {
      const tokens = JSON.parse(tokensJson);
      if (tokens.accessToken) {
        config.headers['Authorization'] = `Bearer ${tokens.accessToken}`;
      }
    } catch (err) {
      // Tokens inválidos, ignorar
    }
  }

  return config;
});

// Interceptor RESPONSE: Manejo de errores y token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Si es 401 (token expirado) y no hemos intentado refresh aún
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Esperar a que se complete el refresh
        return new Promise((resolve) => {
          failedQueue.push((token: string) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokensJson = await storageProvider.getItem(TOKENS_KEY);
        if (!tokensJson) {
          throw new Error('No tokens found');
        }

        const tokens = JSON.parse(tokensJson);
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken: tokens.refreshToken,
        });

        const newTokens = {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          expiresIn: response.data.expiresIn,
        };

        await storageProvider.setItem(TOKENS_KEY, JSON.stringify(newTokens));
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newTokens.accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;

        processQueue(newTokens.accessToken);
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        failedQueue = [];

        // Si el refresh falló, remover tokens y dejar continuar anónimo
        await storageProvider.removeItem(TOKENS_KEY);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

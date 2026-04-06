import axios, { AxiosError } from 'axios';
import { LocalStorageProvider } from '../services/storage/LocalStorageProvider';
import type { IStorageProvider } from '../services/storage/IStorageProvider';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

const storageProvider: IStorageProvider = new LocalStorageProvider();

/**
 * Request interceptor: Adjunta el token JWT en cada request automáticamente
 */
apiClient.interceptors.request.use(async (config) => {
  const token = await storageProvider.getItem('aguadc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Queue de requests que fallaron por 401
 * Se reintentarán una vez que se obtenga un nuevo token
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
}> = [];

/**
 * Procesa la cola de requests que estaban esperando un nuevo token
 */
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Response interceptor: Maneja errores 401 intentando refrescar el token
 *
 * Flujo:
 * 1. Si se recibe 401 y no estamos refrescando, inicia refresh
 * 2. Pone el request actual en la cola de espera
 * 3. POST /auth/refresh obtiene un nuevo token
 * 4. Reintenta todos los requests de la cola con el nuevo token
 * 5. Si refresh falla, limpia sesión y redirige a /login
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Si es 401 y no es un request al endpoint /auth/refresh
    if (
      error.response?.status === 401 &&
      originalRequest.url &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Si ya estamos refrescando, encola el request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            }
            return Promise.reject(error);
          })
          .catch(() => {
            // Si el refresh falló, rechaza el request
            return Promise.reject(error);
          });
      }

      isRefreshing = true;

      try {
        // Intenta refrescar el token
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${await storageProvider.getItem('aguadc_token')}`,
            },
          }
        );

        const newToken = response.data?.access_token;

        if (!newToken) {
          throw new Error('No token in refresh response');
        }

        // Guarda el nuevo token
        await storageProvider.setItem('aguadc_token', newToken);

        // Procesa la cola de requests pendientes
        processQueue(null, newToken);

        // Reintenta el request original con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        // El refresh falló
        console.error('Token refresh failed:', refreshError.response?.status);

        // Limpia la sesión
        await storageProvider.removeItem('aguadc_token');
        await storageProvider.removeItem('aguadc_user');

        // Procesa la cola rechazando todos los requests
        processQueue(refreshError, null);

        // Emite evento para que AuthContext limpie el estado
        window.dispatchEvent(
          new CustomEvent('auth:logout', { detail: 'Token refresh failed' })
        );

        // Redirige al login
        window.location.href = '/login';

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

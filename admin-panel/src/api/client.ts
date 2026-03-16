import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Adjunta el token JWT en cada request automáticamente
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('aguadc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el servidor devuelve 401, borra la sesión y redirige al login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('aguadc_token');
      localStorage.removeItem('aguadc_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

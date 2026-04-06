import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import apiClient from '../api/client';
import { LocalStorageProvider } from '../services/storage/LocalStorageProvider';
import type { IStorageProvider } from '../services/storage/IStorageProvider';

interface AdminUser {
  id: string;
  email: string;
  fullname: string;
  role: string;
}

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Instancia global del storage provider
const storageProvider: IStorageProvider = new LocalStorageProvider();

/**
 * Decodifica manualmente un JWT token para obtener el payload
 * @param token JWT token
 * @returns Payload decodificado o null si falla
 */
const decodeJWT = (token: string): any | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

/**
 * Verifica si un token está expirado
 * @param token JWT token
 * @returns true si está expirado, false si es válido
 */
const isTokenExpired = (token: string): boolean => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;
  return payload.exp * 1000 < Date.now();
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Limpia la sesión de almacenamiento y estado
   */
  const clearSession = async () => {
    await storageProvider.removeItem('aguadc_token');
    await storageProvider.removeItem('aguadc_user');
    setToken(null);
    setUser(null);
  };

  /**
   * Intenta refrescar el token JWT
   * @returns Token nuevo si el refresh es exitoso, null si falla
   */
  const refreshToken = async (): Promise<string | null> => {
    try {
      const response = await apiClient.post('/auth/refresh', {});
      const newToken = response.data?.access_token;

      if (!newToken) {
        await clearSession();
        return null;
      }

      // Guardar el nuevo token
      await storageProvider.setItem('aguadc_token', newToken);
      setToken(newToken);

      // Mantener los datos del usuario (si existían)
      if (user) {
        await storageProvider.setItem('aguadc_user', JSON.stringify(user));
      }

      return newToken;
    } catch (error: any) {
      console.error('Token refresh failed:', error?.response?.status);
      await clearSession();
      return null;
    }
  };

  /**
   * Restaurar sesión desde storage al montar el componente
   */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await storageProvider.getItem('aguadc_token');
        const savedUser = await storageProvider.getItem('aguadc_user');

        if (savedToken && savedUser) {
          // Verificar si el token está expirado
          if (isTokenExpired(savedToken)) {
            // Intentar refrescar
            const newToken = await refreshToken();
            if (newToken) {
              setToken(newToken);
              setUser(JSON.parse(savedUser));
            }
            // Si refresh falla, la sesión se limpia en refreshToken()
          } else {
            // Token aún es válido
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
          }
        }
      } catch (err) {
        console.error('Session restoration error:', err);
        await clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();

    /**
     * Listener para mensajes de otra pestaña
     * Si otra pestaña ejecuta logout, sincroniza aquí
     */
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'aguadc_token' && e.newValue === null) {
        setToken(null);
        setUser(null);
      }
    };

    /**
     * Listener para evento de logout desde el interceptor
     * Se dispara cuando el refresh falla
     */
    const handleLogout = (event: any) => {
      console.warn('Session expired:', event.detail);
      setToken(null);
      setUser(null);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:logout', handleLogout);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  /**
   * Login: autentica con email/password
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
        strategyName: 'jwt',
      });

      const { access_token, user: userData } = response.data;

      if (!access_token || !userData) {
        throw new Error('Invalid login response');
      }

      // Guardar en storage
      await storageProvider.setItem('aguadc_token', access_token);
      await storageProvider.setItem('aguadc_user', JSON.stringify(userData));

      // Actualizar estado
      setToken(access_token);
      setUser(userData);
    } catch (error: any) {
      await clearSession();
      throw error;
    }
  };

  /**
   * Logout: limpia sesión
   */
  const logout = async () => {
    await clearSession();
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!(token && user),
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook para usar el contexto de autenticación
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

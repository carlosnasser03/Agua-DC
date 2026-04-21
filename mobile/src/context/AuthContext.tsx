/**
 * © 2026 AguaDC - Propiedad Privada.
 * Queda prohibida la reproducción, distribución o modificación total o parcial
 * de este código sin autorización expresa del autor.
 *
 * Proyecto  : AguaDC — Horario de Agua para el Distrito Central
 * Entidad   : U.M.A.P.S. — Unidad Municipal de Agua Potable y Saneamiento
 * Municipio : Distrito Central, Honduras
 */
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import NetInfo from '@react-native-community/netinfo';
import { SecureStorageProvider } from '../services/storage/SecureStorageProvider';
import { AsyncStorageProvider } from '../services/storage/AsyncStorageProvider';
import { DEVICE_UUID_KEY } from '../utils/deviceId';
import axios from 'axios';

const TOKENS_KEY = 'auth_tokens';
const AUTH_PENDING_KEY = 'auth_pending_sync';

interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

interface AuthContextType {
  deviceId: string | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authPending: boolean;
  authenticateDevice: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  saveTokens: (tokens: Tokens) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const secureStorage = new SecureStorageProvider();
const asyncStorage = new AsyncStorageProvider();

const BASE_URL = __DEV__
  ? (process.env.EXPO_PUBLIC_API_URL_DEV ?? 'http://192.168.56.1:3000/api')
  : (process.env.EXPO_PUBLIC_API_URL_PROD ?? 'https://api.aguadc.hn/api');

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authPending, setAuthPending] = useState(false);

  // Inicializar: cargar device ID y tokens guardados
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Cargar device ID
      const stored = await secureStorage.getItem(DEVICE_UUID_KEY);
      const id = stored || (await generateOrGetDeviceId());
      setDeviceId(id);

      // Cargar tokens del storage
      const tokensJson = await secureStorage.getItem(TOKENS_KEY);
      if (tokensJson) {
        const tokens = JSON.parse(tokensJson);
        setAccessToken(tokens.accessToken);
      }

      // Intentar sincronizar si hay auth pendiente
      checkAndSyncPendingAuth();
    } catch (err) {
      console.error('Error initializing auth:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateOrGetDeviceId = async (): Promise<string> => {
    let uuid: string;

    if (Device.isDevice) {
      const androidId = await Application.getAndroidId?.();
      uuid = androidId ?? generateUUID();
    } else {
      uuid = generateUUID();
    }

    await secureStorage.setItem(DEVICE_UUID_KEY, uuid);
    return uuid;
  };

  const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const authenticateDevice = async () => {
    if (!deviceId) return;

    try {
      const state = await NetInfo.fetch();
      const isConnected = state.isConnected ?? false;

      if (!isConnected) {
        // Sin internet: marcar como pendiente
        await asyncStorage.setItem(AUTH_PENDING_KEY, 'true');
        setAuthPending(true);
        return;
      }

      // Con internet: intentar autenticación
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        strategyName: 'device',
        deviceUuid: deviceId,
        platform: Device.isDevice ? 'android' : 'ios',
        appVersion: '1.0.0',
      });

      const tokens: Tokens = {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        expiresIn: response.data.expiresIn,
      };

      await saveTokens(tokens);
      setAuthPending(false);
      await asyncStorage.removeItem(AUTH_PENDING_KEY);
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message;
      console.error('Device auth error:', message);

      // Marcar como pendiente para reintentar después
      await asyncStorage.setItem(AUTH_PENDING_KEY, 'true');
      setAuthPending(true);
    }
  };

  const checkAndSyncPendingAuth = async () => {
    try {
      const pending = await asyncStorage.getItem(AUTH_PENDING_KEY);
      if (pending === 'true') {
        setAuthPending(true);

        const state = await NetInfo.fetch();
        if (state.isConnected ?? false) {
          await authenticateDevice();
        }
      }
    } catch (err) {
      console.error('Error checking pending auth:', err);
    }
  };

  const saveTokens = async (tokens: Tokens) => {
    await secureStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
    setAccessToken(tokens.accessToken);
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const tokensJson = await secureStorage.getItem(TOKENS_KEY);
      if (!tokensJson) return false;

      const tokens = JSON.parse(tokensJson);
      const response = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken: tokens.refreshToken,
      });

      await saveTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        expiresIn: response.data.expiresIn,
      });

      return true;
    } catch (err) {
      console.error('Refresh token error:', err);
      return false;
    }
  };

  const logout = async () => {
    try {
      await secureStorage.removeItem(TOKENS_KEY);
      setAccessToken(null);
      setAuthPending(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Escuchar cambios de conexión para sincronizar
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected ?? false;
      if (isConnected && authPending) {
        checkAndSyncPendingAuth();
      }
    });

    return () => unsubscribe();
  }, [authPending]);

  return (
    <AuthContext.Provider
      value={{
        deviceId,
        accessToken,
        isAuthenticated: !!accessToken,
        isLoading,
        authPending,
        authenticateDevice,
        logout,
        refreshAccessToken,
        saveTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe estar dentro de AuthProvider');
  }
  return context;
};

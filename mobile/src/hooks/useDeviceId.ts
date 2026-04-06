import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { initDeviceId } from '../utils/deviceId';
import { SecureStorageProvider } from '../services/storage/SecureStorageProvider';
import { registerForPushNotificationsAsync } from '../services/notifications/NotificationService';
import apiClient from '../api/client';

/**
 * Inicializa (si no existe) y devuelve el UUID persistente del dispositivo.
 * Fuente de verdad única para la identidad del ciudadano en la app.
 * Usa la abstracción IStorageProvider para persistencia.
 */
export const useDeviceId = () => {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storageProvider = new SecureStorageProvider();
    initDeviceId(storageProvider)
      .then(async (id) => {
        setDeviceId(id);
        
        // Register for push notifications
        const token = await registerForPushNotificationsAsync();
        if (token) {
          try {
            // Sync token with deviceId on the backend
            await apiClient.patch('/reports/sync-token', { 
              deviceId: id, 
              pushToken: token,
              platform: Platform.OS,
              // appVersion: Constants.expoConfig?.version
            });
          } catch (err) {
            console.error('Failed to sync push token with backend:', err);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return { deviceId, loading };
};

import { useState, useEffect } from 'react';
import { initDeviceId } from '../utils/deviceId';

/**
 * Inicializa (si no existe) y devuelve el UUID persistente del dispositivo.
 * Fuente de verdad única para la identidad del ciudadano en la app.
 */
export const useDeviceId = () => {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initDeviceId()
      .then((id) => setDeviceId(id))
      .finally(() => setLoading(false));
  }, []);

  return { deviceId, loading };
};

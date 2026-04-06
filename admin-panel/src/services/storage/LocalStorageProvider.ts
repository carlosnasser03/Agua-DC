import type { IStorageProvider } from './IStorageProvider';

/**
 * Implementación de IStorageProvider usando localStorage del navegador.
 * Envuelve las operaciones síncronas en Promises para mantener compatibilidad
 * con la interfaz asincrónica.
 */
export class LocalStorageProvider implements IStorageProvider {
  async getItem(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
  }
}

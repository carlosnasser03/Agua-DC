import AsyncStorage from '@react-native-async-storage/async-storage';
import { IStorageProvider } from './IStorageProvider';

/**
 * Implementación de IStorageProvider usando AsyncStorage de React Native.
 * Proporciona una abstracción sobre AsyncStorage para permitir
 * sustitución de implementación en el futuro.
 */
export class AsyncStorageProvider implements IStorageProvider {
  async getItem(key: string): Promise<string | null> {
    return await AsyncStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }
}

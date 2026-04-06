import * as SecureStore from 'expo-secure-store';
import { IStorageProvider } from './IStorageProvider';

/**
 * Implementation of IStorageProvider using expo-secure-store.
 * Stores data in a secure, encrypted way on the device.
 * Used for sensitive information like the unique device ID or future tokens.
 */
export class SecureStorageProvider implements IStorageProvider {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error reading from SecureStore:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error writing to SecureStore:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error deleting from SecureStore:', error);
    }
  }
}

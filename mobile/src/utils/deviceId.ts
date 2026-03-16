import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as Device from 'expo-device';

export const DEVICE_UUID_KEY = 'device_uuid';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Garantiza que existe un UUID persistente en AsyncStorage.
 * En dispositivos físicos Android intenta usar el ID nativo del sistema;
 * en emuladores o iOS genera un UUID aleatorio.
 * Idempotente: si ya existe, lo devuelve sin modificarlo.
 */
export async function initDeviceId(): Promise<string> {
  const stored = await AsyncStorage.getItem(DEVICE_UUID_KEY);
  if (stored) return stored;

  const nativeId = Device.isDevice
    ? ((await Application.getAndroidId?.()) ?? null)
    : null;

  const uuid = nativeId ?? generateUUID();
  await AsyncStorage.setItem(DEVICE_UUID_KEY, uuid);
  return uuid;
}

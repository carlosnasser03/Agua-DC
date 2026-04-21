/**
 * © 2026 AguaDC - Propiedad Privada.
 * Queda prohibida la reproducción, distribución o modificación total o parcial
 * de este código sin autorización expresa del autor.
 *
 * Proyecto  : AguaDC — Horario de Agua para el Distrito Central
 * Entidad   : U.M.A.P.S. — Unidad Municipal de Agua Potable y Saneamiento
 * Municipio : Distrito Central, Honduras
 */

/**
 * Configuración centralizada de URLs de API
 * Uso: import { API_BASE_URL } from '@/config/api'
 */
export const API_BASE_URL = __DEV__
  ? (process.env.EXPO_PUBLIC_API_URL_DEV ?? 'https://agua-dc-production.up.railway.app/api')
  : (process.env.EXPO_PUBLIC_API_URL_PROD ?? 'https://agua-dc-production.up.railway.app/api');

console.log('[API CONFIG]', {
  isDev: __DEV__,
  baseUrl: API_BASE_URL,
  envDev: process.env.EXPO_PUBLIC_API_URL_DEV,
  envProd: process.env.EXPO_PUBLIC_API_URL_PROD,
});

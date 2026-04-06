/**
 * Abstracción de almacenamiento persistente para admin-panel.
 * Permite intercambiar implementaciones (localStorage, sessionStorage, etc.)
 */
export interface IStorageProvider {
  /**
   * Obtiene un valor del almacenamiento.
   * @param key La clave a buscar
   * @returns El valor almacenado o null si no existe
   */
  getItem(key: string): Promise<string | null>;

  /**
   * Almacena un valor.
   * @param key La clave
   * @param value El valor a almacenar
   */
  setItem(key: string, value: string): Promise<void>;

  /**
   * Elimina un valor del almacenamiento.
   * @param key La clave a eliminar
   */
  removeItem(key: string): Promise<void>;
}

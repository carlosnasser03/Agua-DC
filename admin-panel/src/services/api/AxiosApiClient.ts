/**
 * © 2026 AguaDC - Propiedad Privada.
 * Queda prohibida la reproducción, distribución o modificación total o parcial
 * de este código sin autorización expresa del autor.
 *
 * Proyecto  : AguaDC — Horario de Agua para el Distrito Central
 * Entidad   : U.M.A.P.S. — Unidad Municipal de Agua Potable y Saneamiento
 * Municipio : Distrito Central, Honduras
 */
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { IApiClient } from './IApiClient';

/**
 * AxiosApiClient
 * Implementation of IApiClient using Axios
 * Can be easily swapped with other implementations without changing client code
 */
export class AxiosApiClient implements IApiClient {
  constructor(private axiosInstance: AxiosInstance = axios) {}

  async get<T = any>(url: string, config?: any) {
    return this.axiosInstance.get<T>(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: any) {
    return this.axiosInstance.post<T>(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: any) {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: any) {
    return this.axiosInstance.put<T>(url, data, config);
  }

  async delete<T = any>(url: string, config?: any) {
    return this.axiosInstance.delete<T>(url, config);
  }
}

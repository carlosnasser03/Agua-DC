/**
 * © 2026 AguaDC - Propiedad Privada.
 * Queda prohibida la reproducción, distribución o modificación total o parcial
 * de este código sin autorización expresa del autor.
 *
 * Proyecto  : AguaDC — Horario de Agua para el Distrito Central
 * Entidad   : U.M.A.P.S. — Unidad Municipal de Agua Potable y Saneamiento
 * Municipio : Distrito Central, Honduras
 */

export class ThemeDto {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  colors: Record<string, any>;
  typography: Record<string, any>;
  spacing: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

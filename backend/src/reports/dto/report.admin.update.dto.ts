/**
 * © 2026 AguaDC - Propiedad Privada.
 * Queda prohibida la reproducción, distribución o modificación total o parcial
 * de este código sin autorización expresa del autor.
 *
 * Proyecto  : AguaDC — Horario de Agua para el Distrito Central
 * Entidad   : U.M.A.P.S. — Unidad Municipal de Agua Potable y Saneamiento
 * Municipio : Distrito Central, Honduras
 */
import { IsString, IsOptional } from 'class-validator';

/**
 * ReportAdminUpdateDTO
 * Request DTO for updating a report
 * Only includes fields that admins are allowed to edit
 * Response will use ReportAdminDetailDTO
 */
export class ReportAdminUpdateDTO {
  @IsString()
  status: string;

  @IsString()
  @IsOptional()
  publicNote?: string;

  @IsString()
  @IsOptional()
  internalNote?: string;
}

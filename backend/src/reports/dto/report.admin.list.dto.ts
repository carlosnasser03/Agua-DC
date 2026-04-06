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
 * ReportAdminListDTO
 * Optimized for list endpoints - includes essential fields only
 * No full statusHistory to reduce payload size
 */
export class ReportAdminListDTO {
  id: string;
  publicId: string;
  status: string;
  type: string;
  description: string;
  colonyName: string;
  sectorName: string;
  reporterName?: string;
  reporterPhone?: string;
  createdAt: Date;
  updatedAt: Date;
  lastStatusUpdate?: Date;
  reportCount?: number;

  constructor(data: any) {
    this.id = data.id;
    this.publicId = data.publicId;
    this.status = data.status;
    this.type = data.type;
    this.description = data.description;
    this.colonyName = data.colony?.name || '';
    this.sectorName = data.colony?.sector?.name || '';
    this.reporterName = data.reporterName || undefined;
    this.reporterPhone = data.reporterPhone || undefined;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.lastStatusUpdate = data.statusHistory?.[data.statusHistory.length - 1]?.changedAt;
    this.reportCount = data.deviceProfile?.reports?.length;
  }
}

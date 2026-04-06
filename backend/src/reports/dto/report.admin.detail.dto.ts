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
 * ReportAdminDetailDTO
 * Complete report information for detail view
 * Includes full statusHistory and all device information
 */
export class ReportStatusHistoryAdminDetailDTO {
  id: string;
  status: string;
  publicNote?: string;
  internalNote?: string;
  changedById?: string;
  changedBy?: {
    id: string;
    email: string;
    fullname: string;
  };
  changedAt: Date;
}

export class ReportAdminDeviceDetailDTO {
  deviceUuid: string;
  ipAddress?: string;
  platform?: string;
  appVersion?: string;
  reportCount: number;
  lastSeenAt?: Date;
  deviceFingerprint?: string;
}

export class ReportAdminDetailDTO {
  id: string;
  publicId: string;
  deviceProfileId: string;
  reportTypeId?: string;
  type: string;
  description: string;
  status: string;
  colonyId: string;
  colonyName: string;
  sectorName: string;
  reporterName?: string;
  reporterPhone?: string;
  ipAddress?: string;
  deviceFingerprint?: string;
  createdAt: Date;
  updatedAt: Date;
  deviceProfile?: ReportAdminDeviceDetailDTO;
  statusHistory: ReportStatusHistoryAdminDetailDTO[];

  constructor(data: any) {
    this.id = data.id;
    this.publicId = data.publicId;
    this.deviceProfileId = data.deviceProfileId;
    this.reportTypeId = data.reportTypeId;
    this.type = data.type;
    this.description = data.description;
    this.status = data.status;
    this.colonyId = data.colonyId;
    this.colonyName = data.colony?.name || '';
    this.sectorName = data.colony?.sector?.name || '';
    this.reporterName = data.reporterName || undefined;
    this.reporterPhone = data.reporterPhone || undefined;
    this.ipAddress = data.ipAddress;
    this.deviceFingerprint = data.deviceFingerprint;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;

    this.deviceProfile = data.deviceProfile
      ? {
          deviceUuid: data.deviceProfile.deviceUuid,
          ipAddress: data.ipAddress,
          platform: data.deviceProfile.platform,
          appVersion: data.deviceProfile.appVersion,
          reportCount: data.deviceProfile.reports?.length || 0,
          lastSeenAt: data.deviceProfile.lastSeenAt,
          deviceFingerprint: data.deviceFingerprint,
        }
      : undefined;

    this.statusHistory = (data.statusHistory || []).map((sh: any) => ({
      id: sh.id,
      status: sh.status,
      publicNote: sh.publicNote,
      internalNote: sh.internalNote,
      changedById: sh.changedById,
      changedBy: sh.changedBy
        ? {
            id: sh.changedBy.id,
            email: sh.changedBy.email,
            fullname: sh.changedBy.fullname,
          }
        : undefined,
      changedAt: sh.changedAt,
    }));
  }
}

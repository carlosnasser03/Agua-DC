import { IAdminDevice } from './device.admin.dto';

/**
 * ReportAdminDTO: Respuesta completa para administradores
 * Incluye todos los campos incluyendo información sensible de auditoría
 */
export class AdminUserMinimalDTO {
  id: string;
  email: string;
  fullname: string;
}

export class ReportStatusHistoryAdminDTO {
  id: string;
  status: string;
  publicNote?: string;
  internalNote?: string;
  changedById?: string;
  changedBy?: AdminUserMinimalDTO; // Quién cambió el estado
  changedAt: Date;
}

export class ReportAdminDTO {
  id: string;
  publicId: string;

  // Información del ciudadano (anónima)
  deviceProfileId: string;
  reporterName?: string;
  reporterPhone?: string;

  // Información del dispositivo (segregado por rol)
  deviceProfile?: IAdminDevice;

  // Información del reporte
  status: string;
  type: string;
  description: string;
  colonyId: string;
  colonyName: string;
  sectorName: string;

  // Notas
  publicNote?: string;
  internalNote?: string;

  // Metadata
  ipAddress?: string;
  deviceFingerprint?: string;
  createdAt: Date;
  updatedAt: Date;

  // Auditoría
  statusHistory: ReportStatusHistoryAdminDTO[];
  changedBy?: AdminUserMinimalDTO;
  changedAt?: Date;
}

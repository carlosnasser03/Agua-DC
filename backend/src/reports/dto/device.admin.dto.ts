/**
 * IAdminDevice: Información del dispositivo visible para administradores
 * Expone detalles técnicos y de auditoría para investigaciones
 */
export interface IAdminDevice {
  deviceUuid: string;
  ipAddress?: string;
  platform?: string;
  appVersion?: string;
  reportCount?: number;
  lastSeenAt: Date;
}

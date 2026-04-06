/**
 * ReportPublicDTO: Respuesta visible para ciudadanos (zero-trust access)
 * Solo incluye información que el ciudadano puede ver de su propio reporte
 */
export class ReportStatusHistoryPublicDTO {
  status: string;
  publicNote?: string;
  changedAt: Date;
}

export class ReportPublicDTO {
  publicId: string;
  status: string;
  description: string;
  type: string;
  publicNote?: string; // Nota visible al ciudadano
  createdAt: Date;
  updatedAt: Date;
  statusHistory: ReportStatusHistoryPublicDTO[];
  colonyName: string; // Agregar nombre de la colonia para contexto
}

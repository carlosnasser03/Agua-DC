import { IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';

export class GetAdminReportsDto {
  @IsOptional()
  @IsEnum(['ENVIADO', 'EN_REVISION', 'VALIDADO', 'RESUELTO', 'RECHAZADO'], {
    message: 'Estado no válido',
  })
  status?: string;

  @IsOptional()
  @IsUUID('4', { message: 'colonyId debe ser un UUID válido' })
  colonyId?: string;

  @IsOptional()
  @IsEnum(['NO_WATER', 'LOW_PRESSURE', 'WRONG_SCHEDULE', 'OTHER'], {
    message: 'Tipo de reporte no válido',
  })
  type?: string;

  @IsOptional()
  @IsDateString({}, { message: 'startDate debe ser una fecha ISO válida (YYYY-MM-DD)' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'endDate debe ser una fecha ISO válida (YYYY-MM-DD)' })
  endDate?: string;
}

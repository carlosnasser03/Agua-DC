import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum ReportStatus {
  ENVIADO = 'ENVIADO',
  EN_REVISION = 'EN_REVISION',
  VALIDADO = 'VALIDADO',
  RESUELTO = 'RESUELTO',
  RECHAZADO = 'RECHAZADO',
}

export class CreateReportDto {
  @IsString()
  @IsNotEmpty({ message: 'Descripción requerida' })
  description: string;

  @IsString()
  @IsOptional()
  deviceId?: string;

  @IsString()
  @IsOptional()
  colonyName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;
}

export class UpdateReportStatusDto {
  @IsEnum(ReportStatus, { message: 'Estado inválido' })
  status: ReportStatus;

  @IsString()
  @IsOptional()
  resolution?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ReportResponseDto {
  id: string;
  description: string;
  status: string;
  deviceId: string;
  createdAt: Date;
  updatedAt: Date;
}

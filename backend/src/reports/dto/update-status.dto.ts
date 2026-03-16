import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';

export class UpdateReportStatusDto {
  @IsString()
  @IsEnum(['ENVIADO', 'EN_REVISION', 'VALIDADO', 'RESUELTO', 'RECHAZADO'], {
    message: 'Estado no válido',
  })
  status: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'La nota pública no puede superar 500 caracteres' })
  publicNote?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'La nota interna no puede superar 1000 caracteres' })
  internalNote?: string;
}

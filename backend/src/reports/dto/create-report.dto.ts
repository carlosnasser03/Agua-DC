import { IsString, IsNotEmpty, IsEnum, MaxLength, IsOptional, Matches } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  colonyId: string;

  @IsString()
  @IsEnum(['NO_WATER', 'LOW_PRESSURE', 'WRONG_SCHEDULE', 'OTHER'], {
    message: 'Tipo de reporte no válido',
  })
  type: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200, { message: 'El motivo no puede superar 200 caracteres' })
  description: string;

  @IsOptional()
  @IsString()
  @Matches(/^[\p{L}\p{M}\s]{1,60}$/u, {
    message: 'El nombre solo puede contener letras y espacios (máximo 60 caracteres)',
  })
  reporterName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{8}$/, { message: 'El celular debe tener exactamente 8 dígitos' })
  reporterPhone?: string;
}

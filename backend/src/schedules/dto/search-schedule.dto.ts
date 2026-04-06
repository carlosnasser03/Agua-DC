import { IsString, IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';

export class SearchScheduleDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la colonia es requerido para la búsqueda' })
  @MinLength(3, { message: 'El nombre de la colonia debe tener al menos 3 caracteres' })
  @MaxLength(60)
  colony: string;

  @IsString()
  @IsOptional()
  from?: string;

  @IsString()
  @IsOptional()
  to?: string;
}

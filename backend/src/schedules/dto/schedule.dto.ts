import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  @IsNotEmpty({ message: 'Sector requerido' })
  sector: string;

  @IsString()
  @IsNotEmpty({ message: 'Colonia requerida' })
  colony: string;

  @IsString()
  @IsNotEmpty({ message: 'Período requerido' })
  period: string;

  @IsArray()
  @IsNotEmpty({ message: 'Horarios requeridos' })
  scheduleEntries: any[];

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateScheduleDto {
  @IsOptional()
  @IsString()
  sector?: string;

  @IsOptional()
  @IsString()
  colony?: string;

  @IsOptional()
  @IsArray()
  scheduleEntries?: any[];
}

export class ScheduleResponseDto {
  id: string;
  sector: string;
  colony: string;
  period: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

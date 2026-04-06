import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateValidationRuleDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la regla es requerido' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es requerida' })
  description: string;

  @IsString()
  @IsNotEmpty({ message: 'El mensaje de error es requerido' })
  errorMessage: string;

  @IsString()
  @IsNotEmpty({ message: 'El tipo de regla (ruleType) es requerido' })
  ruleType: string;

  @IsOptional()
  ruleConfig?: any;
}

export class UpdateValidationRuleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  errorMessage?: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsOptional()
  ruleConfig?: any;
}

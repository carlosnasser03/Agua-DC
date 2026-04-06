import { IsString, IsOptional, IsEmail, IsEnum, IsUUID, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'El formato del email es inválido' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  @MaxLength(120, { message: 'El nombre es demasiado largo' })
  fullname?: string;

  @IsOptional()
  @IsUUID('4', { message: 'El ID de rol debe ser un UUID válido' })
  roleId?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'SUSPENDED'], { message: 'Estado inválido' })
  status?: string;
}

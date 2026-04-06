import { IsEmail, MinLength, MaxLength, IsNotEmpty, IsEnum, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email debe ser válido' })
  @IsNotEmpty({ message: 'Email requerido' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'Contraseña requerida' })
  @MinLength(8, { message: 'Mínimo 8 caracteres para la contraseña' })
  @MaxLength(64, { message: 'Máximo 64 caracteres para la contraseña' })
  password: string;

  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'Nombre completo requerido' })
  @MaxLength(120, { message: 'Nombre demasiado largo' })
  fullname: string;

  @IsUUID('4', { message: 'Formato de ID de rol inválido' })
  @IsNotEmpty({ message: 'ID de rol requerido' })
  roleId: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  role: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

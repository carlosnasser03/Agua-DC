import { IsEmail, IsString, IsNotEmpty, IsUUID, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullname: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(100)
  password: string;

  @IsUUID('4', { message: 'El roleId debe ser un UUID válido' })
  @IsNotEmpty()
  roleId: string;
}

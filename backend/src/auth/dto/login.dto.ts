import { IsEmail, MinLength, MaxLength, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Correo electrónico del administrador', example: 'admin@aguadc.hn' })
  @IsEmail({}, { message: 'El email debe ser válido' })
  email: string;

  @ApiProperty({ description: 'Contraseña de acceso', example: 'password123' })
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(6, { message: 'Mínimo 6 caracteres' })
  @MaxLength(64, { message: 'Máximo 64 caracteres' })
  password: string;

  @ApiProperty({ description: 'Estrategia de autenticación', default: 'jwt', example: 'jwt' })
  @IsString()
  @IsNotEmpty()
  strategyName: string;
}

export class LoginResponseDto {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export class RefreshTokenDto {
  access_token: string;
}

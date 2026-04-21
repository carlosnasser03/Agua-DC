import { IsEmail, MinLength, MaxLength, IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Estrategia de autenticación', default: 'jwt', example: 'jwt', enum: ['jwt', 'device'] })
  @IsString()
  @IsNotEmpty()
  strategyName?: string = 'jwt';

  // JWT Strategy fields (optional if using device strategy)
  @ApiProperty({ description: 'Correo electrónico (requerido para JWT)', example: 'admin@aguadc.hn', required: false })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Contraseña (requerido para JWT)', example: 'password123', required: false })
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(6, { message: 'Mínimo 6 caracteres' })
  @MaxLength(64, { message: 'Máximo 64 caracteres' })
  @IsOptional()
  password?: string;

  // Device Strategy fields (optional if using JWT strategy)
  @ApiProperty({ description: 'UUID del dispositivo (requerido para device strategy)', example: '71b70d38-abc3-61f4-1234-567890abcdef', required: false })
  @IsString()
  @IsOptional()
  deviceUuid?: string;

  @ApiProperty({ description: 'Plataforma del dispositivo (android/ios)', example: 'android', required: false })
  @IsString()
  @IsOptional()
  platform?: string;

  @ApiProperty({ description: 'Versión de la app', example: '1.0.0', required: false })
  @IsString()
  @IsOptional()
  appVersion?: string;
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

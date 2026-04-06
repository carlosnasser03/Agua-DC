/**
 * © 2026 AguaDC - AuthController supporting pluggable strategies
 */
import { Controller, Post, UseGuards, Request, Body, Get, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiHeader } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';

/**
 * AuthController
 * Handles authentication via multiple strategies
 * Supports: JWT (email/password), OAuth (stub), Device (UUID)
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Login endpoint - supports multiple strategies
   * Can be called as:
   * - JWT: POST /auth/login { strategyName: 'jwt', email, password }
   * - Device: POST /auth/login { strategyName: 'device', deviceUuid, platform?, appVersion? }
   */
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión', description: 'Autenticación base por estrategia. Soporta "jwt" por defecto.' })
  @ApiResponse({ status: 201, description: 'Sesión iniciada. Retorna token JWT.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(@Body() body: LoginDto) {
    const strategyName = body.strategyName || 'jwt'; // Default to JWT for backward compatibility
    return this.authService.login(strategyName, body);
  }

  /**
   * Refresh token
   */
  @Post('refresh')
  @UseGuards(JwtAuthGuard) // Using custom Guard
  @ApiOperation({ summary: 'Refrescar Token', description: 'Permite renovar un JWT recibiendo el JWT expirado en el header Authorization.' })
  @ApiHeader({ name: 'Authorization', required: true, description: 'Bearer {token_expirado}' })
  @ApiResponse({ status: 201, description: 'Nuevo Access Token retornado.' })
  @ApiResponse({ status: 401, description: 'Token inválido o manipulado.' })
  async refresh(@Request() req: any) {
    if (!req.user) {
      throw new UnauthorizedException('Perfil de usuario no encontrado en la petición');
    }
    return this.authService.refreshToken('jwt', req.user);
  }

  /**
   * List available authentication strategies
   */
  @Get('strategies')
  @ApiOperation({ summary: 'Listar configuraciones de Auth', description: 'Lista las estrategias de autenticación disponibles.' })
  getAvailableStrategies() {
    return {
      available: this.authService.getAvailableStrategies(),
      default: 'jwt',
    };
  }

  /**
   * Get authenticated user profile
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar perfil activo', description: 'Lee el JWT provisto en Headers y retorna el perfil de usuario asociado.' })
  getProfile(@Request() req) {
    return req.user;
  }
}

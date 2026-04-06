/**
 * © 2026 AguaDC - Propiedad Privada.
 * Queda prohibida la reproducción, distribución o modificación total o parcial
 * de este código sin autorización expresa del autor.
 *
 * Proyecto  : AguaDC — Horario de Agua para el Distrito Central
 * Entidad   : U.M.A.P.S. — Unidad Municipal de Agua Potable y Saneamiento
 * Municipio : Distrito Central, Honduras
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/users.service';
import { IAuthStrategy, IAuthPayload, IAuthCredentials, IAuthTokens } from '../interfaces/IAuthStrategy';

/**
 * JwtAuthStrategy - JWT-based authentication for admin panel
 */
@Injectable()
export class JwtAuthStrategy implements IAuthStrategy {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async authenticate(credentials: IAuthCredentials): Promise<IAuthPayload> {
    if (!credentials.email || !credentials.password) {
      throw new UnauthorizedException('Email and password are required');
    }

    const user = await this.usersService.findOneByEmail(credentials.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
    if (!isValidPassword) throw new UnauthorizedException('Invalid credentials');

    if (user.status !== 'ACTIVE') throw new UnauthorizedException('User account is inactive');

    return {
      sub: user.id,
      email: user.email,
      role: user.role?.name || 'User',
      permissions: user.role?.permissions?.map(rp => `${rp.permission.module}:${rp.permission.action}`) || [],
    };
  }

  async generateTokens(payload: IAuthPayload): Promise<IAuthTokens> {
    const accessToken = this.jwtService.sign(payload);
    return { accessToken, expiresIn: this.getTokenExpiration() / 1000 };
  }

  async validateToken(token: string): Promise<IAuthPayload> {
    try {
      const payload = this.jwtService.verify(token);
      return { sub: payload.sub, email: payload.email, role: payload.role, permissions: payload.permissions || [] };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async refreshToken(token: string): Promise<IAuthTokens> {
    const payload = await this.validateToken(token);
    return this.generateTokens(payload);
  }

  async revokeToken(token: string): Promise<void> {
    // JWT is stateless
  }

  getStrategyName(): string {
    return 'JWT';
  }

  getTokenExpiration(): number {
    return 24 * 60 * 60 * 1000;
  }
}

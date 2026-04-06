/**
 * © 2026 AguaDC - UsersService (Facade)
 * Main service for user management operations
 *
 * Post-refactoring (Phase 3A):
 * - Delegates authentication operations to AuthUserService
 * - Delegates audit operations to AuditUserService
 * - Delegates permission operations to PermissionUserService
 * - Maintains backward compatibility with existing code
 */

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

// Import segregated services
import { AuthUserService } from './services/auth-user.service';
import { AuditUserService } from './services/audit-user.service';
import { PermissionUserService } from './services/permission-user.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthUserService,
    private auditService: AuditUserService,
    private permissionService: PermissionUserService,
  ) {}

  // Usado por AuthService para validar login
  async findOneByEmail(email: string) {
    return this.prisma.adminUser.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } }
          }
        }
      }
    });
  }

  // Listar todos los usuarios (sin exponer passwords)
  async findAll() {
    return this.prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        fullname: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        role: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Obtener un usuario por ID
  async findOne(id: string) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullname: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        role: { select: { id: true, name: true, description: true } }
      }
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  // Crear nuevo usuario administrador
  async create(dto: { email: string; fullname: string; password: string; roleId: string }) {
    const exists = await this.prisma.adminUser.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Ya existe un usuario con ese correo');

    const hashedPassword = await this.authService.hashPassword(dto.password);
    return this.prisma.adminUser.create({
      data: {
        email: dto.email,
        fullname: dto.fullname,
        password: hashedPassword,
        roleId: dto.roleId,
        status: 'ACTIVE',
      },
      select: {
        id: true, email: true, fullname: true, status: true,
        role: { select: { id: true, name: true } }
      }
    });
  }

  // Actualizar usuario (nombre, rol, status)
  async update(id: string, dto: { fullname?: string; roleId?: string; status?: string }) {
    await this.findOne(id);
    
    // Use PermissionUserService to assign role if provided
    if (dto.roleId) {
      await this.permissionService.assignRole(id, dto.roleId);
    }

    return this.prisma.adminUser.update({
      where: { id },
      data: {
        fullname: dto.fullname,
        status: dto.status,
        // roleId is handled above by permissionService
      },
      select: {
        id: true, email: true, fullname: true, status: true,
        role: { select: { id: true, name: true } }
      }
    });
  }

  // Cambiar password de un usuario
  async changePassword(id: string, newPassword: string) {
    await this.authService.changePassword(id, newPassword);
    return { message: 'Contraseña actualizada correctamente' };
  }

  // Actualizar lastLogin
  async updateLastLogin(id: string) {
    await this.auditService.recordLogin(id);
    return this.prisma.adminUser.findUnique({
      where: { id }
    });
  }

  // Obtener todos los roles disponibles
  async getRoles() {
    return this.prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } }
      }
    });
  }

  // Additional delegating methods for convenience
  // These maintain backward compatibility while routing to segregated services

  /**
   * Validate password for login
   * @deprecated Use AuthUserService directly
   */
  async validatePassword(plain: string, hashed: string): Promise<boolean> {
    return this.authService.validatePassword(plain, hashed);
  }

  /**
   * Get user permissions
   * @deprecated Use PermissionUserService directly
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    return this.permissionService.getUserPermissions(userId);
  }

  /**
   * Check if user has permission
   * @deprecated Use PermissionUserService directly
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    return this.permissionService.hasPermission(userId, permission);
  }

  /**
   * Get user audit history
   * @deprecated Use AuditUserService directly
   */
  async getAuditHistory(userId: string): Promise<any[]> {
    return this.auditService.getAuditHistory(userId);
  }
}

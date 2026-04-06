/**
 * © 2026 AguaDC - Segregated Service
 * PermissionUserService - Authorization/Permission Operations
 *
 * Handles all authorization-related operations for AdminUser.
 * Part of Interface Segregation Principle (ISP) refactoring.
 *
 * Responsibilities:
 * - Retrieving user permissions
 * - Checking permission existence
 * - Managing role assignments
 * - Computing permission matrices
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionUserService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all permissions granted to a user through their assigned role
   * @param userId - ID of the user
   * @returns Promise<string[]> - Array of permission identifiers
   * @throws NotFoundException if user does not exist
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Extract permission names from role
    if (!user.role || !user.role.permissions) {
      return [];
    }

    return user.role.permissions.map((rp) => rp.permission.action);
  }

  /**
   * Check if a user has a specific permission
   * @param userId - ID of the user
   * @param permission - Permission name to check
   * @returns Promise<boolean> - True if user has permission, false otherwise
   * @throws NotFoundException if user does not exist
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permission);
  }

  /**
   * Assign a role to a user
   * Replaces the user's current role with the new one
   * @param userId - ID of the user
   * @param roleId - ID of the role to assign
   * @throws NotFoundException if user or role does not exist
   * @throws BadRequestException if role assignment fails
   */
  async assignRole(userId: string, roleId: string): Promise<void> {
    // Verify user exists
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verify role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });
    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }

    try {
      await this.prisma.adminUser.update({
        where: { id: userId },
        data: { roleId },
      });
    } catch (error) {
      throw new BadRequestException('No se puede asignar el rol al usuario');
    }
  }

  /**
   * Get the role assigned to a user
   * @param userId - ID of the user
   * @returns Promise<Role> - The user's assigned role
   * @throws NotFoundException if user does not exist
   */
  async getUserRole(userId: string): Promise<any> {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user.role;
  }

  /**
   * Check if user has any of the specified permissions
   * @param userId - ID of the user
   * @param permissions - Array of permission names
   * @returns Promise<boolean> - True if user has at least one permission, false otherwise
   * @throws NotFoundException if user does not exist
   */
  async hasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.some((p) => userPermissions.includes(p));
  }

  /**
   * Check if user has all specified permissions
   * @param userId - ID of the user
   * @param permissions - Array of permission names
   * @returns Promise<boolean> - True if user has all permissions, false otherwise
   * @throws NotFoundException if user does not exist
   */
  async hasAllPermissions(userId: string, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.every((p) => userPermissions.includes(p));
  }
}

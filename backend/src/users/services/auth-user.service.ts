/**
 * © 2026 AguaDC - Segregated Service
 * AuthUserService - Authentication Operations
 *
 * Handles all authentication-related operations for AdminUser.
 * Part of Interface Segregation Principle (ISP) refactoring.
 *
 * Responsibilities:
 * - Password hashing and validation
 * - User deactivation
 * - Password changes
 * - Account status management
 */

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthUserService {
  constructor(private prisma: PrismaService) {}

  /**
   * Hash a plaintext password using bcrypt
   * @param password - Plaintext password to hash
   * @returns Promise<string> - Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    const SALT_ROUNDS = 12;
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Validate a plaintext password against a hashed password
   * @param plain - Plaintext password to validate
   * @param hashed - Hashed password to compare against
   * @returns Promise<boolean> - True if passwords match, false otherwise
   */
  async validatePassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  /**
   * Change a user's password
   * Validates password strength and updates the database
   * @param userId - ID of the user
   * @param newPassword - New plaintext password
   * @throws BadRequestException if password is invalid
   * @throws NotFoundException if user does not exist
   */
  async changePassword(userId: string, newPassword: string): Promise<void> {
    if (!newPassword || newPassword.trim().length < 8) {
      throw new BadRequestException('La contraseña debe tener al menos 8 caracteres');
    }

    // Verify user exists
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const hashedPassword = await this.hashPassword(newPassword);
    await this.prisma.adminUser.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  /**
   * Deactivate a user account (set status to INACTIVE)
   * Deactivated users cannot login
   * @param userId - ID of the user to deactivate
   * @throws NotFoundException if user does not exist
   */
  async deactivateUser(userId: string): Promise<void> {
    // Verify user exists
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.prisma.adminUser.update({
      where: { id: userId },
      data: { status: 'INACTIVE' },
    });
  }

  /**
   * Activate a user account (set status to ACTIVE)
   * Activated users can login
   * @param userId - ID of the user to activate
   * @throws NotFoundException if user does not exist
   */
  async activateUser(userId: string): Promise<void> {
    // Verify user exists
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.prisma.adminUser.update({
      where: { id: userId },
      data: { status: 'ACTIVE' },
    });
  }
}

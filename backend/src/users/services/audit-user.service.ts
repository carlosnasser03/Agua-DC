/**
 * © 2026 AguaDC - Segregated Service
 * AuditUserService - Audit Trail Operations
 *
 * Handles all audit-related operations for AdminUser.
 * Part of Interface Segregation Principle (ISP) refactoring.
 *
 * Responsibilities:
 * - Recording login events
 * - Retrieving audit history
 * - Tracking user activity timestamps
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditUserService {
  constructor(private prisma: PrismaService) {}

  /**
   * Record a login event for a user
   * Updates the lastLogin timestamp
   * @param userId - ID of the user logging in
   * @returns Promise<Date> - The updated lastLogin timestamp
   * @throws NotFoundException if user does not exist
   */
  async recordLogin(userId: string): Promise<Date> {
    // Verify user exists
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const updatedUser = await this.prisma.adminUser.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });

    return updatedUser.lastLogin!;
  }

  /**
   * Retrieve complete audit history for a user
   * Returns all AuditLog entries related to this user
   * @param userId - ID of the user
   * @returns Promise<AuditLog[]> - Array of audit log entries
   * @throws NotFoundException if user does not exist
   */
  async getAuditHistory(userId: string): Promise<any[]> {
    // Verify user exists
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get the timestamp of the user's last login
   * @param userId - ID of the user
   * @returns Promise<Date | null> - Last login timestamp, or null if never logged in
   * @throws NotFoundException if user does not exist
   */
  async getLastLogin(userId: string): Promise<Date | null> {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
      select: { lastLogin: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user.lastLogin || null;
  }

  /**
   * Get user's creation timestamp
   * @param userId - ID of the user
   * @returns Promise<Date> - User creation timestamp
   * @throws NotFoundException if user does not exist
   */
  async getCreatedAt(userId: string): Promise<Date> {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user.createdAt;
  }

  /**
   * Get user's last modification timestamp
   * @param userId - ID of the user
   * @returns Promise<Date> - User last updated timestamp
   * @throws NotFoundException if user does not exist
   */
  async getUpdatedAt(userId: string): Promise<Date> {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
      select: { updatedAt: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user.updatedAt;
  }
}

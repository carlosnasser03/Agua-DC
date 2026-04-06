/**
 * © 2026 AguaDC - Test Specifications
 * PermissionUserService - Authorization/Permission Operations Tests
 *
 * Unit tests for PermissionUserService covering:
 * - Retrieving user permissions
 * - Checking individual permissions
 * - Assigning roles
 * - Getting role details
 * - Checking multiple permission conditions
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PermissionUserService } from '../services/permission-user.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('PermissionUserService', () => {
  let service: PermissionUserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionUserService,
        {
          provide: PrismaService,
          useValue: {
            adminUser: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            role: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PermissionUserService>(PermissionUserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getUserPermissions', () => {
    it('should return list of user permissions', async () => {
      const userId = 'user-123';
      const permissions = [
        { name: 'CREATE_SCHEDULE' },
        { name: 'VIEW_REPORTS' },
      ];

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce({
        id: userId,
        role: {
          permissions: [
            { permission: permissions[0] },
            { permission: permissions[1] },
          ],
        },
      });

      const result = await service.getUserPermissions(userId);

      expect(result).toEqual(['CREATE_SCHEDULE', 'VIEW_REPORTS']);
    });

    it('should return empty array if user has no role', async () => {
      const userId = 'user-123';

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce({
        id: userId,
        role: null,
      });

      const result = await service.getUserPermissions(userId);

      expect(result).toEqual([]);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      const userId = 'non-existent-user';

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.getUserPermissions(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('hasPermission', () => {
    it('should return true if user has permission', async () => {
      const userId = 'user-123';
      const permission = 'CREATE_SCHEDULE';

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce({
        id: userId,
        role: {
          permissions: [
            { permission: { name: 'CREATE_SCHEDULE' } },
            { permission: { name: 'VIEW_REPORTS' } },
          ],
        },
      });

      const result = await service.hasPermission(userId, permission);

      expect(result).toBe(true);
    });

    it('should return false if user does not have permission', async () => {
      const userId = 'user-123';
      const permission = 'DELETE_USER';

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce({
        id: userId,
        role: {
          permissions: [
            { permission: { name: 'CREATE_SCHEDULE' } },
          ],
        },
      });

      const result = await service.hasPermission(userId, permission);

      expect(result).toBe(false);
    });
  });

  describe('assignRole', () => {
    it('should assign role to user successfully', async () => {
      const userId = 'user-123';
      const roleId = 'role-456';

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce({
        id: userId,
      });
      (prisma.role.findUnique as jest.Mock).mockResolvedValueOnce({
        id: roleId,
      });
      (prisma.adminUser.update as jest.Mock).mockResolvedValueOnce({
        id: userId,
        roleId,
      });

      await service.assignRole(userId, roleId);

      expect(prisma.adminUser.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { roleId },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const userId = 'non-existent-user';
      const roleId = 'role-456';

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.assignRole(userId, roleId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if role does not exist', async () => {
      const userId = 'user-123';
      const roleId = 'non-existent-role';

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce({
        id: userId,
      });
      (prisma.role.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.assignRole(userId, roleId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException on update failure', async () => {
      const userId = 'user-123';
      const roleId = 'role-456';

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce({
        id: userId,
      });
      (prisma.role.findUnique as jest.Mock).mockResolvedValueOnce({
        id: roleId,
      });
      (prisma.adminUser.update as jest.Mock).mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(service.assignRole(userId, roleId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getUserRole', () => {
    it('should return user role with permissions', async () => {
      const userId = 'user-123';
      const role = {
        id: 'role-456',
        name: 'Admin',
        permissions: [
          { permission: { name: 'CREATE_SCHEDULE' } },
        ],
      };

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce({
        id: userId,
        role,
      });

      const result = await service.getUserRole(userId);

      expect(result).toEqual(role);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      const userId = 'non-existent-user';

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.getUserRole(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has at least one permission', async () => {
      const userId = 'user-123';
      const permissions = ['DELETE_USER', 'CREATE_SCHEDULE'];

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce({
        id: userId,
        role: {
          permissions: [
            { permission: { name: 'CREATE_SCHEDULE' } },
          ],
        },
      });

      const result = await service.hasAnyPermission(userId, permissions);

      expect(result).toBe(true);
    });

    it('should return false if user has none of the permissions', async () => {
      const userId = 'user-123';
      const permissions = ['DELETE_USER', 'MANAGE_ROLES'];

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce({
        id: userId,
        role: {
          permissions: [
            { permission: { name: 'CREATE_SCHEDULE' } },
          ],
        },
      });

      const result = await service.hasAnyPermission(userId, permissions);

      expect(result).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if user has all permissions', async () => {
      const userId = 'user-123';
      const permissions = ['CREATE_SCHEDULE', 'VIEW_REPORTS'];

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce({
        id: userId,
        role: {
          permissions: [
            { permission: { name: 'CREATE_SCHEDULE' } },
            { permission: { name: 'VIEW_REPORTS' } },
          ],
        },
      });

      const result = await service.hasAllPermissions(userId, permissions);

      expect(result).toBe(true);
    });

    it('should return false if user missing any permission', async () => {
      const userId = 'user-123';
      const permissions = ['CREATE_SCHEDULE', 'DELETE_USER'];

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce({
        id: userId,
        role: {
          permissions: [
            { permission: { name: 'CREATE_SCHEDULE' } },
          ],
        },
      });

      const result = await service.hasAllPermissions(userId, permissions);

      expect(result).toBe(false);
    });
  });
});

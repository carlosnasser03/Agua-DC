/**
 * © 2026 AguaDC - Test Specifications
 * AuditUserService - Audit Trail Operations Tests
 *
 * Unit tests for AuditUserService covering:
 * - Recording login events
 * - Retrieving audit history
 * - Getting last login timestamp
 * - Getting creation/modification timestamps
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AuditUserService } from '../services/audit-user.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AuditUserService', () => {
  let service: AuditUserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditUserService,
        {
          provide: PrismaService,
          useValue: {
            adminUser: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            auditLog: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuditUserService>(AuditUserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('recordLogin', () => {
    it('should record login successfully', async () => {
      const userId = 'user-123';
      const now = new Date();

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce({
        id: userId,
      });
      (prisma.adminUser.update as jest.Mock).mockResolvedValueOnce({
        id: userId,
        lastLogin: now,
      });

      const result = await service.recordLogin(userId);

      expect(prisma.adminUser.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(prisma.adminUser.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { lastLogin: expect.any(Date) },
      });
      expect(result).toEqual(expect.any(Date));
    });

    it('should throw NotFoundException for non-existent user', async () => {
      const userId = 'non-existent-user';

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.recordLogin(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAuditHistory', () => {
    it('should retrieve audit history for user', async () => {
      const userId = 'user-123';
      const auditLogs = [
        {
          id: 'log-1',
          userId,
          action: 'CREATE',
          module: 'USERS',
          createdAt: new Date(),
        },
        {
          id: 'log-2',
          userId,
          action: 'UPDATE',
          module: 'USERS',
          createdAt: new Date(),
        },
      ];

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce({
        id: userId,
      });
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValueOnce(auditLogs);

      const result = await service.getAuditHistory(userId);

      expect(result).toEqual(auditLogs);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array if no audit logs exist', async () => {
      const userId = 'user-123';

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce({
        id: userId,
      });
      (prisma.auditLog.findMany as jest.Mock).mockResolvedValueOnce([]);

      const result = await service.getAuditHistory(userId);

      expect(result).toEqual([]);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      const userId = 'non-existent-user';

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.getAuditHistory(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getLastLogin', () => {
    it('should return last login timestamp', async () => {
      const userId = 'user-123';
      const lastLogin = new Date('2026-04-06T10:30:00Z');

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce({
        lastLogin,
      });

      const result = await service.getLastLogin(userId);

      expect(result).toEqual(lastLogin);
    });

    it('should return null if user never logged in', async () => {
      const userId = 'user-123';

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce({
        lastLogin: null,
      });

      const result = await service.getLastLogin(userId);

      expect(result).toBeNull();
    });

    it('should throw NotFoundException for non-existent user', async () => {
      const userId = 'non-existent-user';

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.getLastLogin(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getCreatedAt', () => {
    it('should return user creation timestamp', async () => {
      const userId = 'user-123';
      const createdAt = new Date('2026-01-01T00:00:00Z');

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce({
        createdAt,
      });

      const result = await service.getCreatedAt(userId);

      expect(result).toEqual(createdAt);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      const userId = 'non-existent-user';

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.getCreatedAt(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUpdatedAt', () => {
    it('should return user last update timestamp', async () => {
      const userId = 'user-123';
      const updatedAt = new Date('2026-03-15T14:22:00Z');

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce({
        updatedAt,
      });

      const result = await service.getUpdatedAt(userId);

      expect(result).toEqual(updatedAt);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      const userId = 'non-existent-user';

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.getUpdatedAt(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

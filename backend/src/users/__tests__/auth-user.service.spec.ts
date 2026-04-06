/**
 * © 2026 AguaDC - Test Specifications
 * AuthUserService - Authentication Operations Tests
 *
 * Unit tests for AuthUserService covering:
 * - Password hashing
 * - Password validation
 * - Password changes
 * - User deactivation/activation
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthUserService } from '../services/auth-user.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AuthUserService', () => {
  let service: AuthUserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthUserService,
        {
          provide: PrismaService,
          useValue: {
            adminUser: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthUserService>(AuthUserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('hashPassword', () => {
    it('should hash a plaintext password', async () => {
      const password = 'testPassword123';
      const hashedPassword = await service.hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(20);
    });

    it('should produce different hashes for the same password', async () => {
      const password = 'testPassword123';
      const hash1 = await service.hashPassword(password);
      const hash2 = await service.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('validatePassword', () => {
    it('should return true for matching passwords', async () => {
      const password = 'testPassword123';
      const hashedPassword = await service.hashPassword(password);

      const isValid = await service.validatePassword(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hashedPassword = await service.hashPassword(password);

      const isValid = await service.validatePassword(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });
  });

  describe('changePassword', () => {
    it('should change user password successfully', async () => {
      const userId = 'user-123';
      const newPassword = 'newPassword123';

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce({
        id: userId,
      });
      (prisma.adminUser.update as jest.Mock).mockResolvedValueOnce({
        id: userId,
        password: 'hashed_password',
      });

      await service.changePassword(userId, newPassword);

      expect(prisma.adminUser.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(prisma.adminUser.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException for short passwords', async () => {
      const userId = 'user-123';
      const shortPassword = 'short';

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce({
        id: userId,
      });

      await expect(service.changePassword(userId, shortPassword)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException for non-existent user', async () => {
      const userId = 'non-existent-user';
      const newPassword = 'newPassword123';

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.changePassword(userId, newPassword)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user successfully', async () => {
      const userId = 'user-123';

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce({
        id: userId,
      });
      (prisma.adminUser.update as jest.Mock).mockResolvedValueOnce({
        id: userId,
        status: 'INACTIVE',
      });

      await service.deactivateUser(userId);

      expect(prisma.adminUser.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { status: 'INACTIVE' },
      });
    });

    it('should throw NotFoundException for non-existent user', async () => {
      const userId = 'non-existent-user';

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(service.deactivateUser(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('activateUser', () => {
    it('should activate user successfully', async () => {
      const userId = 'user-123';

      (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce({
        id: userId,
      });
      (prisma.adminUser.update as jest.Mock).mockResolvedValueOnce({
        id: userId,
        status: 'ACTIVE',
      });

      await service.activateUser(userId);

      expect(prisma.adminUser.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { status: 'ACTIVE' },
      });
    });
  });
});

/**
 * © 2026 AguaDC - Propiedad Privada.
 * Queda prohibida la reproducción, distribución o modificación total o parcial
 * de este código sin autorización expresa del autor.
 *
 * Proyecto  : AguaDC — Horario de Agua para el Distrito Central
 * Entidad   : U.M.A.P.S. — Unidad Municipal de Agua Potable y Saneamiento
 * Municipio : Distrito Central, Honduras
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ThemeService } from '../theme.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ThemeService', () => {
  let service: ThemeService;
  let prismaService: PrismaService;

  const mockTheme = {
    id: '1',
    name: 'light',
    description: 'Light theme',
    isDefault: true,
    colors: { primary: '#003366' },
    typography: { fontFamily: 'Inter' },
    spacing: { unit: 4 },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThemeService,
        {
          provide: PrismaService,
          useValue: {
            themeConfig: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ThemeService>(ThemeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllThemes', () => {
    it('should return all themes', async () => {
      jest
        .spyOn(prismaService.themeConfig, 'findMany')
        .mockResolvedValue([mockTheme]);

      const result = await service.getAllThemes();

      expect(result).toEqual([mockTheme]);
      expect(prismaService.themeConfig.findMany).toHaveBeenCalled();
    });
  });

  describe('getThemeByName', () => {
    it('should return a theme by name', async () => {
      jest
        .spyOn(prismaService.themeConfig, 'findUnique')
        .mockResolvedValue(mockTheme);

      const result = await service.getThemeByName('light');

      expect(result).toEqual(mockTheme);
      expect(prismaService.themeConfig.findUnique).toHaveBeenCalledWith({
        where: { name: 'light' },
      });
    });

    it('should throw NotFoundException if theme not found', async () => {
      jest
        .spyOn(prismaService.themeConfig, 'findUnique')
        .mockResolvedValue(null);

      await expect(service.getThemeByName('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getDefaultTheme', () => {
    it('should return the default theme', async () => {
      jest
        .spyOn(prismaService.themeConfig, 'findFirst')
        .mockResolvedValue(mockTheme);

      const result = await service.getDefaultTheme();

      expect(result).toEqual(mockTheme);
    });

    it('should throw NotFoundException if no themes exist', async () => {
      jest
        .spyOn(prismaService.themeConfig, 'findFirst')
        .mockResolvedValue(null);

      await expect(service.getDefaultTheme()).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTheme', () => {
    it('should create a new theme', async () => {
      const createDto = {
        name: 'dark',
        description: 'Dark theme',
        isDefault: false,
        colors: { primary: '#00AEEF' },
        typography: { fontFamily: 'Inter' },
        spacing: { unit: 4 },
      };

      jest.spyOn(prismaService.themeConfig, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prismaService.themeConfig, 'create')
        .mockResolvedValue({ ...mockTheme, ...createDto });

      const result = await service.createTheme(createDto);

      expect(result.name).toBe('dark');
      expect(prismaService.themeConfig.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if theme name exists', async () => {
      const createDto = {
        name: 'light',
        description: 'Light theme',
        isDefault: false,
        colors: {},
        typography: {},
        spacing: {},
      };

      jest
        .spyOn(prismaService.themeConfig, 'findUnique')
        .mockResolvedValue(mockTheme);

      await expect(service.createTheme(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('updateTheme', () => {
    it('should update an existing theme', async () => {
      const updateDto = { description: 'Updated light theme' };

      jest
        .spyOn(prismaService.themeConfig, 'findUnique')
        .mockResolvedValue(mockTheme);
      jest
        .spyOn(prismaService.themeConfig, 'update')
        .mockResolvedValue({ ...mockTheme, ...updateDto });

      const result = await service.updateTheme('1', updateDto);

      expect(result.description).toBe('Updated light theme');
      expect(prismaService.themeConfig.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if theme not found', async () => {
      jest
        .spyOn(prismaService.themeConfig, 'findUnique')
        .mockResolvedValue(null);

      await expect(
        service.updateTheme('1', { description: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('setAsDefault', () => {
    it('should set a theme as default', async () => {
      jest
        .spyOn(prismaService.themeConfig, 'findUnique')
        .mockResolvedValue(mockTheme);
      jest
        .spyOn(prismaService.themeConfig, 'updateMany')
        .mockResolvedValue({ count: 1 });
      jest
        .spyOn(prismaService.themeConfig, 'update')
        .mockResolvedValue(mockTheme);

      const result = await service.setAsDefault('1');

      expect(result.isDefault).toBe(true);
      expect(prismaService.themeConfig.updateMany).toHaveBeenCalled();
      expect(prismaService.themeConfig.update).toHaveBeenCalled();
    });
  });

  describe('deleteTheme', () => {
    it('should delete a theme', async () => {
      const nonDefaultTheme = { ...mockTheme, isDefault: false };

      jest
        .spyOn(prismaService.themeConfig, 'findUnique')
        .mockResolvedValue(nonDefaultTheme);
      jest.spyOn(prismaService.themeConfig, 'delete').mockResolvedValue(undefined);

      await service.deleteTheme('1');

      expect(prismaService.themeConfig.delete).toHaveBeenCalled();
    });

    it('should throw ConflictException if deleting last default theme', async () => {
      jest
        .spyOn(prismaService.themeConfig, 'findUnique')
        .mockResolvedValue(mockTheme);
      jest.spyOn(prismaService.themeConfig, 'count').mockResolvedValue(1);

      await expect(service.deleteTheme('1')).rejects.toThrow(ConflictException);
    });
  });
});

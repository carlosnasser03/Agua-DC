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
import { ThemeController } from '../theme.controller';
import { ThemeService } from '../theme.service';

describe('ThemeController', () => {
  let controller: ThemeController;
  let service: ThemeService;

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
      controllers: [ThemeController],
      providers: [
        {
          provide: ThemeService,
          useValue: {
            getAllThemes: jest.fn(),
            getThemeByName: jest.fn(),
            getDefaultTheme: jest.fn(),
            createTheme: jest.fn(),
            updateTheme: jest.fn(),
            setAsDefault: jest.fn(),
            deleteTheme: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ThemeController>(ThemeController);
    service = module.get<ThemeService>(ThemeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllThemes', () => {
    it('should return all themes', async () => {
      jest.spyOn(service, 'getAllThemes').mockResolvedValue([mockTheme]);

      const result = await controller.getAllThemes();

      expect(result).toEqual([mockTheme]);
      expect(service.getAllThemes).toHaveBeenCalled();
    });
  });

  describe('getDefaultTheme', () => {
    it('should return the default theme', async () => {
      jest.spyOn(service, 'getDefaultTheme').mockResolvedValue(mockTheme);

      const result = await controller.getDefaultTheme();

      expect(result).toEqual(mockTheme);
      expect(service.getDefaultTheme).toHaveBeenCalled();
    });
  });

  describe('getThemeByName', () => {
    it('should return a theme by name', async () => {
      jest.spyOn(service, 'getThemeByName').mockResolvedValue(mockTheme);

      const result = await controller.getThemeByName('light');

      expect(result).toEqual(mockTheme);
      expect(service.getThemeByName).toHaveBeenCalledWith('light');
    });
  });

  describe('createTheme', () => {
    it('should create a new theme', async () => {
      const createDto = {
        name: 'dark',
        description: 'Dark theme',
        colors: {},
        typography: {},
        spacing: {},
      };

      jest.spyOn(service, 'createTheme').mockResolvedValue(mockTheme);

      const result = await controller.createTheme(createDto);

      expect(result).toEqual(mockTheme);
      expect(service.createTheme).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updateTheme', () => {
    it('should update a theme', async () => {
      const updateDto = { description: 'Updated theme' };

      jest.spyOn(service, 'updateTheme').mockResolvedValue(mockTheme);

      const result = await controller.updateTheme('1', updateDto);

      expect(result).toEqual(mockTheme);
      expect(service.updateTheme).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('setAsDefault', () => {
    it('should set a theme as default', async () => {
      jest.spyOn(service, 'setAsDefault').mockResolvedValue(mockTheme);

      const result = await controller.setAsDefault('1');

      expect(result).toEqual(mockTheme);
      expect(service.setAsDefault).toHaveBeenCalledWith('1');
    });
  });

  describe('deleteTheme', () => {
    it('should delete a theme', async () => {
      jest.spyOn(service, 'deleteTheme').mockResolvedValue(undefined);

      await controller.deleteTheme('1');

      expect(service.deleteTheme).toHaveBeenCalledWith('1');
    });
  });
});

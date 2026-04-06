/**
 * © 2026 AguaDC - Propiedad Privada.
 * Queda prohibida la reproducción, distribución o modificación total o parcial
 * de este código sin autorización expresa del autor.
 *
 * Proyecto  : AguaDC — Horario de Agua para el Distrito Central
 * Entidad   : U.M.A.P.S. — Unidad Municipal de Agua Potable y Saneamiento
 * Municipio : Distrito Central, Honduras
 */

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ThemeConfig } from '@prisma/client';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';

@Injectable()
export class ThemeService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all available themes
   */
  async getAllThemes(): Promise<ThemeConfig[]> {
    return this.prisma.themeConfig.findMany({
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  /**
   * Get a specific theme by name
   */
  async getThemeByName(name: string): Promise<ThemeConfig> {
    const theme = await this.prisma.themeConfig.findUnique({
      where: { name },
    });

    if (!theme) {
      throw new NotFoundException(`Theme "${name}" not found`);
    }

    return theme;
  }

  /**
   * Get the default theme
   */
  async getDefaultTheme(): Promise<ThemeConfig> {
    const defaultTheme = await this.prisma.themeConfig.findFirst({
      where: { isDefault: true },
    });

    if (!defaultTheme) {
      // Fallback: return the first theme if no default exists
      const firstTheme = await this.prisma.themeConfig.findFirst();
      if (!firstTheme) {
        throw new NotFoundException('No themes configured in the system');
      }
      return firstTheme;
    }

    return defaultTheme;
  }

  /**
   * Create a new theme
   */
  async createTheme(data: CreateThemeDto): Promise<ThemeConfig> {
    // Check if theme with this name already exists
    const existingTheme = await this.prisma.themeConfig.findUnique({
      where: { name: data.name },
    });

    if (existingTheme) {
      throw new ConflictException(`Theme with name "${data.name}" already exists`);
    }

    // If this is set as default, unset other defaults
    if (data.isDefault) {
      await this.prisma.themeConfig.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.themeConfig.create({
      data: {
        name: data.name,
        description: data.description,
        isDefault: data.isDefault || false,
        colors: data.colors,
        typography: data.typography,
        spacing: data.spacing,
      },
    });
  }

  /**
   * Update an existing theme
   */
  async updateTheme(id: string, data: UpdateThemeDto): Promise<ThemeConfig> {
    const theme = await this.prisma.themeConfig.findUnique({
      where: { id },
    });

    if (!theme) {
      throw new NotFoundException(`Theme with ID "${id}" not found`);
    }

    // If updating name, check for conflicts
    if (data.name && data.name !== theme.name) {
      const existingTheme = await this.prisma.themeConfig.findUnique({
        where: { name: data.name },
      });

      if (existingTheme) {
        throw new ConflictException(`Theme with name "${data.name}" already exists`);
      }
    }

    // If setting as default, unset others
    if (data.isDefault === true && !theme.isDefault) {
      await this.prisma.themeConfig.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.themeConfig.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        isDefault: data.isDefault,
        colors: data.colors,
        typography: data.typography,
        spacing: data.spacing,
      },
    });
  }

  /**
   * Set a theme as default
   */
  async setAsDefault(id: string): Promise<ThemeConfig> {
    const theme = await this.prisma.themeConfig.findUnique({
      where: { id },
    });

    if (!theme) {
      throw new NotFoundException(`Theme with ID "${id}" not found`);
    }

    // Unset all other defaults
    await this.prisma.themeConfig.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });

    return this.prisma.themeConfig.update({
      where: { id },
      data: { isDefault: true },
    });
  }

  /**
   * Delete a theme
   */
  async deleteTheme(id: string): Promise<void> {
    const theme = await this.prisma.themeConfig.findUnique({
      where: { id },
    });

    if (!theme) {
      throw new NotFoundException(`Theme with ID "${id}" not found`);
    }

    // Prevent deletion of the last default theme
    if (theme.isDefault) {
      const defaultCount = await this.prisma.themeConfig.count({
        where: { isDefault: true },
      });

      if (defaultCount === 1) {
        throw new ConflictException('Cannot delete the last default theme');
      }
    }

    await this.prisma.themeConfig.delete({
      where: { id },
    });
  }
}

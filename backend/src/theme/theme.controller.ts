/**
 * © 2026 AguaDC - Propiedad Privada.
 * Queda prohibida la reproducción, distribución o modificación total o parcial
 * de este código sin autorización expresa del autor.
 *
 * Proyecto  : AguaDC — Horario de Agua para el Distrito Central
 * Entidad   : U.M.A.P.S. — Unidad Municipal de Agua Potable y Saneamiento
 * Municipio : Distrito Central, Honduras
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ThemeService } from './theme.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ThemeDto } from './dto/theme.dto';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';

@Controller('api/theme')
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  /**
   * GET /api/theme/list
   * Get all available themes (public)
   */
  @Get('list')
  async getAllThemes(): Promise<ThemeDto[]> {
    const themes = await this.themeService.getAllThemes();
    return themes.map(this.toDto);
  }

  /**
   * GET /api/theme/default
   * Get the default theme (public)
   */
  @Get('default')
  async getDefaultTheme(): Promise<ThemeDto> {
    const theme = await this.themeService.getDefaultTheme();
    return this.toDto(theme);
  }

  /**
   * GET /api/theme/:name
   * Get a specific theme by name (public)
   */
  @Get(':name')
  async getThemeByName(@Param('name') name: string): Promise<ThemeDto> {
    const theme = await this.themeService.getThemeByName(name);
    return this.toDto(theme);
  }

  /**
   * POST /api/theme
   * Create a new theme (admin only)
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createTheme(@Body() createThemeDto: CreateThemeDto): Promise<ThemeDto> {
    const theme = await this.themeService.createTheme(createThemeDto);
    return this.toDto(theme);
  }

  /**
   * PATCH /api/theme/:id
   * Update an existing theme (admin only)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateTheme(
    @Param('id') id: string,
    @Body() updateThemeDto: UpdateThemeDto,
  ): Promise<ThemeDto> {
    const theme = await this.themeService.updateTheme(id, updateThemeDto);
    return this.toDto(theme);
  }

  /**
   * PATCH /api/theme/:id/set-default
   * Set a theme as default (admin only)
   */
  @Patch(':id/set-default')
  @UseGuards(JwtAuthGuard)
  async setAsDefault(@Param('id') id: string): Promise<ThemeDto> {
    const theme = await this.themeService.setAsDefault(id);
    return this.toDto(theme);
  }

  /**
   * DELETE /api/theme/:id
   * Delete a theme (admin only)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTheme(@Param('id') id: string): Promise<void> {
    await this.themeService.deleteTheme(id);
  }

  /**
   * Helper to convert ThemeConfig to ThemeDto
   */
  private toDto(theme: any): ThemeDto {
    return {
      id: theme.id,
      name: theme.name,
      description: theme.description,
      isDefault: theme.isDefault,
      colors: theme.colors,
      typography: theme.typography,
      spacing: theme.spacing,
      createdAt: theme.createdAt,
      updatedAt: theme.updatedAt,
    };
  }
}

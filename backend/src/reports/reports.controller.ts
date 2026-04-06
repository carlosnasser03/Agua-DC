import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request, Headers, Ip, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-status.dto';
import { GetAdminReportsDto } from './dto/get-admin-reports.dto';
import { ReportPublicDTO } from './dto/report.public.dto';
import { ReportAdminDTO } from './dto/report.admin.dto';
import { ReportAdminListDTO } from './dto/report.admin.list.dto';
import { ReportAdminDetailDTO } from './dto/report.admin.detail.dto';
import { ReportAdminUpdateDTO } from './dto/report.admin.update.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SyncPushTokenDto } from './dto/sync-push-token.dto';
import { AdminAnalyticsDto } from './dto/admin-analytics.dto';
import type { Response } from 'express';
import { Res } from '@nestjs/common';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // --- CITIZEN PUBLIC ENDPOINTS ---

  @Post('app')
  @ApiOperation({ summary: 'Crear reporte', description: 'Crea un nuevo reporte (requiere x-device-id)' })
  @ApiHeader({ name: 'x-device-id', required: true, description: 'UUID del dispositivo móvil' })
  @ApiHeader({ name: 'x-device-fingerprint', required: false, description: 'Fingerprint para evitar spam' })
  @ApiResponse({ status: 201, description: 'Reporte creado satisfactoriamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o falta el device-id.' })
  async createReport(
    @Headers('x-device-id') deviceUuid: string,
    @Headers('x-device-fingerprint') fingerprint: string,
    @Ip() ip: string,
    @Body() dto: CreateReportDto,
  ) {
    if (!deviceUuid) throw new BadRequestException('Dispositivo no identificado');
    return this.reportsService.createReport(deviceUuid, dto, ip, fingerprint);
  }

  @Get('app')
  @ApiOperation({ summary: 'Obtener mis reportes', description: 'Obtiene el historial de reportes creados desde este dispositivo' })
  @ApiHeader({ name: 'x-device-id', required: true, description: 'UUID del dispositivo móvil' })
  @ApiResponse({ status: 200, description: 'Listado de reportes del dispositivo' })
  async getMyReports(@Headers('x-device-id') deviceUuid: string): Promise<ReportPublicDTO[]> {
    if (!deviceUuid) throw new BadRequestException('Dispositivo no identificado');
    return this.reportsService.getMyReports(deviceUuid);
  }

  @Get('app/:publicId')
  @ApiOperation({ summary: 'Detalle de un reporte', description: 'Obtiene la información pública y su estado actual usando el publicId' })
  @ApiHeader({ name: 'x-device-id', required: true, description: 'UUID del dispositivo móvil' })
  @ApiResponse({ status: 200, description: 'Información detallada del reporte.' })
  @ApiResponse({ status: 404, description: 'Reporte no encontrado o no pertenece al dispositivo.' })
  async getDetail(
    @Headers('x-device-id') deviceUuid: string,
    @Param('publicId') publicId: string,
  ): Promise<ReportPublicDTO> {
    if (!deviceUuid) throw new BadRequestException('Dispositivo no identificado');
    return this.reportsService.getReportByPublicId(deviceUuid, publicId);
  }

  @Patch('sync-token')
  @ApiOperation({ summary: 'Sincronizar token Push', description: 'Sincroniza el token de notificaciones push de Expo con el dispositivo' })
  @ApiResponse({ status: 200, description: 'Token actualizado exitosamente' })
  async syncPushToken(@Body() dto: SyncPushTokenDto) {
    return this.reportsService.syncPushToken(dto);
  }

  // --- ADMIN ENDPOINTS (RBAC) ---

  @Get('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos los reportes (Admin)', description: 'Requiere rol Super Admin, Admin Operativo o Agente de Reportes' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin Operativo', 'Agente de Reportes')
  async findAll(@Query() filters: GetAdminReportsDto): Promise<ReportAdminListDTO[]> {
    return this.reportsService.findAllAdminList(filters);
  }

  @Patch('admin/:id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar estado del reporte', description: 'Permite al administrador cambiar el estado de un reporte y añadir notas públicas/privadas' })
  @ApiResponse({ status: 200, description: 'Reporte actualizado.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin Operativo', 'Agente de Reportes')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: ReportAdminUpdateDTO,
    @Request() req,
  ): Promise<ReportAdminDetailDTO> {
    return this.reportsService.updateStatusAndReturnDetail(id, dto, req.user.userId);
  }

  @Get('admin/analytics/summary')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Métricas y Analíticas', description: 'Obtiene el resumen estadístico de reportes (totales, por estado, por tiempo de resolución)' })
  @ApiResponse({ status: 200, description: 'Estadísticas retornadas.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin Operativo')
  async getSummary(@Query() filters: AdminAnalyticsDto) {
    return this.reportsService.getAnalyticsSummary(filters);
  }

  @Get('admin/export/csv')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Exportar Reportes a CSV', description: 'Descarga el historial de reportes en formato CSV' })
  @ApiResponse({ status: 200, description: 'Archivo CSV generado.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin')
  async exportCsv(@Query() filters: AdminAnalyticsDto, @Res() res: Response) {
    const csv = await this.reportsService.exportToCsv(filters);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=reportes-${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csv);
  }
}

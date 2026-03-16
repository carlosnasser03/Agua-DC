import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request, Headers, Ip, BadRequestException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-status.dto';
import { GetAdminReportsDto } from './dto/get-admin-reports.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // --- CITIZEN PUBLIC ENDPOINTS ---

  @Post('app')
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
  async getMyReports(@Headers('x-device-id') deviceUuid: string) {
    if (!deviceUuid) throw new BadRequestException('Dispositivo no identificado');
    return this.reportsService.getMyReports(deviceUuid);
  }

  @Get('app/:publicId')
  async getDetail(
    @Headers('x-device-id') deviceUuid: string,
    @Param('publicId') publicId: string,
  ) {
    if (!deviceUuid) throw new BadRequestException('Dispositivo no identificado');
    return this.reportsService.getReportByPublicId(deviceUuid, publicId);
  }

  // --- ADMIN ENDPOINTS (RBAC) ---

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin Operativo', 'Agente de Reportes')
  async findAll(@Query() filters: GetAdminReportsDto) {
    return this.reportsService.findAllAdmin(filters);
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin Operativo', 'Agente de Reportes')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReportStatusDto,
    @Request() req,
  ) {
    return this.reportsService.updateStatus(id, dto, req.user.userId);
  }

  @Get('admin/analytics/summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin Operativo')
  async getSummary() {
    return this.reportsService.getAnalyticsSummary();
  }
}

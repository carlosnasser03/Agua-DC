import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GlobalConfigService } from '../global-config/global-config.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-status.dto';
import { GetAdminReportsDto } from './dto/get-admin-reports.dto';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private globalConfig: GlobalConfigService,
  ) {}

  // --- CITIZEN FLOW ---

  async findOrCreateDevice(uuid: string, fingerprint?: string) {
    if (!uuid) throw new BadRequestException('Device UUID is required');
    
    let device = await this.prisma.deviceProfile.findUnique({
      where: { deviceUuid: uuid }
    });

    if (!device) {
      device = await this.prisma.deviceProfile.create({
        data: { 
          deviceUuid: uuid,
          deviceFingerprint: fingerprint 
        }
      });
    } else {
      await this.prisma.deviceProfile.update({
        where: { id: device.id },
        data: { lastSeenAt: new Date() }
      });
    }

    return device;
  }

  async createReport(deviceUuid: string, dto: CreateReportDto, ipAddress?: string, fingerprint?: string) {
    const device = await this.findOrCreateDevice(deviceUuid, fingerprint);

    // SECURITY: Throttling check (max 3 reports per day)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentReportsCount = await this.prisma.report.count({
      where: {
        deviceProfileId: device.id,
        createdAt: { gte: oneDayAgo }
      }
    });

    const limit = this.globalConfig.getNumber('reports_per_day', 3);
    if (recentReportsCount >= limit) {
      throw new ForbiddenException(`Has alcanzado el límite de ${limit} reportes por día. Intenta mañana.`);
    }

    // Persist
    return this.prisma.$transaction(async (tx) => {
      const report = await tx.report.create({
        data: {
          deviceProfileId: device.id,
          colonyId: dto.colonyId,
          type: dto.type,
          description: dto.description.substring(0, 200),
          reporterName: dto.reporterName ?? null,
          reporterPhone: dto.reporterPhone ?? null,
          ipAddress: ipAddress ?? null,
          deviceFingerprint: fingerprint ?? null,
          status: 'ENVIADO'
        }
      });

      // Initial history
      await tx.reportStatusHistory.create({
        data: {
          reportId: report.id,
          status: 'ENVIADO'
        }
      });

      return report;
    });
  }

  async getMyReports(deviceUuid: string) {
    const device = await this.prisma.deviceProfile.findUnique({
      where: { deviceUuid }
    });

    if (!device) return [];

    return this.prisma.report.findMany({
      where: { deviceProfileId: device.id },
      include: {
        colony: true,
        statusHistory: {
          orderBy: { changedAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getReportByPublicId(deviceUuid: string, publicId: string) {
    const report = await this.prisma.report.findUnique({
      where: { publicId },
      include: {
        deviceProfile: true,
        colony: true,
        statusHistory: { orderBy: { changedAt: 'asc' } }
      }
    });

    if (!report) throw new NotFoundException('Reporte no encontrado');
    
    // SECURITY: Zero Trust - Device isolated access
    if (report.deviceProfile.deviceUuid !== deviceUuid) {
      throw new ForbiddenException('No tienes permiso para ver este reporte');
    }

    return report;
  }


  // --- ADMIN FLOW ---

  async findAllAdmin(filters: GetAdminReportsDto) {
    const { status, colonyId, type, startDate, endDate } = filters;

    const gte = startDate ? new Date(startDate) : undefined;
    const lte = endDate ? new Date(endDate) : undefined;

    if (gte && isNaN(gte.getTime())) throw new BadRequestException('startDate no es una fecha válida');
    if (lte && isNaN(lte.getTime())) throw new BadRequestException('endDate no es una fecha válida');

    return this.prisma.report.findMany({
      where: {
        ...(status   && { status }),
        ...(colonyId && { colonyId }),
        ...(type     && { type }),
        ...((gte || lte) && { createdAt: { gte, lte } }),
      },
      include: {
        colony: { include: { sector: true } },
        deviceProfile: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStatus(id: string, dto: UpdateReportStatusDto, adminId: string) {
    const report = await this.prisma.report.findUnique({
      where: { id }
    });

    if (!report) throw new NotFoundException('Reporte no encontrado');

    // TRANSITION RULES
    const validTransitions: any = {
      'ENVIADO': ['EN_REVISION', 'RECHAZADO'],
      'EN_REVISION': ['VALIDADO', 'RECHAZADO'],
      'VALIDADO': ['RESUELTO', 'RECHAZADO'],
      'RESUELTO': [],
      'RECHAZADO': ['EN_REVISION']
    };

    if (!validTransitions[report.status].includes(dto.status)) {
      throw new BadRequestException(`Transición de ${report.status} a ${dto.status} no permitida`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.report.update({
        where: { id },
        data: { status: dto.status }
      });

      await tx.reportStatusHistory.create({
        data: {
          reportId: id,
          status: dto.status,
          publicNote: dto.publicNote,
          internalNote: dto.internalNote,
          changedById: adminId
        }
      });

      return updated;
    });
  }

  async getAnalyticsSummary() {
    const summary = await this.prisma.report.groupBy({
      by: ['status'],
      _count: { _all: true }
    });

    const topColonies = await this.prisma.report.groupBy({
      by: ['colonyId'],
      _count: { _all: true },
      orderBy: { _count: { colonyId: 'desc' } },
      take: 5
    });

    return { summary, topColonies };
  }
}

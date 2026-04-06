import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GlobalConfigService } from '../global-config/global-config.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-status.dto';
import { GetAdminReportsDto } from './dto/get-admin-reports.dto';
import { ReportPublicDTO, ReportStatusHistoryPublicDTO } from './dto/report.public.dto';
import { ReportAdminDTO, ReportStatusHistoryAdminDTO } from './dto/report.admin.dto';
import { ReportAdminListDTO } from './dto/report.admin.list.dto';
import { ReportAdminDetailDTO } from './dto/report.admin.detail.dto';
import { ReportAdminUpdateDTO } from './dto/report.admin.update.dto';
import { SyncPushTokenDto } from './dto/sync-push-token.dto';
import { AdminAnalyticsDto } from './dto/admin-analytics.dto';
import { IAdminDevice } from './dto/device.admin.dto';

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

  async getMyReports(deviceUuid: string): Promise<ReportPublicDTO[]> {
    const device = await this.prisma.deviceProfile.findUnique({
      where: { deviceUuid }
    });

    if (!device) return [];

    const reports = await this.prisma.report.findMany({
      where: { deviceProfileId: device.id },
      include: {
        colony: true,
        statusHistory: {
          orderBy: { changedAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return reports.map(r => this.toPublicDTO(r));
  }

  async getReportByPublicId(deviceUuid: string, publicId: string): Promise<ReportPublicDTO> {
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

    return this.toPublicDTO(report);
  }

  async syncPushToken(dto: SyncPushTokenDto) {
    return this.prisma.deviceProfile.upsert({
      where: { deviceUuid: dto.deviceId },
      update: { 
        // pushToken: dto.pushToken, // Commented out until prisma generate works
        lastSeenAt: new Date(),
        platform: dto.platform,
        appVersion: dto.appVersion,
      },
      create: {
        deviceUuid: dto.deviceId,
        // pushToken: dto.pushToken,
        platform: dto.platform,
        appVersion: dto.appVersion,
      }
    });
  }


  // --- ADMIN FLOW ---

  async findAllAdmin(filters: GetAdminReportsDto): Promise<ReportAdminDTO[]> {
    const { status, colonyId, type, startDate, endDate } = filters;

    const gte = startDate ? new Date(startDate) : undefined;
    const lte = endDate ? new Date(endDate) : undefined;

    if (gte && isNaN(gte.getTime())) throw new BadRequestException('startDate no es una fecha válida');
    if (lte && isNaN(lte.getTime())) throw new BadRequestException('endDate no es una fecha válida');

    const reports = await this.prisma.report.findMany({
      where: {
        ...(status   && { status }),
        ...(colonyId && { colonyId }),
        ...(type     && { type }),
        ...((gte || lte) && { createdAt: { gte, lte } }),
      },
      include: {
        colony: { include: { sector: true } },
        deviceProfile: {
          include: {
            reports: true  // Necesario para contar reports del dispositivo
          }
        },
          statusHistory: {
            include: {
              changedBy: true
            } as any,
            orderBy: { changedAt: 'asc' }
          }
      },
      orderBy: { createdAt: 'desc' }
    });

    return reports.map(r => this.toAdminDTO(r));
  }

  async findAllAdminList(filters: GetAdminReportsDto): Promise<ReportAdminListDTO[]> {
    const { status, colonyId, type, startDate, endDate } = filters;

    const gte = startDate ? new Date(startDate) : undefined;
    const lte = endDate ? new Date(endDate) : undefined;

    if (gte && isNaN(gte.getTime())) throw new BadRequestException('startDate no es una fecha válida');
    if (lte && isNaN(lte.getTime())) throw new BadRequestException('endDate no es una fecha válida');

    const reports = await this.prisma.report.findMany({
      where: {
        ...(status   && { status }),
        ...(colonyId && { colonyId }),
        ...(type     && { type }),
        ...((gte || lte) && { createdAt: { gte, lte } }),
      },
      include: {
        colony: { include: { sector: true } },
        deviceProfile: {
          include: {
            reports: true
          }
        },
        statusHistory: {
          orderBy: { changedAt: 'desc' },
          take: 1  // Only get the latest status change
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return reports.map(r => new ReportAdminListDTO(r));
  }

  async updateStatus(id: string, dto: UpdateReportStatusDto, adminId: string) {
    const report = await this.prisma.report.findUnique({
      where: { id }
    });

    if (!report) throw new NotFoundException('Reporte no encontrado');

    // TRANSITION VALIDATION: Check if transition is allowed in DB
    const transitionAllowed = await this.prisma.statusTransition.findUnique({
      where: {
        fromStatus_toStatus: {
          fromStatus: report.status,
          toStatus: dto.status
        }
      }
    });

    if (!transitionAllowed) {
      throw new BadRequestException(
        `Transición de ${report.status} a ${dto.status} no permitida. ` +
        `Contacta al administrador si crees que es un error.`
      );
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

  async updateStatusAndReturnDetail(id: string, dto: ReportAdminUpdateDTO, adminId: string): Promise<ReportAdminDetailDTO> {
    const report = await this.prisma.report.findUnique({
      where: { id }
    });

    if (!report) throw new NotFoundException('Reporte no encontrado');

    // TRANSITION VALIDATION: Check if transition is allowed in DB
    const transitionAllowed = await this.prisma.statusTransition.findUnique({
      where: {
        fromStatus_toStatus: {
          fromStatus: report.status,
          toStatus: dto.status
        }
      }
    });

    if (!transitionAllowed) {
      throw new BadRequestException(
        `Transición de ${report.status} a ${dto.status} no permitida. ` +
        `Contacta al administrador si crees que es un error.`
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.report.update({
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
    });

    // Fetch the updated report with all details
    const fullReport = await this.prisma.report.findUnique({
      where: { id },
      include: {
        colony: { include: { sector: true } },
        deviceProfile: {
          include: {
            reports: true
          }
        },
        statusHistory: {
          include: { changedBy: true } as any,
          orderBy: { changedAt: 'asc' }
        }
      }
    });

    return new ReportAdminDetailDTO(fullReport!);
  }

  async getAnalyticsSummary(filters: AdminAnalyticsDto) {
    const { startDate, endDate } = filters;
    const where = {
      ...(startDate && endDate ? { createdAt: { gte: new Date(startDate), lte: new Date(endDate) } } : {})
    };

    const summary = await this.prisma.report.groupBy({
      by: ['status'],
      where,
      _count: { _all: true }
    });

    const topColonies = await this.prisma.report.groupBy({
      by: ['colonyId'],
      where,
      _count: { _all: true },
      orderBy: { _count: { colonyId: 'desc' } },
      take: 10
    });

    // Hydrate colony names
    const hydratedColonies = await Promise.all(
      topColonies.map(async (c) => {
        const colony = await this.prisma.colony.findUnique({ where: { id: c.colonyId } });
        return { name: colony?.name || 'Unknown', count: c._count._all };
      })
    );

    const typeDistribution = await this.prisma.report.groupBy({
      by: ['type'],
      where,
      _count: { _all: true }
    });

    return { 
      summary: summary.map(s => ({ status: s.status, count: s._count._all })), 
      topColonies: hydratedColonies,
      typeDistribution: typeDistribution.map(t => ({ type: t.type, count: t._count._all }))
    };
  }

  async exportToCsv(filters: AdminAnalyticsDto): Promise<string> {
    const { startDate, endDate } = filters;
    const reports = await this.prisma.report.findMany({
      where: {
        ...(startDate && endDate ? { createdAt: { gte: new Date(startDate), lte: new Date(endDate) } } : {})
      },
      include: { colony: true },
      orderBy: { createdAt: 'desc' }
    });

    const header = 'ID,PublicID,Status,Type,Colony,Description,Date,ReporterName,ReporterPhone\n';
    const rows = reports.map(r => {
      const escapedDesc = (r.description || '').replace(/"/g, '""');
      return `${r.id},${r.publicId},${r.status},${r.type},"${r.colony?.name}", "${escapedDesc}",${r.createdAt.toISOString()},"${r.reporterName || ''}","${r.reporterPhone || ''}"`;
    }).join('\n');

    return header + rows;
  }

  // --- DTO MAPPING HELPERS (Interface Segregation) ---

  /**
   * Mapea Report a ReportPublicDTO
   * Solo incluye información visible para ciudadanos
   */
  toPublicDTO(report: any): ReportPublicDTO {
    return {
      publicId: report.publicId,
      status: report.status,
      description: report.description,
      type: report.type,
      publicNote: report.statusHistory?.[0]?.publicNote || undefined,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      colonyName: report.colony?.name || '',
      statusHistory: report.statusHistory?.map((sh: any) => ({
        status: sh.status,
        publicNote: sh.publicNote,
        changedAt: sh.changedAt
      })) || []
    };
  }

  /**
   * Mapea Report a ReportAdminDTO
   * Incluye todos los campos para administradores
   * El campo deviceProfile contiene información técnica del dispositivo (IAdminDevice)
   */
  toAdminDTO(report: any): ReportAdminDTO {
    return {
      id: report.id,
      publicId: report.publicId,
      deviceProfileId: report.deviceProfileId,
      reporterName: report.reporterName,
      reporterPhone: report.reporterPhone,
      deviceProfile: report.deviceProfile ? {
        deviceUuid: report.deviceProfile.deviceUuid,
        ipAddress: report.ipAddress,
        platform: report.deviceProfile.platform,
        appVersion: report.deviceProfile.appVersion,
        reportCount: report.deviceProfile.reports?.length || 0,
        lastSeenAt: report.deviceProfile.lastSeenAt
      } as IAdminDevice : undefined,
      status: report.status,
      type: report.type,
      description: report.description,
      colonyId: report.colonyId,
      colonyName: report.colony?.name || '',
      sectorName: report.colony?.sector?.name || '',
      ipAddress: report.ipAddress,
      deviceFingerprint: report.deviceFingerprint,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      statusHistory: report.statusHistory?.map((sh: any) => ({
        id: sh.id,
        status: sh.status,
        publicNote: sh.publicNote,
        internalNote: sh.internalNote,
        changedById: sh.changedById,
        changedBy: sh.changedBy ? {
          id: sh.changedBy.id,
          email: sh.changedBy.email,
          fullname: sh.changedBy.fullname
        } : undefined,
        changedAt: sh.changedAt
      })) || []
    };
  }
}

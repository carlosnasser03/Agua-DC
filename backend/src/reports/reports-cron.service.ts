import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { GlobalConfigService } from '../global-config/global-config.service';

@Injectable()
export class ReportsCronService {
  private readonly logger = new Logger(ReportsCronService.name);

  constructor(
    private prisma: PrismaService,
    private globalConfig: GlobalConfigService,
  ) {}

  /**
   * Every 5 minutes: auto-advance ENVIADO → EN_REVISION
   * Threshold: `auto_review_minutes` (default 5)
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async autoReview() {
    const minutes = this.globalConfig.getNumber('auto_review_minutes', 5);
    const threshold = new Date(Date.now() - minutes * 60 * 1000);

    const reports = await this.prisma.report.findMany({
      where: { status: 'ENVIADO', createdAt: { lte: threshold } },
      select: { id: true },
    });

    if (reports.length === 0) return;

    for (const report of reports) {
      await this.prisma.$transaction([
        this.prisma.report.update({
          where: { id: report.id },
          data: { status: 'EN_REVISION' },
        }),
        this.prisma.reportStatusHistory.create({
          data: {
            reportId: report.id,
            status: 'EN_REVISION',
            publicNote: 'Tu reporte está siendo revisado por nuestro equipo.',
          },
        }),
      ]);
    }

    this.logger.log(`[AutoReview] ${reports.length} reporte(s) → EN_REVISION (threshold: ${minutes}min)`);
  }

  /**
   * Every hour: auto-resolve EN_REVISION → RESUELTO
   * Threshold: `auto_resolve_hours` (default 12)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async autoResolve() {
    const hours = this.globalConfig.getNumber('auto_resolve_hours', 12);
    const threshold = new Date(Date.now() - hours * 60 * 60 * 1000);

    const reports = await this.prisma.report.findMany({
      where: { status: 'EN_REVISION', updatedAt: { lte: threshold } },
      select: { id: true },
    });

    if (reports.length === 0) return;

    for (const report of reports) {
      await this.prisma.$transaction([
        this.prisma.report.update({
          where: { id: report.id },
          data: { status: 'RESUELTO' },
        }),
        this.prisma.reportStatusHistory.create({
          data: {
            reportId: report.id,
            status: 'RESUELTO',
            publicNote: 'El equipo técnico revisó y atendió tu reporte. ¡Gracias!',
          },
        }),
      ]);
    }

    this.logger.log(`[AutoResolve] ${reports.length} reporte(s) → RESUELTO (threshold: ${hours}h)`);
  }

  /**
   * Every day at 03:00 AM: purge RECHAZADO/RESUELTO reports
   * Threshold: `purge_hours_threshold` (default 24)
   */
  @Cron('0 3 * * *')
  async purgeOldReports() {
    const hours = this.globalConfig.getNumber('purge_hours_threshold', 24);
    const threshold = new Date(Date.now() - hours * 60 * 60 * 1000);

    const result = await this.prisma.report.deleteMany({
      where: {
        status: { in: ['RECHAZADO', 'RESUELTO'] },
        updatedAt: { lte: threshold },
      },
    });

    if (result.count > 0) {
      this.logger.log(`[Purge] ${result.count} reporte(s) eliminado(s) (threshold: ${hours}h)`);
    }
  }
}

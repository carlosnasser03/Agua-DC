import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  async searchByColony(colonyQuery: string, from?: string, to?: string) {
    if (!colonyQuery || colonyQuery.trim().length < 2) return [];

    // Busca en el período activo por defecto
    const activePeriod = await this.prisma.period.findFirst({
      where: { isActive: true }
    });

    const dateFilter: any = {};
    if (from) dateFilter.gte = new Date(from);
    if (to)   dateFilter.lte = new Date(to);
    // Si no hay fechas, muestra los próximos 30 días
    if (!from && !to && activePeriod) {
      dateFilter.gte = activePeriod.startDate;
      dateFilter.lte = activePeriod.endDate;
    }

    return this.prisma.scheduleEntry.findMany({
      where: {
        periodId: activePeriod?.id,
        date: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        colony: {
          OR: [
            { name: { contains: colonyQuery.trim(), mode: 'insensitive' } },
            { aliases: { some: { name: { contains: colonyQuery.trim(), mode: 'insensitive' } } } },
            { sector: { name: { contains: colonyQuery.trim(), mode: 'insensitive' } } },
          ]
        }
      },
      include: {
        colony: { include: { sector: true } }
      },
      orderBy: { date: 'asc' },
      take: 100,
    });
  }

  async getActivePeriod() {
    return this.prisma.period.findFirst({
      where: { isActive: true },
      include: {
        _count: { select: { schedules: true } }
      }
    });
  }
}

import { Injectable, Logger, OnApplicationBootstrap, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ConfigEntry {
  key: string;
  value: string;
  label: string;
  description?: string;
  type: 'number' | 'string' | 'boolean';
}

const DEFAULTS: ConfigEntry[] = [
  {
    key: 'reports_per_day',
    value: '3',
    label: 'Límite de reportes por día',
    description: 'Máximo de reportes que un dispositivo puede enviar en 24 horas.',
    type: 'number',
  },
  {
    key: 'auto_review_minutes',
    value: '5',
    label: 'Minutos para auto-revisión',
    description: 'Tiempo (en minutos) antes de que un reporte ENVIADO pase automáticamente a EN_REVISION.',
    type: 'number',
  },
  {
    key: 'auto_resolve_hours',
    value: '12',
    label: 'Horas para auto-resolución',
    description: 'Horas en EN_REVISION sin acción antes de marcarse como RESUELTO automáticamente.',
    type: 'number',
  },
  {
    key: 'purge_hours_threshold',
    value: '24',
    label: 'Horas para purga de reportes',
    description: 'Reportes RESUELTOS o RECHAZADOS más antiguos que este umbral serán eliminados cada noche.',
    type: 'number',
  },
  {
    key: 'session_timeout_minutes',
    value: '60',
    label: 'Tiempo de sesión admin (minutos)',
    description: 'Minutos de inactividad antes de cerrar la sesión del panel administrativo.',
    type: 'number',
  },
];

@Injectable()
export class GlobalConfigService implements OnApplicationBootstrap {
  private readonly logger = new Logger(GlobalConfigService.name);
  private cache = new Map<string, string>();

  constructor(private prisma: PrismaService) {}

  async onApplicationBootstrap() {
    await this.seedDefaults();
    await this.loadCache();
  }

  // ─── Internal ────────────────────────────────────────────────────────────────

  private async seedDefaults() {
    for (const entry of DEFAULTS) {
      await this.prisma.globalConfig.upsert({
        where: { key: entry.key },
        update: {},   // never overwrite admin changes
        create: {
          key: entry.key,
          value: entry.value,
          label: entry.label,
          description: entry.description,
          type: entry.type,
        },
      });
    }
    this.logger.log('GlobalConfig defaults ensured.');
  }

  private async loadCache() {
    const rows = await this.prisma.globalConfig.findMany();
    rows.forEach(r => this.cache.set(r.key, r.value));
    this.logger.log(`GlobalConfig cache loaded (${rows.length} keys).`);
  }

  // ─── Public read helpers ──────────────────────────────────────────────────────

  getString(key: string, fallback = ''): string {
    return this.cache.get(key) ?? fallback;
  }

  getNumber(key: string, fallback = 0): number {
    const raw = this.cache.get(key);
    const n = raw !== undefined ? Number(raw) : NaN;
    return isNaN(n) ? fallback : n;
  }

  getBoolean(key: string, fallback = false): boolean {
    const raw = this.cache.get(key);
    if (raw === undefined) return fallback;
    return raw === 'true' || raw === '1';
  }

  // ─── Admin CRUD ───────────────────────────────────────────────────────────────

  async getAll() {
    return this.prisma.globalConfig.findMany({ orderBy: { key: 'asc' } });
  }

  async update(key: string, value: string) {
    const entry = await this.prisma.globalConfig.findUnique({ where: { key } });
    if (!entry) throw new NotFoundException(`Config key '${key}' no existe`);

    // Type validation
    if (entry.type === 'number') {
      const n = Number(value);
      if (isNaN(n) || n < 0) throw new BadRequestException('El valor debe ser un número positivo');
    }
    if (entry.type === 'boolean' && !['true', 'false', '1', '0'].includes(value)) {
      throw new BadRequestException('El valor debe ser true o false');
    }

    const updated = await this.prisma.globalConfig.update({
      where: { key },
      data: { value },
    });

    // Refresh cache immediately
    this.cache.set(key, value);
    this.logger.log(`Config updated: ${key} = ${value}`);

    return updated;
  }
}

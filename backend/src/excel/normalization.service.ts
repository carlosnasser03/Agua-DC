import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import * as fuzzy from 'fuzzy';

@Injectable()
export class NormalizationService implements OnModuleInit {
  private readonly logger = new Logger(NormalizationService.name);
  private coloniesMaster: any[] = [];

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.refreshMasterData();
  }

  /**
   * Loads data from DB or JSON file as backup
   */
  async refreshMasterData() {
    try {
      // 1. Try to load from Database (Primary source now that we seeded)
      const dbColonies = await this.prisma.colony.findMany({
        include: { aliases: true }
      });

      if (dbColonies.length > 0) {
        this.coloniesMaster = dbColonies.map(c => ({
          id: c.id,
          nombre: c.name,
          aliases: c.aliases.map(a => a.name)
        }));
        this.logger.log(`Cargadas ${this.coloniesMaster.length} colonias desde la Base de Datos.`);
        return;
      }

      // 2. Fallback to JSON file if DB is empty
      const candidates = [
        process.env.COLONIES_MASTER_PATH,
        path.join(process.cwd(), 'data', 'colonias_master.json'),
        path.join(process.cwd(), '..', 'data', 'colonias_master.json'),
        path.join(__dirname, '../../data/colonias_master.json'),
        '/app/data/colonias_master.json',
      ].filter(Boolean) as string[];

      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          const rawData = fs.readFileSync(candidate, 'utf8');
          this.coloniesMaster = JSON.parse(rawData);
          this.logger.log(`colonias_master.json cargado desde: ${candidate} (${this.coloniesMaster.length} colonias)`);
          return;
        }
      }

      this.logger.warn('No se encontraron colonias ni en DB ni en JSON. El matching no funcionará.');
    } catch (error) {
      this.logger.error('Error cargando datos de colonias', error);
    }
  }

  normalizeColony(input: string): { original: string; matchedId: string | null; score: number } {
    if (!input) return { original: input, matchedId: null, score: 0 };

    const searchStr = input.toLowerCase().trim();

    // Direct match (Exact match)
    const exactMatch = this.coloniesMaster.find(c =>
      c.nombre.toLowerCase() === searchStr ||
      (c.aliases && c.aliases.some((a: string) => a.toLowerCase() === searchStr))
    );

    if (exactMatch) {
      return { original: input, matchedId: exactMatch.id, score: 1 };
    }

    // Fuzzy match
    const allNames = this.coloniesMaster.flatMap(c => [c.nombre, ...(c.aliases || [])]);
    const results = fuzzy.filter(searchStr, allNames);
    const bestMatch = results[0];

    // Increased threshold for better accuracy
    if (bestMatch && bestMatch.score > 20) {
      const parentColony = this.coloniesMaster.find(c =>
        c.nombre === bestMatch.original || (c.aliases && c.aliases.includes(bestMatch.original))
      );
      return { original: input, matchedId: parentColony?.id || null, score: bestMatch.score / 100 };
    }

    return { original: input, matchedId: null, score: 0 };
  }

  normalizeTime(input: string): string | null {
    if (!input) return null;
    return input.toUpperCase().replace(/\s/g, '').trim();
  }
}

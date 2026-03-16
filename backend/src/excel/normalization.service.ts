import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as fuzzy from 'fuzzy';

@Injectable()
export class NormalizationService {
  private readonly logger = new Logger(NormalizationService.name);
  private coloniesMaster: any[] = [];

  constructor() {
    this.loadMasterData();
  }

  private loadMasterData() {
    try {
      const candidates = [
        process.env.COLONIES_MASTER_PATH,
        path.join(process.cwd(), 'data', 'colonias_master.json'),
        path.join(process.cwd(), '..', 'data', 'colonias_master.json'),
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

      this.logger.warn('colonias_master.json no encontrado. El matching de colonias no funcionará.');
    } catch (error) {
      this.logger.error('Error cargando datos maestros de colonias', error);
    }
  }

  normalizeColony(input: string): { original: string; matchedId: string | null; score: number } {
    if (!input) return { original: input, matchedId: null, score: 0 };

    const searchStr = input.toLowerCase().trim();

    const exactMatch = this.coloniesMaster.find(c =>
      c.nombre.toLowerCase() === searchStr ||
      c.aliases.some((a: string) => a.toLowerCase() === searchStr)
    );

    if (exactMatch) {
      return { original: input, matchedId: exactMatch.id, score: 1 };
    }

    const allNames = this.coloniesMaster.flatMap(c => [c.nombre, ...c.aliases]);
    const results = fuzzy.filter(searchStr, allNames);
    const bestMatch = results[0];

    if (bestMatch && bestMatch.score > 20) {
      const parentColony = this.coloniesMaster.find(c =>
        c.nombre === bestMatch.original || c.aliases.includes(bestMatch.original)
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

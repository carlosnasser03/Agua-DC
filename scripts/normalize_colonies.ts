import * as fs from 'fs';
import * as path from 'path';

interface Colony {
  id: number;
  nombre: string;
  sector: string;
  aliases: string[];
}

const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\./g, '') // Remove dots
    .replace(/\bcol\b/g, 'colonia')
    .replace(/\bres\b/g, 'residencial')
    .replace(/\bhond\b/g, 'honduras')
    .trim();
};

const main = () => {
  const inputPath = path.join(__dirname, '../data/colonias_master.json');
  const outputPath = path.join(__dirname, '../data/colonias_normalized.json');

  if (!fs.existsSync(inputPath)) {
    console.error('Input file not found:', inputPath);
    return;
  }

  const rawData = fs.readFileSync(inputPath, 'utf8');
  const colonies: Colony[] = JSON.parse(rawData);

  const normalizedColonies = colonies.map((c) => ({
    ...c,
    nombre_normalizado: normalizeString(c.nombre),
    aliases_normalizados: c.aliases.map(normalizeString),
  }));

  fs.writeFileSync(outputPath, JSON.stringify(normalizedColonies, null, 2));
  console.log('Normalization complete. Output saved to:', outputPath);
};

main();

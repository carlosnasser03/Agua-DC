import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const masterPath = path.join(__dirname, '../../data/colonias_master.json');
  if (!fs.existsSync(masterPath)) {
    throw new Error(`colonias_master.json no encontrado en: ${masterPath}`);
  }

  const raw = fs.readFileSync(masterPath, 'utf-8');
  const colonies: { id: string; nombre: string; sector: string; aliases: string[] }[] = JSON.parse(raw);

  console.log(`Importando ${colonies.length} colonias...`);

  // 1. Collect unique sectors
  const sectorNames = [...new Set(colonies.map(c => c.sector))];
  const sectorMap: Record<string, string> = {};

  for (const name of sectorNames) {
    const s = await prisma.sector.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    sectorMap[name] = s.id;
  }
  console.log(`${sectorNames.length} sectores creados/actualizados.`);

  // 2. Create colonies with their JSON id
  let created = 0;
  let skipped = 0;

  for (const col of colonies) {
    const existing = await prisma.colony.findUnique({ where: { id: col.id } });
    if (existing) { skipped++; continue; }

    await prisma.colony.create({
      data: {
        id: col.id,
        name: col.nombre,
        sectorId: sectorMap[col.sector],
        aliases: col.aliases.length > 0
          ? {
              create: col.aliases.map(a => ({ name: a })),
            }
          : undefined,
      },
    });
    created++;
  }

  console.log(`Colonias creadas: ${created} | ya existentes: ${skipped}`);
  console.log('Importación completada.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

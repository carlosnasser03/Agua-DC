const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function extractMaster() {
  const filePath = path.join(__dirname, '../data/HORARIOS AGUA POTABLE-1-15 MARZO2026(1).xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  
  const worksheet = workbook.getWorksheet(1);
  const colonies = [];
  const seenNames = new Set();
  let idCounter = 1;

  console.log('--- EXTRAYENDO Y LIMPIANDO COLONIAS ---');

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber < 11) return;

    const sectorRaw = row.getCell(3).value;
    const nameLineRaw = row.getCell(4).value;

    const sector = getText(sectorRaw)?.trim().replace(/\s+/g, ' ');
    const nameLine = getText(nameLineRaw)?.trim();

    if (!nameLine || nameLine.length < 3) return;
    if (nameLine.includes('indica que habrá') || nameLine.includes('DESPERDICIO')) return;

    // Split and clean names
    const rawNames = nameLine.split(/[,;\/]/);
    
    rawNames.forEach(rawName => {
      const cleanName = rawName.trim().replace(/\s+/g, ' ');
      if (cleanName.length < 3) return;

      const normalized = cleanName.toUpperCase();
      if (seenNames.has(normalized)) return;

      colonies.push({
        id: `C${String(idCounter++).padStart(4, '0')}`,
        nombre: cleanName,
        sector: sector || 'N/A',
        aliases: []
      });
      seenNames.add(normalized);
    });
  });

  const outputPath = path.join(__dirname, '../data/colonias_master.json');
  fs.writeFileSync(outputPath, JSON.stringify(colonies, null, 2));
  console.log(`Extracción completada. ${colonies.length} registros únicos.`);
}

function getText(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (val.richText) return val.richText.map(rt => rt.text).join('');
  if (val.result) return val.result.toString();
  return val.toString();
}

extractMaster().catch(console.error);

const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const fuzzy = require('fuzzy');

// Load real master data
const coloniesMaster = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/colonias_master.json'), 'utf8'));

function getText(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (val.richText) return val.richText.map(rt => rt.text).join('');
  if (val.result) return val.result.toString();
  return val.toString();
}

function normalizeColony(input) {
  if (!input) return { original: input, matchedId: null, score: 0 };
  const searchStr = input.toLowerCase().trim().replace(/\s+/g, ' ');
  
  const exactMatch = coloniesMaster.find(c => 
    c.nombre.toLowerCase() === searchStr || 
    c.aliases.some(a => a.toLowerCase() === searchStr)
  );
  if (exactMatch) return { original: input, matchedId: exactMatch.id, score: 1 };
  
  const allNames = coloniesMaster.flatMap(c => [c.nombre, ...c.aliases]);
  const results = fuzzy.filter(searchStr, allNames);
  const bestMatch = results[0];
  if (bestMatch && bestMatch.score > 20) {
    const parentColony = coloniesMaster.find(c => 
      c.nombre === bestMatch.original || c.aliases.includes(bestMatch.original)
    );
    return { original: input, matchedId: parentColony ? parentColony.id : null, score: bestMatch.score / 100 };
  }
  return { original: input, matchedId: null, score: 0 };
}

async function testRealParsing() {
  const filePath = path.join(__dirname, '../data/HORARIOS AGUA POTABLE-1-15 MARZO2026(1).xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  
  const worksheet = workbook.getWorksheet(1);
  console.log('--- TEST: MOTOR DINÁMICO DE DÍAS Y MARCAS "X" (ESTRUCTURA REAL) ---');
  
  // 1. Detect Period (Row 3)
  const periodRowText = getText(worksheet.getRow(3).getCell(1).value);
  console.log('Fila 3 Text:', periodRowText);

  let startDate = new Date(2026, 2, 1);
  let endDate = new Date(2026, 2, 15);

  // 2. Map Columns (Row 7)
  const dateMapping = [];
  const headerRow = worksheet.getRow(7);
  headerRow.eachCell((cell, colNumber) => {
    const val = parseInt(cell.value?.toString() || '');
    if (!isNaN(val) && val >= 1 && val <= 31) {
      const date = new Date(startDate);
      date.setDate(val);
      dateMapping.push({ colIndex: colNumber, date });
    }
  });

  console.log(`Columnas de días detectadas en Fila 7: ${dateMapping.length}`);

  // 3. Sample check (Row 9-15)
  console.log('\n--- MUESTRA DE DATOS PROCESADOS ---');
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber < 9 || rowNumber > 15) return;

    const namesLine = getText(row.getCell(4).value);
    const timeStr = getText(row.getCell(5).value);
    
    const names = namesLine.split(/[,;]/).map(n => n.trim().replace(/\s+/g, ' ')).filter(n => n.length > 2);

    names.forEach(name => {
      const activeDays = [];
      dateMapping.forEach(m => {
        const cellVal = getText(row.getCell(m.colIndex).value).toUpperCase();
        if (cellVal === 'X') activeDays.push(m.date.getDate());
      });

      console.log(`[Fila ${rowNumber}] ${name.padEnd(25)} | Horario: ${timeStr.padEnd(10)} | Días X: [${activeDays.join(', ')}]`);
    });
  });
}

testRealParsing().catch(console.error);

const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function generateFullMonthExcel() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Table 1');

  // Row 3: Period Header
  worksheet.getCell('A3').value = 'Periodo: Domingo 1 al Martes 31 de Marzo de 2026';

  // Row 7: Dynamic Day Numbers (1 to 31)
  const headerRow = worksheet.getRow(7);
  for (let i = 1; i <= 31; i++) {
    // Starting from column 6 as observed in real file
    headerRow.getCell(i + 5).value = i;
  }

  // Row 9: Data Example
  const dataRow = worksheet.getRow(9);
  dataRow.getCell(3).value = 'PICACHO';
  dataRow.getCell(4).value = 'KENNEDY';
  dataRow.getCell(5).value = '6AM-5PM';
  
  // Set water marks for various days, including late ones (day 25, 30)
  dataRow.getCell(6).value = 'X'; // Day 1
  dataRow.getCell(15).value = 'X'; // Day 10
  dataRow.getCell(30).value = 'X'; // Day 25
  dataRow.getCell(36).value = 'X'; // Day 31

  const outputPath = path.join(__dirname, '../data/test_full_month.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log('--- TEST GENERATION ---');
  console.log('Archivo de mes completo generado:', outputPath);
}

async function testFullMonthParsing() {
  const filePath = path.join(__dirname, '../data/test_full_month.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  
  const worksheet = workbook.getWorksheet(1);
  console.log('\n--- VALIDANDO MOTOR DINÁMICO (31 DÍAS) ---');
  
  // Detection Logic Simulation (Mirroring ExcelService)
  let startDate, endDate;
  const val = worksheet.getRow(3).getCell(1).value.toString();
  const dayMatches = val.match(/\d+/g);
  startDate = new Date(2026, 2, parseInt(dayMatches[0]));
  endDate = new Date(2026, 2, parseInt(dayMatches[1]));
  
  console.log(`Período detectado: ${startDate.toLocaleDateString()} al ${endDate.toLocaleDateString()}`);

  const dateMapping = [];
  const headerRow = worksheet.getRow(7);
  for (let col = 1; col <= 60; col++) {
    const v = parseInt(headerRow.getCell(col).value);
    if (!isNaN(v) && v >= 1 && v <= 31) {
      const d = new Date(2026, 2, v);
      dateMapping.push({ colIndex: col, date: d });
    }
  }

  console.log(`Días detectados: ${dateMapping.length}`);

  const dataRow = worksheet.getRow(9);
  const activeDays = [];
  dateMapping.forEach(m => {
    if (dataRow.getCell(m.colIndex).value === 'X') {
      activeDays.push(m.date.getDate());
    }
  });

  console.log(`Días con agua detectados para KENNEDY: [${activeDays.join(', ')}]`);
  
  if (dateMapping.length === 31 && activeDays.includes(31)) {
    console.log('✅ ÉXITO: El motor detectó correctamente los 31 días y sus marcas.');
  } else {
    console.log('❌ FALLO: No se detectó el rango completo de 31 días.');
  }
}

generateFullMonthExcel().then(() => testFullMonthParsing()).catch(console.error);

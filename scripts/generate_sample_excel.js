const ExcelJS = require('exceljs');
const path = require('path');

async function generateSample() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Horarios');

  // Add Period Header
  worksheet.mergeCells('A1:E1');
  worksheet.getCell('A1').value = 'CALENDARIO DE ABASTECIMIENTO DEL 01 AL 15 DE MARZO DE 2026';
  worksheet.getCell('A1').font = { bold: true, size: 14 };
  worksheet.getCell('A1').alignment = { horizontal: 'center' };

  // Add Table Headers
  const headers = ['SECTOR', 'COLONIA', 'HORARIO', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];
  worksheet.addRow(headers);
  worksheet.getRow(2).font = { bold: true };
  worksheet.getRow(2).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Add Sample Data
  const data = [
    ['S1', 'Kennedy', '6AM-5PM', 'X', '', 'X', '', 'X', '', 'X', '', 'X', '', 'X', '', 'X', '', 'X'],
    ['S1', 'Hato de Enmedio', '12MD-6PM', '', 'X', '', 'X', '', 'X', '', 'X', '', 'X', '', 'X', '', 'X', ''],
    ['S2', 'Col. Cerro Grande', '2PM-6AM', 'X', 'X', '', '', 'X', 'X', '', '', 'X', 'X', '', '', 'X', 'X', ''],
    ['S3', 'Res. Honduras', '12MN-5AM', '', '', 'X', 'X', '', '', 'X', 'X', '', '', 'X', 'X', '', '', 'X'],
    ['S1', 'Kennedy - Sec. 1', '6AM-5PM', 'X', '', 'X', '', 'X', '', 'X', '', 'X', '', 'X', '', 'X', '', 'X'],
  ];

  data.forEach(row => worksheet.addRow(row));

  // Style the columns
  worksheet.getColumn(2).width = 30;
  worksheet.getColumn(3).width = 15;

  const filePath = path.join(__dirname, '../data/sample_horarios_marzo.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log('Sample Excel created at:', filePath);
}

generateSample().catch(console.error);

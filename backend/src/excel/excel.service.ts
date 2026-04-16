import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NormalizationService } from './normalization.service';
import { ExcelValidationService } from './excel-validation.service';
import * as ExcelJS from 'exceljs';

interface SubProcessResult {
  row: number;
  original: { sector: string; colonyName: string; timeStr: string };
  normalized: {
    colonyId: string | null;
    time: string | null;
    activeDates: Date[];
  };
  isValid: boolean;
}

@Injectable()
export class ExcelService {
  constructor(
    private prisma: PrismaService,
    private normalizationService: NormalizationService,
    private excelValidationService: ExcelValidationService,
  ) {}

  async processUpload(fileBuffer: Buffer, originalFilename: string, uploaderId: string) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer as any);
    
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) throw new BadRequestException('Archivo Excel sin hojas válidas');

    let startDate: Date | null = null;
    let endDate: Date | null = null;
    let monthIndex = 0; 
    let year = new Date().getFullYear();

    // 1. Dynamic Period Detection (Row 3)
    const periodRow = worksheet.getRow(3);
    let periodFound = false;
    periodRow.eachCell((cell) => {
      if (periodFound) return;
      const val = this.getText(cell.value);
      if (val.toLowerCase().includes('periodo:')) {
        const monthMap: { [key: string]: number } = {
          'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
          'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
        };

        for (const month in monthMap) {
          if (val.toLowerCase().includes(month)) {
            monthIndex = monthMap[month];
            break;
          }
        }

        const yearMatch = val.match(/\d{4}/);
        if (yearMatch) year = parseInt(yearMatch[0]);

        const dayMatches = val.match(/\d+/g);
        if (dayMatches && dayMatches.length >= 2) {
          startDate = new Date(year, monthIndex, parseInt(dayMatches[0]));
          endDate = new Date(year, monthIndex, parseInt(dayMatches[1]));
          periodFound = true;
        }
      }
    });

    if (!startDate || !endDate) {
      throw new BadRequestException('No se pudo detectar el período en la Fila 3 del archivo.');
    }

    // 2. Dynamic Column Mapping (Row 7 - Scanning for ALL numeric days)
    const dateMapping: { colIndex: number; date: Date }[] = [];
    const headerRow = worksheet.getRow(7); 
    
    // We scan columns 1 to 50 to find all numeric days
    for (let col = 1; col <= 50; col++) {
      const cell = headerRow.getCell(col);
      const val = parseInt(this.getText(cell.value));
      if (!isNaN(val) && val >= 1 && val <= 31) {
        // Create the specific date for this column
        const date = new Date(year, monthIndex, val);
        dateMapping.push({ colIndex: col, date });
      }
    }

    if (dateMapping.length === 0) {
      throw new BadRequestException('No se detectaron columnas de días en la Fila 7.');
    }

    // Update endDate if the last column has a higher day than the header
    const lastDay = dateMapping[dateMapping.length - 1].date.getDate();
    if (lastDay > (endDate as any).getDate()) {
       endDate = new Date(year, monthIndex, lastDay);
    }

    // 3. Process Rows (Starting from Row 9)
    const results: SubProcessResult[] = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber < 9) return;

      const sector = this.getText(row.getCell(3).value).trim();
      const nameLine = this.getText(row.getCell(4).value).trim();
      const timeStr = this.getText(row.getCell(5).value).trim();

      if (!nameLine || nameLine.includes('indica que') || nameLine.includes('DESPERDICIO') || nameLine.length < 3) return;

      const rawNames = nameLine.split(/[,;]/).map(n => n.trim().replace(/\s+/g, ' ')).filter(n => n.length > 2);

      rawNames.forEach(name => {
        const normalizedColony = this.normalizationService.normalizeColony(name);
        const normalizedTime = this.normalizationService.normalizeTime(timeStr);

        const activeDates: Date[] = [];
        dateMapping.forEach(mapping => {
          const cellValue = this.getText(row.getCell(mapping.colIndex).value).toUpperCase();
          if (cellValue === 'X') {
            activeDates.push(mapping.date);
          }
        });

        results.push({
          row: rowNumber,
          original: { sector, colonyName: name, timeStr },
          normalized: {
            colonyId: normalizedColony.matchedId,
            time: normalizedTime,
            activeDates
          },
          isValid: !!normalizedColony.matchedId
        });
      });
    });

    // Run validation rules from database
    const validationResult = await this.excelValidationService.validateWithRules(
      results,
      { startDate, endDate }
    );

    const upload = await this.prisma.upload.create({
      data: {
        filename: originalFilename || 'HORARIOS_PROCESADOS.xlsx',
        filesize: fileBuffer.length,
        uploadedById: uploaderId,
        status: validationResult.isValid ? 'VALIDATED' : 'ERRORED',
        metadata: {
          period: { startDate, endDate },
          summary: {
            totalRows: results.length,
            validRows: results.filter(r => r.isValid).length,
            errors: validationResult.errors.length,
            daysProcessed: dateMapping.length
          },
          results: results,
          validationErrors: validationResult.errors,
          validationWarnings: validationResult.warnings
        } as any
      }
    });

    return upload;
  }

  private getText(val: any): string {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (val.richText) return val.richText.map((rt: any) => rt.text).join('');
    if (val.result) return val.result.toString();
    return val.toString();
  }

  async publish(uploadId: string, publisherId: string) {
    const upload = await this.prisma.upload.findUnique({
      where: { id: uploadId }
    });

    if (!upload || upload.status !== 'VALIDATED') {
      throw new BadRequestException('La carga debe estar validada antes de publicarse');
    }

    const metadata = upload.metadata as any;
    const { startDate, endDate } = metadata.period;

    return this.prisma.$transaction(async (tx) => {
      // Logic for Traceability: 
      // We check if a period covers these dates completely. 
      // Instead of killing others, we just ensure "Latest published" is active for current view.
      
      await tx.period.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });

      const period = await tx.period.create({
        data: {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          isActive: true
        }
      });

      const entries: any[] = [];
      for (const result of metadata.results) {
        if (!result.isValid) continue;

        for (const dateStr of result.normalized.activeDates) {
          entries.push({
            colonyId: result.normalized.colonyId,
            periodId: period.id,
            date: new Date(dateStr),
            startTime: (result.normalized.time || '').split('-')[0] || null,
            endTime: (result.normalized.time || '').split('-')[1] || null
          });
        }
      }

      // Batch create for performance
      if (entries.length > 0) {
        await tx.scheduleEntry.createMany({
          data: entries
        });
      }

      await tx.upload.update({
        where: { id: uploadId },
        data: { status: 'PUBLISHED' }
      });

      await tx.publicationLog.create({
        data: {
          periodId: period.id,
          publishedBy: publisherId
        }
      });

      return {
        periodId: period.id,
        entriesCreated: entries.length,
        daysProcessed: metadata.summary.daysProcessed,
        warnings: metadata.validationWarnings
      };
    });
  }
}

import { Module } from '@nestjs/common';
import { ExcelService } from './excel.service';
import { ExcelController } from './excel.controller';
import { NormalizationService } from './normalization.service';
import { ExcelValidationService } from './excel-validation.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ExcelService, NormalizationService, ExcelValidationService],
  controllers: [ExcelController],
})
export class ExcelModule {}

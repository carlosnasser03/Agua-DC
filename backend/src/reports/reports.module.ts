import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ReportsCronService } from './reports-cron.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GlobalConfigModule } from '../global-config/global-config.module';

@Module({
  imports: [PrismaModule, GlobalConfigModule],
  providers: [ReportsService, ReportsCronService],
  controllers: [ReportsController],
  exports: [ReportsService]
})
export class ReportsModule {}

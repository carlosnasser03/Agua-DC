import { Injectable } from '@nestjs/common';
import { GlobalConfigService } from '../global-config.service';
import { IReportConfig } from '../interfaces/IReportConfig';

/**
 * ReportConfigProvider
 *
 * Implements IReportConfig by delegating to GlobalConfigService.
 * Maps generic config keys to report-specific methods.
 *
 * Injected into: ReportService, automation jobs, mobile API controllers
 */
@Injectable()
export class ReportConfigProvider implements IReportConfig {
  constructor(private globalConfigService: GlobalConfigService) {}

  /**
   * Get maximum reports per device per 24 hours.
   * Defaults to 3 if not found.
   */
  getMaxReportsPerDay(): number {
    return this.globalConfigService.getNumber('reports_per_day', 3);
  }

  /**
   * Get report retention period in days.
   * Converts 'purge_hours_threshold' from hours to days.
   * Defaults to 1 day if not found.
   */
  getReportRetentionDays(): number {
    const hours = this.globalConfigService.getNumber('purge_hours_threshold', 24);
    return Math.ceil(hours / 24);
  }

  /**
   * Get default status for newly created reports.
   * Defaults to 'ENVIADO' if not configured.
   */
  getDefaultReportStatus(): string {
    return this.globalConfigService.getString('default_report_status', 'ENVIADO');
  }
}

import { Injectable } from '@nestjs/common';
import { GlobalConfigService } from '../global-config.service';
import { IMobileConfig } from '../interfaces/IMobileConfig';

/**
 * MobileConfigProvider
 *
 * Implements IMobileConfig by delegating to GlobalConfigService.
 * Maps generic config keys to mobile-specific methods.
 *
 * Injected into: Mobile API controllers (reports, public endpoints)
 *
 * NOTE: This provider intentionally exposes only a subset of config keys.
 * Mobile clients never see admin session timeouts or automation settings.
 */
@Injectable()
export class MobileConfigProvider implements IMobileConfig {
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
}

import { Injectable } from '@nestjs/common';
import { GlobalConfigService } from '../global-config.service';
import { IAutomationConfig } from '../interfaces/IAutomationConfig';

/**
 * AutomationConfigProvider
 *
 * Implements IAutomationConfig by delegating to GlobalConfigService.
 * Maps generic config keys to automation-specific methods.
 *
 * Injected into: ReportAutomationService, scheduled jobs, report state machine
 */
@Injectable()
export class AutomationConfigProvider implements IAutomationConfig {
  constructor(private globalConfigService: GlobalConfigService) {}

  /**
   * Get minutes before auto-review of newly sent reports.
   * Defaults to 5 minutes if not found.
   */
  getAutoReviewMinutes(): number {
    return this.globalConfigService.getNumber('auto_review_minutes', 5);
  }

  /**
   * Get hours before auto-resolution of reports in EN_REVISION.
   * Defaults to 12 hours if not found.
   */
  getAutoResolveHours(): number {
    return this.globalConfigService.getNumber('auto_resolve_hours', 12);
  }

  /**
   * Get hours threshold for purging old reports.
   * Reports in RESUELTO or RECHAZADO older than this get deleted.
   * Defaults to 24 hours if not found.
   */
  getPurgeHoursThreshold(): number {
    return this.globalConfigService.getNumber('purge_hours_threshold', 24);
  }
}

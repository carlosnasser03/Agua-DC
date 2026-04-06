/**
 * IAutomationConfig
 *
 * Segregated interface for automation/job-related configuration.
 * Exposed to: Automation service, scheduled jobs, report lifecycle manager
 *
 * Contains settings for automatic report state transitions and cleanup:
 * - Auto-review delay
 * - Auto-resolve delay
 * - Purge threshold for old reports
 */
export interface IAutomationConfig {
  /**
   * Minutes of inactivity before a ENVIADO report automatically transitions to EN_REVISION.
   * Type: number
   * Key: 'auto_review_minutes'
   */
  getAutoReviewMinutes(): number;

  /**
   * Hours a report can stay in EN_REVISION without admin action before auto-resolving.
   * Type: number
   * Key: 'auto_resolve_hours'
   */
  getAutoResolveHours(): number;

  /**
   * Hours threshold: reports older than this (in RESUELTO or RECHAZADO status) get purged.
   * Type: number
   * Key: 'purge_hours_threshold'
   */
  getPurgeHoursThreshold(): number;
}

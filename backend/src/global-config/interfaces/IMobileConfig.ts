/**
 * IMobileConfig
 *
 * Segregated interface for mobile app (citizen-facing) configuration.
 * Exposed to: Mobile API endpoints (no auth required, device-based identity)
 *
 * Contains settings relevant to citizen-facing features:
 * - Max reports per device per day
 * - Report retention period
 *
 * NOTE: Does NOT include admin session settings, automation settings, etc.
 */
export interface IMobileConfig {
  /**
   * Maximum number of reports a single device can submit per 24-hour period.
   * Type: number
   * Key: 'reports_per_day'
   */
  getMaxReportsPerDay(): number;

  /**
   * Number of days to retain resolved/rejected reports before automatic purge.
   * Type: number
   * Key: 'purge_hours_threshold' (converted to days)
   */
  getReportRetentionDays(): number;
}

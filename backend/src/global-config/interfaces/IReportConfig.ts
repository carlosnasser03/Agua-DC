/**
 * IReportConfig
 *
 * Segregated interface for report-related configuration.
 * Exposed to: ReportService, automation jobs, potentially mobile app
 *
 * Contains settings that govern report behavior:
 * - Max reports per device per day
 * - Report retention period
 * - Default report status upon creation
 */
export interface IReportConfig {
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

  /**
   * Default status assigned to newly created reports.
   * Type: string
   * Key: 'default_report_status' (if added, otherwise defaults to 'ENVIADO')
   */
  getDefaultReportStatus(): string;
}

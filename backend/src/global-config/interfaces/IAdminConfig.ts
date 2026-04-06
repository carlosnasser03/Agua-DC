/**
 * IAdminConfig
 *
 * Segregated interface for admin panel session and security configuration.
 * Exposed to: Auth service, admin panel only (protected endpoints)
 *
 * Contains settings specific to admin user management:
 * - Session timeout
 * - Failed login attempts threshold
 * - Account lockout duration
 */
export interface IAdminConfig {
  /**
   * Minutes of inactivity before an admin session expires.
   * Type: number
   * Key: 'session_timeout_minutes'
   */
  getSessionTimeoutMinutes(): number;

  /**
   * Maximum number of failed login attempts before account lockout.
   * Type: number
   * Key: 'max_failed_login_attempts' (if added, otherwise defaults to 5)
   */
  getMaxFailedLoginAttempts(): number;

  /**
   * Minutes an admin account remains locked after exceeding failed login attempts.
   * Type: number
   * Key: 'lockout_duration_minutes' (if added, otherwise defaults to 15)
   */
  getLockoutDurationMinutes(): number;
}

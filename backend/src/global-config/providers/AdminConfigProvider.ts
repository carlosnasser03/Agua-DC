import { Injectable } from '@nestjs/common';
import { GlobalConfigService } from '../global-config.service';
import { IAdminConfig } from '../interfaces/IAdminConfig';

/**
 * AdminConfigProvider
 *
 * Implements IAdminConfig by delegating to GlobalConfigService.
 * Maps generic config keys to admin-specific security and session methods.
 *
 * Injected into: AuthService, session middleware, JWT strategy
 */
@Injectable()
export class AdminConfigProvider implements IAdminConfig {
  constructor(private globalConfigService: GlobalConfigService) {}

  /**
   * Get admin session timeout in minutes.
   * Defaults to 60 minutes if not found.
   */
  getSessionTimeoutMinutes(): number {
    return this.globalConfigService.getNumber('session_timeout_minutes', 60);
  }

  /**
   * Get maximum failed login attempts before lockout.
   * Defaults to 5 if not found.
   */
  getMaxFailedLoginAttempts(): number {
    return this.globalConfigService.getNumber('max_failed_login_attempts', 5);
  }

  /**
   * Get account lockout duration in minutes.
   * Defaults to 15 minutes if not found.
   */
  getLockoutDurationMinutes(): number {
    return this.globalConfigService.getNumber('lockout_duration_minutes', 15);
  }
}

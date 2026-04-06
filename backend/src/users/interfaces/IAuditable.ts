/**
 * © 2026 AguaDC - Segregated Interface
 * IAuditable - Audit Trail Concerns
 *
 * Part of Interface Segregation Principle (ISP) refactoring for AdminUser.
 * Isolates audit-related properties and contracts from other concerns.
 */

export interface IAuditable {
  /**
   * Timestamp when user was created
   */
  createdAt: Date;

  /**
   * Timestamp when user was last modified
   */
  updatedAt: Date;

  /**
   * Timestamp of last successful login
   * null if user has never logged in
   */
  lastLogin?: Date;

  /**
   * Audit logs - records of all actions performed by/on this user
   * Type: AuditLog[]
   */
  auditLogs: any[];
}

/**
 * © 2026 AguaDC - Segregated Interface
 * IAuthenticable - Authentication Concerns
 *
 * Part of Interface Segregation Principle (ISP) refactoring for AdminUser.
 * Isolates authentication-related properties and contracts from other concerns.
 */

export interface IAuthenticable {
  /**
   * User email - used as unique identifier for login
   */
  email: string;

  /**
   * Hashed password - should be bcrypt hash
   */
  password: string;

  /**
   * User account status
   * ACTIVE: User can login
   * INACTIVE: User cannot login
   */
  status: 'ACTIVE' | 'INACTIVE';
}

/**
 * © 2026 AguaDC - Segregated Interface
 * IAuthorizable - Authorization/Permission Concerns
 *
 * Part of Interface Segregation Principle (ISP) refactoring for AdminUser.
 * Isolates authorization-related properties and contracts from other concerns.
 */

export interface IAuthorizable {
  /**
   * Reference to the user's assigned role
   * The role determines available permissions and capabilities
   */
  roleId: string;

  /**
   * The Role object with full details
   * Type: Role (Prisma model)
   */
  role: any;

  /**
   * Computed list of all permissions granted to this user through their role
   * Type: string[] (permission names/identifiers)
   */
  permissions?: string[];
}

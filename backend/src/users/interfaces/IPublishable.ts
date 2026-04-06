/**
 * © 2026 AguaDC - Segregated Interface
 * IPublishable - Publishing/Activity Concerns
 *
 * Part of Interface Segregation Principle (ISP) refactoring for AdminUser.
 * Isolates publishing-related properties and contracts from other concerns.
 */

export interface IPublishable {
  /**
   * Publications created/owned by this user
   * Tracks content publishing history and activity
   * Type: PublicationLog[]
   */
  publications: any[];
}

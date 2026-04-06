/**
 * Test database helper utilities
 * Provides methods for database setup/teardown in tests
 */

import { PrismaClient } from '@prisma/client';

export class TestDatabaseHelper {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Clear all data from the database
   * WARNING: This deletes all records. Use only in test environments.
   */
  async clearDatabase(): Promise<void> {
    // Delete in reverse order of dependencies
    await this.prisma.auditLog.deleteMany({});
    await this.prisma.reportStatusHistory.deleteMany({});
    await this.prisma.report.deleteMany({});
    await this.prisma.scheduleEntry.deleteMany({});
    await this.prisma.schedulePeriod.deleteMany({});
    await this.prisma.schedule.deleteMany({});
    await this.prisma.alias.deleteMany({});
    await this.prisma.colony.deleteMany({});
    await this.prisma.sector.deleteMany({});
    await this.prisma.deviceProfile.deleteMany({});
    await this.prisma.rolePermission.deleteMany({});
    await this.prisma.permission.deleteMany({});
    await this.prisma.user.deleteMany({});
    await this.prisma.role.deleteMany({});
  }

  /**
   * Truncate specific tables
   */
  async truncateTables(tableNames: string[]): Promise<void> {
    for (const tableName of tableNames) {
      await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" CASCADE`);
    }
  }

  /**
   * Get count of records in a table
   */
  async getTableCount(tableName: string): Promise<number> {
    const result = await this.prisma.$queryRawUnsafe<[{ count: bigint }]>(
      `SELECT COUNT(*) as count FROM "${tableName}"`,
    );
    return Number(result[0]?.count ?? 0);
  }

  /**
   * Verify database connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Create a test database helper instance
 */
export function createTestDatabaseHelper(prisma: PrismaClient): TestDatabaseHelper {
  return new TestDatabaseHelper(prisma);
}

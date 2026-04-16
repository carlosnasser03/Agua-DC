import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ValidationError {
  rowNumber?: number;
  fieldName?: string;
  value?: any;
  message: string;
  ruleType: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

@Injectable()
export class ExcelValidationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Retrieve all enabled validation rules from database
   */
  async getEnabledRules() {
    return this.prisma.excelValidationRule.findMany({
      where: { enabled: true },
    });
  }

  /**
   * Validate data against rules from database
   * @param rows Array of processed rows with structure {row, original, normalized, isValid}
   * @param periodData Period information with startDate and endDate
   * @returns ValidationResult with errors and validation status
   */
  async validateWithRules(rows: any[], periodData: any): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Get enabled rules from database
    const rules = await this.getEnabledRules();

    // Apply each rule to the rows
    for (const rule of rules) {
      switch (rule.ruleType) {
        case 'COLONY_MATCH':
          const colonyWarnings = this.validateColonyMatch(rows, rule);
          warnings.push(...colonyWarnings);
          break;
        case 'VALID_DATE':
          this.validateValidDate(periodData, errors, rule);
          break;
        case 'VALID_TIME':
          this.validateValidTime(rows, errors, rule);
          break;
        default:
          warnings.push(`Unknown rule type: ${rule.ruleType}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate that all colonies match known colonies
   */
  private validateColonyMatch(
    rows: any[],
    errors: ValidationError[],
    rule: any,
  ) {
    rows.forEach((result) => {
      if (!result.isValid) {
        const errorMessage = rule.errorMessage
          .replace('{colonyName}', result.original.colonyName)
          .replace('{rowNumber}', result.row);

        errors.push({
          rowNumber: result.row,
          fieldName: 'colonyName',
          value: result.original.colonyName,
          message: errorMessage,
          ruleType: rule.ruleType,
        });
      }
    });
  }

  /**
   * Validate that period dates are valid
   */
  private validateValidDate(periodData: any, errors: ValidationError[], rule: any) {
    if (!periodData || !periodData.startDate || !periodData.endDate) {
      errors.push({
        fieldName: 'period',
        message: rule.errorMessage,
        ruleType: rule.ruleType,
      });
      return;
    }

    const startDate = new Date(periodData.startDate);
    const endDate = new Date(periodData.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      errors.push({
        fieldName: 'period',
        message: rule.errorMessage,
        ruleType: rule.ruleType,
      });
      return;
    }

    if (startDate >= endDate) {
      errors.push({
        fieldName: 'period',
        message: 'La fecha de inicio debe ser menor que la fecha de fin',
        ruleType: rule.ruleType,
      });
    }
  }

  /**
   * Validate that time entries are in valid format
   */
  private validateValidTime(rows: any[], errors: ValidationError[], rule: any) {
    const timeRegex = /^\d{2}:\d{2}-\d{2}:\d{2}$/;

    rows.forEach((result) => {
      if (
        result.original.timeStr &&
        result.original.timeStr.trim().length > 0 &&
        !timeRegex.test(result.normalized.time || '')
      ) {
        const errorMessage = rule.errorMessage
          .replace('{timeStr}', result.original.timeStr)
          .replace('{rowNumber}', result.row);

        errors.push({
          rowNumber: result.row,
          fieldName: 'time',
          value: result.original.timeStr,
          message: errorMessage,
          ruleType: rule.ruleType,
        });
      }
    });
  }

  /**
   * Create a new validation rule (admin operation)
   */
  async createRule(data: {
    name: string;
    description: string;
    errorMessage: string;
    ruleType: string;
    ruleConfig?: any;
  }) {
    return this.prisma.excelValidationRule.create({
      data: {
        ...data,
        id: require('crypto').randomUUID(),
      },
    });
  }

  /**
   * Update an existing validation rule (admin operation)
   */
  async updateRule(
    ruleId: string,
    data: {
      name?: string;
      description?: string;
      errorMessage?: string;
      enabled?: boolean;
      ruleConfig?: any;
    },
  ) {
    return this.prisma.excelValidationRule.update({
      where: { id: ruleId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Delete a validation rule (admin operation)
   */
  async deleteRule(ruleId: string) {
    return this.prisma.excelValidationRule.delete({
      where: { id: ruleId },
    });
  }

  /**
   * List all validation rules
   */
  async listRules() {
    return this.prisma.excelValidationRule.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Toggle a rule's enabled status
   */
  async toggleRule(ruleId: string) {
    const rule = await this.prisma.excelValidationRule.findUnique({
      where: { id: ruleId },
    });

    if (!rule) {
      throw new BadRequestException('Rule not found');
    }

    return this.prisma.excelValidationRule.update({
      where: { id: ruleId },
      data: { enabled: !rule.enabled },
    });
  }
}

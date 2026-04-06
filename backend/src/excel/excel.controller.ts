import {
  Controller, Post, UseInterceptors, UploadedFile,
  UseGuards, Request, Body, BadRequestException, Get, Param, Put, Delete
} from '@nestjs/common';
import { CreateValidationRuleDto, UpdateValidationRuleDto } from './dto/validation-rule.dto';
import { IsUUID, IsNotEmpty } from 'class-validator';

class PublishUploadDto {
  @IsUUID('4', { message: 'uploadId debe ser un UUID válido' })
  @IsNotEmpty()
  uploadId: string;
}
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ExcelService } from './excel.service';
import { ExcelValidationService } from './excel-validation.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

const EXCEL_MIMETYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel',                                          // .xls
];
const MAX_FILE_SIZE_MB = 10;

@Controller('excel')
export class ExcelController {
  constructor(
    private excelService: ExcelService,
    private excelValidationService: ExcelValidationService,
  ) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin Operativo', 'Editor de Datos')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (EXCEL_MIMETYPES.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls)$/i)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Solo se permiten archivos Excel (.xlsx, .xls)'), false);
        }
      },
    })
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ) {
    if (!file) throw new BadRequestException('No se recibio ningún archivo');
    return this.excelService.processUpload(file.buffer, file.originalname, req.user.userId);
  }

  @Post('publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin Operativo')
  async publish(@Request() req, @Body() dto: PublishUploadDto) {
    return this.excelService.publish(dto.uploadId, req.user.userId);
  }

  // Validation Rules Management Endpoints
  @Get('validation-rules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin Operativo', 'Editor de Datos')
  async listValidationRules() {
    return this.excelValidationService.listRules();
  }

  @Post('validation-rules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin Operativo')
  async createValidationRule(@Body() data: CreateValidationRuleDto) {
    return this.excelValidationService.createRule(data);
  }

  @Put('validation-rules/:ruleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin Operativo')
  async updateValidationRule(
    @Param('ruleId') ruleId: string,
    @Body() data: UpdateValidationRuleDto
  ) {
    return this.excelValidationService.updateRule(ruleId, data);
  }

  @Put('validation-rules/:ruleId/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin Operativo')
  async toggleValidationRule(@Param('ruleId') ruleId: string) {
    return this.excelValidationService.toggleRule(ruleId);
  }

  @Delete('validation-rules/:ruleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin')
  async deleteValidationRule(@Param('ruleId') ruleId: string) {
    return this.excelValidationService.deleteRule(ruleId);
  }
}

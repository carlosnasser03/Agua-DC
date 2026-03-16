import {
  Controller, Post, UseInterceptors, UploadedFile,
  UseGuards, Request, Body, BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ExcelService } from './excel.service';
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
  constructor(private excelService: ExcelService) {}

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
  async publish(@Request() req, @Body('uploadId') uploadId: string) {
    if (!uploadId) throw new BadRequestException('uploadId es requerido');
    return this.excelService.publish(uploadId, req.user.userId);
  }
}

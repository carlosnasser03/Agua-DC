import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { GlobalConfigService } from './global-config.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

class UpdateConfigDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  value: string;
}

@Controller('config')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Super Admin')
export class GlobalConfigController {
  constructor(private readonly configService: GlobalConfigService) {}

  @Get()
  getAll() {
    return this.configService.getAll();
  }

  @Patch(':key')
  update(@Param('key') key: string, @Body() dto: UpdateConfigDto) {
    return this.configService.update(key, dto.value);
  }
}

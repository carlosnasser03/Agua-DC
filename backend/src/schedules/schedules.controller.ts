import { Controller, Get, Query } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SearchScheduleDto } from './dto/search-schedule.dto';

import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('schedules')
@Controller('schedules')
export class SchedulesController {
  constructor(private schedulesService: SchedulesService) {}

  /**
   * Endpoint público para la app móvil.
   * Busca los horarios del período activo para una colonia o sector.
   * GET /api/schedules/search?colony=VIERA
   * GET /api/schedules/search?colony=VIERA&from=2026-03-01&to=2026-03-15
   */
  @Get('search')
  @ApiOperation({ summary: 'Buscar horarios por colonia', description: 'Retorna los horarios programados de abastecimiento de agua buscando por nombre de colonia o sector' })
  @ApiQuery({ name: 'colony', required: true, description: 'Nombre de la colonia o sector (ej. KENNEDY)' })
  @ApiQuery({ name: 'from', required: false, description: 'Fecha de inicio (ISO 8601)' })
  @ApiQuery({ name: 'to', required: false, description: 'Fecha de fin (ISO 8601)' })
  @ApiResponse({ status: 200, description: 'Lista de horarios filtrados.' })
  @ApiResponse({ status: 400, description: 'Parámetros de búsqueda inválidos.' })
  search(@Query() query: SearchScheduleDto) {
    return this.schedulesService.searchByColony(query.colony, query.from, query.to);
  }

  /**
   * Retorna el período activo actual.
   * GET /api/schedules/active-period
   */
  @Get('active-period')
  @ApiOperation({ summary: 'Obtener período activo', description: 'Retorna la información del período de abastecimiento que se encuentra activo actualmente' })
  @ApiResponse({ status: 200, description: 'Información del período activo.' })
  getActivePeriod() {
    return this.schedulesService.getActivePeriod();
  }
}

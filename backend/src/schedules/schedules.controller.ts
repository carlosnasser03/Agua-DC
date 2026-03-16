import { Controller, Get, Query } from '@nestjs/common';
import { SchedulesService } from './schedules.service';

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
  search(
    @Query('colony') colony: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.schedulesService.searchByColony(colony, from, to);
  }

  /**
   * Retorna el período activo actual.
   * GET /api/schedules/active-period
   */
  @Get('active-period')
  getActivePeriod() {
    return this.schedulesService.getActivePeriod();
  }
}

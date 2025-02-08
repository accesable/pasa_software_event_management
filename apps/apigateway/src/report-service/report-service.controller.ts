import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ReportServiceService } from './report-service.service';
import { DecodeAccessResponse } from '../../../../libs/common/src';
import { ResponseMessage, User } from '../decorators/public.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('reports')
export class ReportServiceController {
  constructor(private readonly reportService: ReportServiceService) { }

  @Get('/events-by-date')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Get user events by date success')
  async getUserEventsByDate(
    @Query() query: any,
    @User() user: DecodeAccessResponse,
  ) {
    return this.reportService.getUserEventsByDate(user.id, query.year, query.month);
  }

  @Get('event-category-distribution')
  async getEventCategoryDistribution() {
    return this.reportService.getEventCategoryDistribution();
  }

  // 1) /reports/:eventId/participation-stats
  @Get(':eventId/participation-stats')
  async getEventParticipationStats(@Param('eventId') eventId: string) {
    return this.reportService.getEventParticipationStats(eventId);
  }

  // 2) /reports/:eventId/timeline
  @Get(':eventId/timeline')
  async getParticipationTimeline(@Param('eventId') eventId: string) {
    return this.reportService.getParticipationTimeline(eventId);
  }

  // 3) /reports/monthly-participation?year=2025
  @Get('monthly-participation')
  async getMonthlyStats(@Query('year', ParseIntPipe) year: number) {
    return this.reportService.getMonthlyParticipationStats(year);
  }

  // 4) /reports/:eventId/check-in-out-analysis
  @Get(':eventId/check-in-out-analysis')
  async getCheckInOutTimeAnalysis(@Param('eventId') eventId: string) {
    return this.reportService.getCheckInOutTimeAnalysis(eventId);
  }

  // 5) /reports/:eventId/participation-rate
  @Get(':eventId/participation-rate')
  async getParticipationRate(@Param('eventId') eventId: string) {
    return this.reportService.getParticipationRate(eventId);
  }
}

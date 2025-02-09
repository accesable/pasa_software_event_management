import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ReportServiceService } from './report-service.service';
import { DecodeAccessResponse } from '../../../../libs/common/src';
import { ResponseMessage, User } from '../decorators/public.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  ReportServiceProtoControllerMethods,
  ReportServiceProtoController,
  Empty,
  EventCategoryDistributionResponse,
  UserEventsByDateRequest,
  OrganizerEventFeedbackSummaryRequest,
  OrganizerEventFeedbackSummaryResponse,
  EventInvitationReportRequest,
  EventInvitationReportResponse,
  MonthlyEventCountsResponse // Import MonthlyEventCountsResponse
} from '../../../../libs/common/src/types/report';
import { Observable } from 'rxjs';

@Controller('reports')
@ReportServiceProtoControllerMethods()
export class ReportServiceController {
  constructor(private readonly reportServiceService: ReportServiceService) {}

  @Get('/events-by-date')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Get user events by date success')
  async getUserEventsByDate(
    @Query('year') year: number,
    @Query('month') month: number | undefined,
    @User() user: DecodeAccessResponse,
  ): Promise<MonthlyEventCountsResponse> { // Updated return type
    const request: UserEventsByDateRequest = {
      userId: user.id,
      year: Number(year),
      month: month ? Number(month) : undefined,
    };
    return this.reportServiceService.getUserEventsByDate(request);
  }

  @Get('/event-category-distribution')
  @ResponseMessage('Get event category distribution success')
  async getEventCategoryDistribution(): Promise<EventCategoryDistributionResponse> {
    const request: Empty = {};
    return this.reportServiceService.getEventCategoryDistribution(request);
  }

  @Get('/organizer-feedback-summary')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Get organizer event feedback summary success')
  async getOrganizerEventFeedbackSummary(
    @User() user: DecodeAccessResponse,
  ): Promise<OrganizerEventFeedbackSummaryResponse> {
    const request: OrganizerEventFeedbackSummaryRequest = { userId: user.id };
    return this.reportServiceService.getOrganizerEventFeedbackSummary(request);
  }

  @Get(':eventId/invitations')
  @ResponseMessage('Get event invitation report success')
  async getEventInvitationReport(
    @Param('eventId') eventId: string,
  ): Promise<EventInvitationReportResponse> {
    const request: EventInvitationReportRequest = { eventId };
    return this.reportServiceService.getEventInvitationReport(request);
  }
}
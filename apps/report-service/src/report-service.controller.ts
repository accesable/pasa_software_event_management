import { Controller } from '@nestjs/common';
import {
  ReportServiceProtoControllerMethods,
  ReportServiceProtoController,
  // import message request/response
  EventRequest,
  EventParticipationStatsResponse,
  ParticipationTimelineResponse,
  MonthlyStatsRequest,
  MonthlyParticipationStatsResponse,
  CheckInOutTimeAnalysisResponse,
  ParticipationRateResponse,
} from '../../../libs/common/src/types/report'; 
// => tuỳ path bạn generate

import { ReportServiceService } from './report-service.service';

@Controller()
@ReportServiceProtoControllerMethods() 
export class ReportServiceController implements ReportServiceProtoController {
  constructor(private readonly reportServiceService: ReportServiceService) {}

  // 1) GetEventParticipationStats
  getEventParticipationStats(request: EventRequest): Promise<EventParticipationStatsResponse> {
    return this.reportServiceService.getEventParticipationStats(request.eventId);
  }

  // 2) GetParticipationTimeline
  getParticipationTimeline(request: EventRequest): Promise<ParticipationTimelineResponse> {
    return this.reportServiceService.getParticipationTimeline(request.eventId);
  }

  // 3) GetMonthlyParticipationStats
  getMonthlyParticipationStats(
    request: MonthlyStatsRequest,
  ): Promise<MonthlyParticipationStatsResponse> {
    return this.reportServiceService.getMonthlyParticipationStats(request.year);
  }

  // 4) GetCheckInOutTimeAnalysis
  getCheckInOutTimeAnalysis(
    request: EventRequest,
  ): Promise<CheckInOutTimeAnalysisResponse> {
    return this.reportServiceService.getCheckInOutTimeAnalysis(request.eventId);
  }

  // 5) GetParticipationRate
  getParticipationRate(
    request: EventRequest,
  ): Promise<ParticipationRateResponse> {
    return this.reportServiceService.getParticipationRate(request.eventId);
  }
}

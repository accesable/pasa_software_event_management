import { Controller } from '@nestjs/common';
import { ReportServiceService } from './report-service.service';
import {
  AverageParticipationTimeResponse,
  CheckInOutTimeAnalysisResponse,
  EventParticipationStatsResponse,
  GetEventParticipationStatsRequest,
  GetEventRequest,
  GetMonthlyParticipationStatsRequest,
  GetParticipantsByEventRequest,
  MonthlyParticipationStatsResponse,
  ParticipantsResponse,
  ParticipationRateResponse,
  ReportServiceController,
  ReportServiceControllerMethods,
} from '@app/common/types/report';
import { Observable } from 'rxjs';

@Controller()
@ReportServiceControllerMethods()
export class ReportServiceController implements ReportServiceController {
  constructor(private readonly reportServiceService: ReportServiceService) { }

  getParticipationRate(
    request: GetEventRequest,
  ) {
    return this.reportServiceService.getParticipationRate(request.eventId);
  }
  getCheckInOutTimeAnalysis(
    request: GetEventRequest,
  ) {
    return this.reportServiceService.getCheckInOutTimeAnalysis(request.eventId);
  }
  getAverageParticipationTime(
    request: GetEventRequest,
  ){
    return this.reportServiceService.getAverageParticipationTime(request.eventId);
  }

  getMonthlyParticipationStats(
    request: GetMonthlyParticipationStatsRequest,
  ) {
    return this.reportServiceService.getMonthlyParticipationStats(request);
  }

  getEventParticipationStats(
    request: GetEventParticipationStatsRequest,
  ) {
    return this.reportServiceService.getEventParticipationStats(request.eventId);
  }

  getParticipantsByEvent(
    request: GetParticipantsByEventRequest,
  ) {
    return this.reportServiceService.getParticipantsByEvent(request.eventId);
  }
}
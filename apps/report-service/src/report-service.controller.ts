import { Controller } from '@nestjs/common';
import { ReportServiceService } from './report-service.service';
import { Observable } from 'rxjs';
import { ReportServiceControllerMethods, GetEventRequest, ParticipationRateResponse, CheckInOutTimeAnalysisResponse, AverageParticipationTimeResponse, GetMonthlyParticipationStatsRequest, MonthlyParticipationStatsResponse, GetEventParticipationStatsRequest, EventParticipationStatsResponse, GetParticipantsByEventRequest, ParticipantsResponse } from '../../../libs/common/src/types/report';

@Controller()
@ReportServiceControllerMethods()
export class ReportServiceController implements ReportServiceController {
  constructor(private readonly reportServiceService: ReportServiceService) {}

  // Lấy thông tin tổng quan về checkin, checkout, số người tham gia, ...
  getParticipationRate(
    request: GetEventRequest,
  ):
    | ParticipationRateResponse
    | Promise<ParticipationRateResponse>
    | Observable<ParticipationRateResponse> {
    return this.reportServiceService.getParticipationRate(request.eventId);
  }

  // Phân tích thời gian check in/out trung bình
  getCheckInOutTimeAnalysis(
    request: GetEventRequest,
  ):
    | CheckInOutTimeAnalysisResponse
    | Promise<CheckInOutTimeAnalysisResponse>
    | Observable<CheckInOutTimeAnalysisResponse> {
    return this.reportServiceService.getCheckInOutTimeAnalysis(request.eventId);
  }

  // Lấy thời gian tham dự trung bình của user
  getAverageParticipationTime(
    request: GetEventRequest,
  ):
    | AverageParticipationTimeResponse
    | Promise<AverageParticipationTimeResponse>
    | Observable<AverageParticipationTimeResponse> {
    return this.reportServiceService.getAverageParticipationTime(request.eventId);
  }

  // Lấy thống kê số lượng người tham gia theo từng tháng trong năm
  getMonthlyParticipationStats(
    request: GetMonthlyParticipationStatsRequest,
  ):
    | MonthlyParticipationStatsResponse
    | Promise<MonthlyParticipationStatsResponse>
    | Observable<MonthlyParticipationStatsResponse> {
    return this.reportServiceService.getMonthlyParticipationStats(request);
  }

  // Lấy thông số tổng quát của sự kiện
  getEventParticipationStats(
    request: GetEventParticipationStatsRequest,
  ):
    | EventParticipationStatsResponse
    | Promise<EventParticipationStatsResponse>
    | Observable<EventParticipationStatsResponse> {
    return this.reportServiceService.getEventParticipationStats(request.eventId);
  }

  // Lấy danh sách người tham gia cho sự kiện (bao gồm check in/out time)
  getParticipantsByEvent(
    request: GetParticipantsByEventRequest,
  ):
    | ParticipantsResponse
    | Promise<ParticipantsResponse>
    | Observable<ParticipantsResponse> {
    return this.reportServiceService.getParticipantsByEvent(request.eventId);
  }
}
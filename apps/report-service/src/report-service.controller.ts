import { Controller } from '@nestjs/common';
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
} from '../../../libs/common/src/types/report';
import { ReportServiceService } from './report-service.service';
import { Observable } from 'rxjs';

@Controller()
@ReportServiceProtoControllerMethods()
export class ReportServiceController implements ReportServiceProtoController {
  constructor(private readonly reportServiceService: ReportServiceService) {}

  getUserEventsByDate(request: UserEventsByDateRequest) {
    return this.reportServiceService.getUserEventsByDate(request);
  }
  getEventCategoryDistribution(request: Empty): Promise<EventCategoryDistributionResponse> {
    return this.reportServiceService.getEventCategoryDistribution(request);
  }

  getOrganizerEventFeedbackSummary(request: OrganizerEventFeedbackSummaryRequest): Promise<OrganizerEventFeedbackSummaryResponse> {
    return this.reportServiceService.getOrganizerEventFeedbackSummary(request);
  }
  getEventInvitationReport(request: EventInvitationReportRequest): Promise<EventInvitationReportResponse> {
    return this.reportServiceService.getEventInvitationReport(request);
  }
}
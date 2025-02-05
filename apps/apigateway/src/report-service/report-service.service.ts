import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
  ReportServiceProtoClient,
  REPORT_SERVICE_PROTO_SERVICE_NAME,
  EventRequest,
  MonthlyStatsRequest,
} from '../../../../libs/common/src/types/report'; 
import { REPORT_SERVICE } from '../constants/service.constant';
// ^^^ path TS proto


@Injectable()
export class ReportServiceService implements OnModuleInit {
  private reportService: ReportServiceProtoClient;

  constructor(
    @Inject(REPORT_SERVICE) private readonly reportClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.reportService = this.reportClient.getService<ReportServiceProtoClient>(
      REPORT_SERVICE_PROTO_SERVICE_NAME,
    );
  }

  // 1) getEventParticipationStats
  async getEventParticipationStats(eventId: string) {
    const payload: EventRequest = { eventId };
    return lastValueFrom(this.reportService.getEventParticipationStats(payload));
  }

  // 2) getParticipationTimeline
  async getParticipationTimeline(eventId: string) {
    const payload: EventRequest = { eventId };
    return lastValueFrom(this.reportService.getParticipationTimeline(payload));
  }

  // 3) getMonthlyParticipationStats
  async getMonthlyParticipationStats(year: number) {
    const payload: MonthlyStatsRequest = { year };
    return lastValueFrom(this.reportService.getMonthlyParticipationStats(payload));
  }

  // 4) getCheckInOutTimeAnalysis
  async getCheckInOutTimeAnalysis(eventId: string) {
    return lastValueFrom(
      this.reportService.getCheckInOutTimeAnalysis({ eventId }),
    );
  }

  // 5) getParticipationRate
  async getParticipationRate(eventId: string) {
    return lastValueFrom(this.reportService.getParticipationRate({ eventId }));
  }
}

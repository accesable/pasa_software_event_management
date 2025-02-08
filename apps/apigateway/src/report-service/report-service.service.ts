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
import { handleRpcException } from '../../../../libs/common/src/filters/handleException';
// ^^^ path TS proto


@Injectable()
export class ReportServiceService implements OnModuleInit {
  private reportService: ReportServiceProtoClient;

  constructor(
    @Inject(REPORT_SERVICE) private readonly reportClient: ClientGrpc,
  ) { }

  onModuleInit() {
    this.reportService = this.reportClient.getService<ReportServiceProtoClient>(
      REPORT_SERVICE_PROTO_SERVICE_NAME,
    );
  }

  async getUserEventsByDate(userId: string, year: number, month?: number) {
    try {
      return lastValueFrom(
        this.reportService.getUserEventsByDate({ userId, year, month }),
      );
    } catch (error) {
      throw handleRpcException(error, 'Failed to get ticket by participant id');
    }
  }

  async getEventCategoryDistribution() {
    try {
      return lastValueFrom(this.reportService.getEventCategoryDistribution({}));
    } catch (error) {
      throw handleRpcException(error, 'Failed to get ticket by participant id');
    }
  }

  // 1) getEventParticipationStats
  async getEventParticipationStats(eventId: string) {
    try {
      const payload: EventRequest = { eventId };
      return lastValueFrom(this.reportService.getEventParticipationStats(payload));
    } catch (error) {
      throw handleRpcException(error, 'Failed to get ticket by participant id');
    }
  }

  // 2) getParticipationTimeline
  async getParticipationTimeline(eventId: string) {
    try {
      const payload: EventRequest = { eventId };
      return lastValueFrom(this.reportService.getParticipationTimeline(payload));
    } catch (error) {
      throw handleRpcException(error, 'Failed to get ticket by participant id');
    }
  }

  // 3) getMonthlyParticipationStats
  async getMonthlyParticipationStats(year: number) {
    try {
      const payload: MonthlyStatsRequest = { year };
      return lastValueFrom(this.reportService.getMonthlyParticipationStats(payload));
    } catch (error) {
      throw handleRpcException(error, 'Failed to get ticket by participant id');
      
    }
  }

  // 4) getCheckInOutTimeAnalysis
  async getCheckInOutTimeAnalysis(eventId: string) {
    try {
      return lastValueFrom(
        this.reportService.getCheckInOutTimeAnalysis({ eventId }),
      );
    } catch (error) {
      throw handleRpcException(error, 'Failed to get ticket by participant id');
    }
  }

  // 5) getParticipationRate
  async getParticipationRate(eventId: string) {
    try {
      return lastValueFrom(this.reportService.getParticipationRate({ eventId }));
    } catch (error) {
      throw handleRpcException(error, 'Failed to get ticket by participant id');
      
    }
  }
}

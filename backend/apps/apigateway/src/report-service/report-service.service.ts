import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { REPORT_SERVICE } from '../constants/service.constant';
import { handleRpcException } from '../../../../libs/common/src/filters/handleException';
import { ReportServiceProtoClient, REPORT_SERVICE_PROTO_SERVICE_NAME, UserEventsByDateRequest, EventCategoryDistributionResponse, Empty, OrganizerEventFeedbackSummaryRequest, OrganizerEventFeedbackSummaryResponse, EventInvitationReportRequest, EventInvitationReportResponse } from '../../../../libs/common/src/types/report';
import { RedisCacheService } from '../redis/redis.service';

@Injectable()
export class ReportServiceService implements OnModuleInit {
  private reportService: ReportServiceProtoClient;

  constructor(
    private readonly redisCacheService: RedisCacheService,
    @Inject(REPORT_SERVICE) private readonly reportClient: ClientGrpc,
  ) { }

  onModuleInit() {
    this.reportService = this.reportClient.getService<ReportServiceProtoClient>(
      REPORT_SERVICE_PROTO_SERVICE_NAME,
    );
  }

  async getUserEventsByDate(request: UserEventsByDateRequest) {
    try {
      return await lastValueFrom(this.reportService.getUserEventsByDate(request));
    } catch (error) {
      throw handleRpcException(error, 'Failed to get user events by date');
    }
  }

  async getEventCategoryDistribution(request: Empty): Promise<EventCategoryDistributionResponse> {
    try {
      return await lastValueFrom(this.reportService.getEventCategoryDistribution(request));
    } catch (error) {
      throw handleRpcException(error, 'Failed to get event category distribution');
    }
  }

  async getOrganizerEventFeedbackSummary(request: OrganizerEventFeedbackSummaryRequest): Promise<OrganizerEventFeedbackSummaryResponse> {
    try {
      return await lastValueFrom(this.reportService.getOrganizerEventFeedbackSummary(request));
    } catch (error) {
      throw handleRpcException(error, 'Failed to get organizer event feedback summary');
    }
  }

  async getEventInvitationReport(request: EventInvitationReportRequest): Promise<EventInvitationReportResponse> {
    try {
      return await lastValueFrom(this.reportService.getEventInvitationReport(request));
    } catch (error) {
      throw handleRpcException(error, 'Failed to get event invitation report');
    }
  }

  async getEventCategoryStats() { // Method MỚI with Redis caching
    const cacheKey = 'eventCategoryStats';
    try {
      // Try to get the result from Redis cache
      const cached = await this.redisCacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
      // If not cached, fetch the result
      const result = await lastValueFrom(
        this.reportService.getEventCategoryStats({})
      );
      // Cache the result for 1 hour (3600 seconds)
      await this.redisCacheService.set(cacheKey, result, 300);
      return result;
    } catch (error) {
      throw handleRpcException(error, 'Failed to get event category stats');
    }
  }
}
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  AverageParticipationTimeResponse,
  CheckInOutTimeAnalysisResponse,
  EventParticipationStatsResponse,
  GetEventParticipationStatsRequest,
  GetEventRequest,
  GetMonthlyParticipationStatsRequest,
  GetParticipantsByEventRequest,
  MonthlyParticipationStatsResponse,
  Participant,
  ParticipantsResponse,
  ParticipationRateResponse,
} from '@app/common/types/report';
import { ClientGrpc } from '@nestjs/microservices';
import { EVENT_SERVICE, TICKET_SERVICE } from '../../apigateway/src/constants/service.constant';
import {
  EventServiceClient,
  EVENT_SERVICE_NAME,
} from '../../../libs/common/src/types/event';
import { lastValueFrom } from 'rxjs';
import {
  TicketServiceProtoClient,
  TICKET_SERVICE_PROTO_SERVICE_NAME,
} from '../../../libs/common/src/types/ticket';

@Injectable()
export class ReportServiceService implements OnModuleInit {
  private eventService: EventServiceClient;
  private ticketService: TicketServiceProtoClient;
  constructor(
    @Inject(EVENT_SERVICE) private readonly eventServiceClient: ClientGrpc,
    @Inject(TICKET_SERVICE)
    private readonly ticketServiceClient: ClientGrpc,
  ) { }

  onModuleInit() {
    this.eventService =
      this.eventServiceClient.getService<EventServiceClient>(EVENT_SERVICE_NAME);
    this.ticketService = this.ticketServiceClient.getService<TicketServiceProtoClient>(
      TICKET_SERVICE_PROTO_SERVICE_NAME,
    );
  }

  async getParticipantsByEvent(eventId: string): Promise<ParticipantsResponse> {
    const participants = await lastValueFrom(
      this.ticketService.getParticipantByEventId({ eventId: eventId }),
    );
    return {
      participants: participants.participants.map((participant) => ({
        id: participant.id,
        eventId: participant.eventId,
        userId: participant.userId,
        email: participant.email,
        name: participant.name,
        checkInAt: participant.checkInAt
          ? {
            seconds: Math.floor(
              new Date(participant.checkInAt).getTime() / 1000,
            ),
            nanos: 0,
          }
          : null,
        checkOutAt: participant.checkOutAt
          ? {
            seconds: Math.floor(
              new Date(participant.checkOutAt).getTime() / 1000,
            ),
            nanos: 0,
          }
          : null,
      })),
    };
  }

  async getEventParticipationStats(
    eventId: string,
  ): Promise<EventParticipationStatsResponse> {
    const participants = await this.getParticipantsByEvent(eventId);
    const registeredCount = participants.participants.length;
    const checkInCount = participants.participants.filter(
      (p) => p.checkInAt !== null && p.checkInAt !== undefined,
    ).length;
    const checkOutCount = participants.participants.filter(
      (p) => p.checkOutAt !== null && p.checkOutAt !== undefined,
    ).length;

    return {
      eventId,
      registeredCount,
      checkInCount,
      checkOutCount,
    };
  }

  async getMonthlyParticipationStats(
    request: GetMonthlyParticipationStatsRequest,
  ): Promise<MonthlyParticipationStatsResponse> {
    const { year } = request;
    const monthlyStats: { month: number; participantCount: number }[] = [];

    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(year, month - 1, 1); // First day of the month
      const endDate = new Date(year, month, 0); // Last day of the month

      // Format dates to ISO strings for MongoDB query
      const startDateISO = startDate.toISOString();
      const endDateISO = endDate.toISOString();
      // Fetch participants for the specific month and year
      const result = await lastValueFrom(
        this.ticketService.getAllTicket({
          query: {
            createdAt: {
              $gte: startDateISO,
              $lt: endDateISO,
            },
          },
        }),
      );
      const participantCount = result.tickets.length;

      monthlyStats.push({ month, participantCount });
    }

    return { monthlyStats };
  }

  async getAverageParticipationTime(
    request: GetEventRequest,
  ): Promise<AverageParticipationTimeResponse> {
    const { eventId } = request;
    const participants = await this.getParticipantsByEvent(eventId);

    let totalParticipationTimeInSeconds = 0;
    let participatedCount = 0;

    for (const participant of participants.participants) {
      if (participant.checkInAt && participant.checkOutAt) {
        const checkInTime = new Date(participant.checkInAt.seconds * 1000); // Convert seconds to milliseconds
        const checkOutTime = new Date(participant.checkOutAt.seconds * 1000); // Convert seconds to milliseconds
        const participationTimeInSeconds =
          (checkOutTime.getTime() - checkInTime.getTime()) / 1000; // Calculate difference in seconds
        if (participationTimeInSeconds >= 0) {
          totalParticipationTimeInSeconds += participationTimeInSeconds;
          participatedCount++;
        }
      }
    }

    const averageParticipationTimeInMinutes =
      participatedCount > 0
        ? totalParticipationTimeInSeconds / participatedCount / 60
        : 0;

    return { averageParticipationTimeInMinutes };
  }

  async getCheckInOutTimeAnalysis(
    request: GetEventRequest,
  ): Promise<CheckInOutTimeAnalysisResponse> {
    const { eventId } = request;
    const participants = await this.getParticipantsByEvent(eventId);

    if (participants.participants.length === 0) {
      return {
        averageCheckInTimeInMinutes: 0,
        averageCheckOutTimeInMinutes: 0,
      };
    }

    let totalCheckInTime = 0;
    let totalCheckOutTime = 0;
    let checkInCount = 0;
    let checkOutCount = 0;

    for (const participant of participants.participants) {
      if (participant.checkInAt) {
        totalCheckInTime += participant.checkInAt.seconds;
        checkInCount++;
      }
      if (participant.checkOutAt) {
        totalCheckOutTime += participant.checkOutAt.seconds;
        checkOutCount++;
      }
    }

    const averageCheckInTimeInMinutes =
      checkInCount > 0 ? (totalCheckInTime / checkInCount) / 60 : 0;
    const averageCheckOutTimeInMinutes =
      checkOutCount > 0 ? (totalCheckOutTime / checkOutCount) / 60 : 0;

    return {
      averageCheckInTimeInMinutes,
      averageCheckOutTimeInMinutes,
    };
  }

  async getParticipationRate(request: GetEventRequest) {
    const { eventId } = request;
    const participations = await this.getParticipantsByEvent(eventId);

    if (participations.participants.length === 0) {
      return { checkInRate: 0, checkOutRate: 0 };
    }

    const checkInCount = participations.participants.filter(
      (p) => p.checkInAt !== null,
    ).length;
    const checkOutCount = participations.participants.filter(
      (p) => p.checkOutAt !== null,
    ).length;

    const checkInRate =
      (checkInCount / participations.participants.length) * 100;
    const checkOutRate =
      (checkOutCount / participations.participants.length) * 100;

    return {
      checkInRate,
      checkOutRate,
    };
  }
}
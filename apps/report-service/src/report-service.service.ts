import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import moment from 'moment';

import {
  // Proto messages
  EventParticipationStatsResponse,
  MonthlyParticipationStatsResponse,
  MonthlyParticipationStat,
  ParticipationTimelineResponse,
  TimelinePoint,
  CheckInOutTimeAnalysisResponse,
  ParticipationRateResponse,
} from '../../../libs/common/src/types/report';

import {
  TICKET_SERVICE_PROTO_SERVICE_NAME,
  TicketServiceProtoClient,
  // getAllTicket => AllTicketResponse { tickets: [], meta }
  // getParticipantByEventId => { participants: [...] }
} from '../../../libs/common/src/types/ticket';

import { EVENT_SERVICE, TICKET_SERVICE } from '../../apigateway/src/constants/service.constant';
import { handleRpcException } from '../../../libs/common/src/filters/handleException';

@Injectable()
export class ReportServiceService implements OnModuleInit {
  private ticketService: TicketServiceProtoClient;

  constructor(
    @Inject(TICKET_SERVICE) private readonly ticketServiceClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.ticketService = this.ticketServiceClient.getService<TicketServiceProtoClient>(
      TICKET_SERVICE_PROTO_SERVICE_NAME,
    );
  }

  // 1) Thống kê số participant
  async getEventParticipationStats(eventId: string): Promise<EventParticipationStatsResponse> {
    try {
      const res = await lastValueFrom(
        this.ticketService.getParticipantByEventId({ eventId }),
      );
      // res?.participants => mảng participant
      const participants = res?.participants || [];
      const registeredCount = participants.length;
      const checkInCount = participants.filter((p) => p.checkInAt).length;
      const checkOutCount = participants.filter((p) => p.checkOutAt).length;

      return {
        eventId,
        registeredCount,
        checkInCount,
        checkOutCount,
      };
    } catch (error) {
      throw handleRpcException(error, 'Fail getEventParticipationStats');
    }
  }

  // 2) Lấy timeline checkin/checkout (theo giờ)
  async getParticipationTimeline(eventId: string): Promise<ParticipationTimelineResponse> {
    try {
      const res = await lastValueFrom(
        this.ticketService.getParticipantByEventId({ eventId }),
      );
      const participants = res?.participants || [];

      // map[ "00:00 - 00:59" ] = {in: 0, out: 0}
      const timelineMap = new Map<string, { in: number; out: number }>();
      for (let h = 0; h < 24; h++) {
        timelineMap.set(this.buildHourSlot(h), { in: 0, out: 0 });
      }

      participants.forEach((p) => {
        if (p.checkInAt) {
          const hourIn = moment(p.checkInAt).hour();
          const slotIn = this.buildHourSlot(hourIn);
          const curIn = timelineMap.get(slotIn);
          if (curIn) {
            curIn.in++;
            timelineMap.set(slotIn, curIn);
          }
        }
        if (p.checkOutAt) {
          const hourOut = moment(p.checkOutAt).hour();
          const slotOut = this.buildHourSlot(hourOut);
          const curOut = timelineMap.get(slotOut);
          if (curOut) {
            curOut.out++;
            timelineMap.set(slotOut, curOut);
          }
        }
      });

      // Convert map => array
      const timeline: TimelinePoint[] = [];
      for (const [timeSlot, data] of timelineMap.entries()) {
        timeline.push({
          timeSlot,
          checkInCount: data.in,
          checkOutCount: data.out,
        });
      }
      // sort theo timeSlot "00:00 - 00:59" => "01:00 - 01:59" ...
      timeline.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

      return { timeline };
    } catch (error) {
      throw handleRpcException(error, 'Fail getParticipationTimeline');
    }
  }

  private buildHourSlot(hour: number): string {
    const hh = hour.toString().padStart(2, '0');
    return `${hh}:00 - ${hh}:59`;
  }

  // 3) Thống kê số participant từng tháng
  async getMonthlyParticipationStats(year: number): Promise<MonthlyParticipationStatsResponse> {
    try {
      const monthlyStats: MonthlyParticipationStat[] = [];

      for (let month = 1; month <= 12; month++) {
        // Giả lập filter theo createdAt ~ [start, end]
        // Tùy logic, code gốc ticket-service hay parse "request.query"
        // => Tại đây ta gắn "from=..., to=..." 
        const start = moment.utc({ year, month: month - 1 }).startOf('month');
        const end = moment(start).endOf('month');

        const allTickets = await lastValueFrom(
          this.ticketService.getAllTicket({
            query: {
              from: start.toISOString(),
              to: end.toISOString(),
              // ... tuỳ code parse filter ...
            },
          }),
        );
        // allTickets?.tickets => mảng ticket
        const tickets = allTickets?.tickets || [];
        const participantCount = tickets.length; 
        // (hoặc) => sum checkIn ?

        monthlyStats.push({
          month,
          participantCount,
        });
      }

      return { monthlyStats };
    } catch (error) {
      throw handleRpcException(error, 'Fail getMonthlyParticipationStats');
    }
  }

  // 4) Phân tích thời điểm check in/out trung bình
  async getCheckInOutTimeAnalysis(eventId: string): Promise<CheckInOutTimeAnalysisResponse> {
    try {
      const res = await lastValueFrom(
        this.ticketService.getParticipantByEventId({ eventId }),
      );
      const participants = res?.participants || [];

      let sumCheckIn = 0, cIn = 0;
      let sumCheckOut = 0, cOut = 0;

      for (const p of participants) {
        if (p.checkInAt) {
          sumCheckIn += new Date(p.checkInAt).getTime();
          cIn++;
        }
        if (p.checkOutAt) {
          sumCheckOut += new Date(p.checkOutAt).getTime();
          cOut++;
        }
      }
      // Tính trung bình -> đổi ms -> phút
      const averageCheckInTimeInMinutes = cIn > 0 ? (sumCheckIn / cIn) / 60000 : 0;
      const averageCheckOutTimeInMinutes = cOut > 0 ? (sumCheckOut / cOut) / 60000 : 0;

      return { averageCheckInTimeInMinutes, averageCheckOutTimeInMinutes };
    } catch (error) {
      throw handleRpcException(error, 'Fail getCheckInOutTimeAnalysis');
    }
  }

  // 5) Tỷ lệ checkIn / checkOut (theo %)
  async getParticipationRate(eventId: string): Promise<ParticipationRateResponse> {
    try {
      const res = await lastValueFrom(
        this.ticketService.getParticipantByEventId({ eventId }),
      );
      const participants = res?.participants || [];
      const total = participants.length;

      if (total === 0) {
        return { checkInRate: 0, checkOutRate: 0 };
      }

      const checkInCount = participants.filter((p) => p.checkInAt).length;
      const checkOutCount = participants.filter((p) => p.checkOutAt).length;

      return {
        checkInRate: (checkInCount / total) * 100,
        checkOutRate: (checkOutCount / total) * 100,
      };
    } catch (error) {
      throw handleRpcException(error, 'Fail getParticipationRate');
    }
  }
}

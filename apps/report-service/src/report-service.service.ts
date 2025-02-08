import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import * as moment from 'moment';

import {
  // Proto messages
  EventParticipationStatsResponse,
  MonthlyParticipationStatsResponse,
  MonthlyParticipationStat,
  ParticipationTimelineResponse,
  TimelinePoint,
  CheckInOutTimeAnalysisResponse,
  ParticipationRateResponse,
  CategoryDistribution,
  EventCategoryDistributionResponse,
} from '../../../libs/common/src/types/report';

import {
  TICKET_SERVICE_PROTO_SERVICE_NAME,
  TicketServiceProtoClient,
  // getAllTicket => AllTicketResponse { tickets: [], meta }
  // getParticipantByEventId => { participants: [...] }
} from '../../../libs/common/src/types/ticket';

import { EVENT_SERVICE, TICKET_SERVICE } from '../../apigateway/src/constants/service.constant';
import { handleRpcException } from '../../../libs/common/src/filters/handleException';
import { EVENT_SERVICE_NAME, EventServiceClient } from '../../../libs/common/src/types/event';

@Injectable()
export class ReportServiceService implements OnModuleInit {
  private ticketService: TicketServiceProtoClient;
  private eventService: EventServiceClient;
  constructor(
    @Inject(TICKET_SERVICE) private readonly ticketServiceClient: ClientGrpc,
    @Inject(EVENT_SERVICE) private readonly eventServiceClient: ClientGrpc,
  ) { }

  onModuleInit() {
    this.ticketService = this.ticketServiceClient.getService<TicketServiceProtoClient>(
      TICKET_SERVICE_PROTO_SERVICE_NAME,
    );
    this.eventService = this.eventServiceClient.getService<EventServiceClient>(
      EVENT_SERVICE_NAME,
    );
  }

  async getUserEventsByDate(
    userId: string,
    year: number,
    month?: number,
  ){
    try {
      // Gọi event service để lấy organized events
      const organizedEventsResponse = await lastValueFrom(
        this.eventService.getOrganizedEvents({ userId, status: undefined }) // Không filter status để lấy tất cả
      );

      // Gọi event service để lấy participated events
      const participatedEventsResponse = await lastValueFrom(
        this.eventService.getParticipatedEvents({ userId, status: undefined }) // Không filter status để lấy tất cả
      );

      let organizedEvents = organizedEventsResponse.events || [];
      let participatedEvents = participatedEventsResponse.events || [];

      const filteredOrganizedEvents = organizedEvents.filter(event => {
        const eventDate = new Date(event.startDate);
        if (month) {
          return eventDate.getFullYear() === year && eventDate.getMonth() + 1 === month;
        }
        return eventDate.getFullYear() === year;
      });

      const filteredParticipatedEvents = participatedEvents.filter(event => {
        const eventDate = new Date(event.startDate);
        if (month) {
          return eventDate.getFullYear() === year && eventDate.getMonth() + 1 === month;
        }
        return eventDate.getFullYear() === year;
      });


      return {
        organizedEvents: filteredOrganizedEvents.map(event => ({ // Map to EventInfo
          id: event.id,
          name: event.name,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          status: event.status,
          categoryId: event.categoryId,
          // ... map các trường cần thiết khác ...
        })),
        participatedEvents: filteredParticipatedEvents.map(event => ({ // Map to EventInfo
          id: event.id,
          name: event.name,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          status: event.status,
          categoryId: event.categoryId,
          // ... map các trường cần thiết khác ...
        })),
      };
    } catch (error) {
      throw handleRpcException(error, 'Failed to get user events by date');
    }
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

  async getEventCategoryDistribution(): Promise<EventCategoryDistributionResponse> {
    try {
      const allCategoriesResponse = await lastValueFrom(
        this.eventService.getAllCategory({ query: {} })
      ) as { categories: any[] };
      const allCategories = allCategoriesResponse.categories;
      const allEvents = await lastValueFrom(
        this.eventService.getAllEvent({ query: {} })
      ).then((res: { events: any[] }) => res.events);

      const categoryCounts: { [categoryName: string]: number } = {};
      allCategories.forEach(cat => categoryCounts[cat.name] = 0);

      allEvents.forEach(event => {
        const categoryName = allCategories.find(cat => cat.id === event.categoryId)?.name || 'Unknown Category';
        categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
      });

      const totalEvents = allEvents.length; // Calculate totalEvents

      const categoryDistribution: CategoryDistribution[] = Object.entries(categoryCounts).map(([type, count]) => ({
        type,
        value: (totalEvents > 0) ? (count / totalEvents) * 100 : 0,
      }));

      return { categoryDistribution, totalEvents };
    } catch (error) {
      throw handleRpcException(error, 'Fail getEventCategoryDistribution');
    }
  }
}

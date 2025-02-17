import { BadRequestException, forwardRef, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { TICKET_SERVICE } from '../constants/service.constant';
import { EventServiceService } from '../event-service/event-service.service';
import { RedisCacheService } from '../redis/redis.service';
import { CheckInCheckOutRequest, CreateParticipationRequest, GetParticipantByEventIdRequest, QueryParamsRequest, TICKET_SERVICE_PROTO_SERVICE_NAME, TicketServiceProtoClient } from '../../../../libs/common/src/types/ticket';
import { handleRpcException } from '../../../../libs/common/src/filters/handleException';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class TicketServiceService {
    private ticketService: TicketServiceProtoClient;

    constructor(
        @Inject(TICKET_SERVICE) private client: ClientGrpc,
        private readonly redisCacheService: RedisCacheService,
        @Inject(forwardRef(() => EventServiceService))
        private readonly eventService: EventServiceService,
    ) { }

    onModuleInit() {
        this.ticketService = this.client.getService<TicketServiceProtoClient>(TICKET_SERVICE_PROTO_SERVICE_NAME);
    }

    async checkInByEventAndUser(request: CheckInCheckOutRequest) {
        try {
            const result = await lastValueFrom(this.ticketService.checkInByEventAndUser(request));
            return result;
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async checkOutByEventAndUser(request: CheckInCheckOutRequest) {
        try {
            const result = await lastValueFrom(this.ticketService.checkOutByEventAndUser(request));
            return result;
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async getCheckInOutStats(request: GetParticipantByEventIdRequest) {
        try {
            const cacheKey = `checkInOutStats:event:${request.eventId}`;
            const cachedData = await this.redisCacheService.get<string>(cacheKey);
            if (cachedData) {
                return cachedData
            }
            const data = await this.ticketService.getCheckInOutStats(request).toPromise();
            await this.redisCacheService.set(cacheKey, JSON.stringify(data));
            return data;
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async getParticipantByEventId(eventId: string) {
        try {
            return await this.ticketService.getParticipantByEventId({ eventId }).toPromise();
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async getParticipantIdByUserIdEventId(request: { userId: string, eventId: string }) { // Function mới
        try {
            return await this.ticketService.getParticipantIdByUserIdEventId(request).toPromise();
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async updateParticipant(request: CreateParticipationRequest) {
        try {
            const res = await this.eventService.isExistEvent(request.eventId);
            if (!res.isExist) {
                throw new RpcException({
                    message: 'Event not found',
                    code: HttpStatus.NOT_FOUND,
                });
            }
            return await this.ticketService.updateParticipant(request).toPromise();
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async deleteParticipant(id: string) {
        try {
            return await this.ticketService.deleteParticipant({ id }).toPromise();
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async createParticipant(request: CreateParticipationRequest) {
        try {
            await this.eventService.isExistEvent(request.eventId);
            return await this.ticketService.createParticipant(request).toPromise();
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async getDetailedParticipantList(request: { eventId: string, query: QueryParamsRequest }) {
        try {
            const cacheKey = `detailedParticipantList:event:${request.eventId}:query:${JSON.stringify(request.query)}`;
            const cachedData = await this.redisCacheService.get<string>(cacheKey);
            if (cachedData) {
                return cachedData;
            }
            const data = await this.ticketService.getDetailedParticipantList(request).toPromise();
            await this.redisCacheService.set(cacheKey, JSON.stringify(data));
            return data;
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async getTicketByParticipantId(participantId: string) { // Function mới
        try {
            return await this.ticketService.getTicketByParticipantId({ participantId }).toPromise();
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async getParticipantByEventAndUser(request: { eventId: string, userId: string }) {
        try {
            return await this.ticketService.getParticipantByEventAndUser(request).toPromise();
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async checkEvent(event: any) {
        try {
            if (event.status === 'CANCELED') {
                throw new RpcException({
                    message: 'Event has been canceled',
                    code: HttpStatus.BAD_REQUEST,
                });
            }
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async getAllTicket(request: { query: { [key: string]: string } }) {
        try {
            return await this.ticketService.getAllTicket(request).toPromise();
        } catch (error) {
            throw new RpcException(error);
        }
    }

    async scanTicket(code: string) {
        try {
            const result = await this.ticketService.scanTicket({ code }).toPromise();
            return result;
        } catch (error) {
            throw new RpcException(error);
        }
    }
}

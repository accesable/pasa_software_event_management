import { BadRequestException, forwardRef, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { TICKET_SERVICE } from '../constants/service.constant';
import { EventServiceService } from '../event-service/event-service.service';
import { RedisCacheService } from '../redis/redis.service';
import { CreateParticipationRequest, TICKET_SERVICE_PROTO_SERVICE_NAME, TicketServiceProtoClient } from '../../../../libs/common/src/types/ticket';
import { handleRpcException } from '../../../../libs/common/src/filters/handleException';

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

    async getParticipantByEventId(eventId: string) {
        try {
            return await this.ticketService.getParticipantByEventId({ eventId }).toPromise();
        } catch (error) {
            throw handleRpcException(error, 'Failed to get participant by event id');
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
            throw handleRpcException(error, 'Failed to update participant');
        }
    }

    async deleteParticipant(id: string) {
        try {
            return await this.ticketService.deleteParticipant({ id }).toPromise();
        } catch (error) {
            throw handleRpcException(error, 'Failed to delete participant');
        }
    }

    async createParticipant(request: CreateParticipationRequest) {
        try {
            await this.eventService.isExistEvent(request.eventId);
            return await this.ticketService.createParticipant(request).toPromise();
        } catch (error) {
            throw handleRpcException(error, 'Failed to create participant');
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
            throw handleRpcException(error, 'Failed to check event');
        }
    }

    async getAllTicket(request: { query: { [key: string]: string } }) {
        try {
            return await this.ticketService.getAllTicket(request).toPromise();
        } catch (error) {
            throw handleRpcException(error, 'Failed to get all ticket');
        }
    }

    async scanTicket(code: string) {
        try {
            const result = await this.ticketService.scanTicket({ code }).toPromise();
            const cacheKey = `event:${result.result.eventId}:checkInOut`;
            const cacheData = await this.redisCacheService.get<any>(cacheKey);
            if(!result.result.checkOutAt){
                if(cacheData){
                    cacheData.push(result.result);
                    await this.redisCacheService.set(cacheKey, JSON.stringify(cacheData));
                }
                else{
                    await this.redisCacheService.set(cacheKey, JSON.stringify([result.result]));
                }
            }
            else{
                if(cacheData){
                    const index = cacheData.findIndex((item: any) => item.id === result.result.id);
                    if(index !== -1){
                        cacheData[index].checkOutAt = result.result.checkOutAt;
                        await this.redisCacheService.set(cacheKey, JSON.stringify(cacheData));
                    }
                }
            }
            const response = await this.redisCacheService.get<string>(`event:${result.result.eventId}:checkInOut`);
            return response;
        } catch (error) {
            throw handleRpcException(error, 'Failed to scan ticket');
        }
    }
}

import { handleRpcException } from '@app/common/filters/handleException';
import { CreateParticipationRequest, TICKET_SERVICE_PROTO_SERVICE_NAME, TicketServiceProtoClient } from '@app/common/types/ticket';
import { BadRequestException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { TICKET_SERVICE } from 'apps/apigateway/src/constants/service.constant';
import { EventServiceService } from 'apps/apigateway/src/event-service/event-service.service';
import { RedisCacheService } from 'apps/apigateway/src/redis/redis.service';

@Injectable()
export class TicketServiceService {
    private ticketService: TicketServiceProtoClient;

    constructor(
        @Inject(TICKET_SERVICE) private client: ClientGrpc,
        private readonly redisCacheService: RedisCacheService,
        private readonly eventService: EventServiceService,
    ) { }

    onModuleInit() {
        this.ticketService = this.client.getService<TicketServiceProtoClient>(TICKET_SERVICE_PROTO_SERVICE_NAME);
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
            throw new RpcException(error);
        }
    }

    async scanTicket(code: string) {
        try {
            return await this.ticketService.scanTicket({ code }).toPromise();
        } catch (error) {
            throw new RpcException(error);
        }
    }
}

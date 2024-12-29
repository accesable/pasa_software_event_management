import { CreateParticipationRequest, TICKET_SERVICE_PROTO_SERVICE_NAME, TicketServiceProtoClient } from '@app/common/types/ticket';
import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { TICKET_SERVICE } from 'apps/apigateway/src/constants/service.constant';
import { RedisCacheService } from 'apps/apigateway/src/redis/redis.service';

@Injectable()
export class TicketServiceService {
    private ticketService: TicketServiceProtoClient;

    constructor(
        @Inject(TICKET_SERVICE) private client: ClientGrpc,
        private readonly redisCacheService: RedisCacheService

    ) { }

    onModuleInit() {
        this.ticketService = this.client.getService<TicketServiceProtoClient>(TICKET_SERVICE_PROTO_SERVICE_NAME);
    }

    async createParticipant(request: CreateParticipationRequest) {
        try {
            return await this.ticketService.createParticipant(request).toPromise();
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
            return await this.ticketService.scanTicket({ code }).toPromise();
        } catch (error) {
            throw new RpcException(error);
        }
    }
}

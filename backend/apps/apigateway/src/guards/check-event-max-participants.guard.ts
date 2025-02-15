import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    BadRequestException,
} from '@nestjs/common';
import { lastValueFrom, Observable } from 'rxjs';
import {
    EventServiceClient,
    EVENT_SERVICE_NAME,
} from '../../../../libs/common/src/types/event';
import { ClientGrpc } from '@nestjs/microservices';
import { EVENT_SERVICE } from '../constants/service.constant';
import { Reflector } from '@nestjs/core';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class CheckEventMaxParticipantsGuard implements CanActivate {
    private eventService: EventServiceClient;

    constructor(
        @Inject(EVENT_SERVICE) private readonly eventClient: ClientGrpc,
        private reflector: Reflector,
    ) { }

    onModuleInit() {
        this.eventService =
            this.eventClient.getService<EventServiceClient>(EVENT_SERVICE_NAME);
    }

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const eventId = request.params.id;

        return this.checkMaxParticipants(eventId);
    }

    private async checkMaxParticipants(eventId: string): Promise<boolean> {
        const metadata = new Metadata();
        metadata.add('Set-Cookie', 'SameSite=None; Secure');

        const event = await lastValueFrom(
            this.eventService.getEventById({ id: eventId }),
        );
        if (!event || !event.event) {
            throw new BadRequestException('Event not found or event data is missing');
        }

        if (event.event.maxParticipants === 0) {
            throw new BadRequestException('Event is full');
        }

        return true;
    }
}
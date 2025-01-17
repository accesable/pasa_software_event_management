import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    BadRequestException,
} from '@nestjs/common';
import { Observable, lastValueFrom } from 'rxjs';
import {
    EventServiceClient,
    EVENT_SERVICE_NAME,
} from '../../../../libs/common/src/types/event';
import { ClientGrpc } from '@nestjs/microservices';
import { EVENT_SERVICE } from '../constants/service.constant';
import { Reflector } from '@nestjs/core';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class CheckEventStatusGuard implements CanActivate {
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
        const allowedStatuses = this.reflector.get<string[]>(
            'allowedStatuses',
            context.getHandler(),
        );

        return this.checkEventStatus(eventId, allowedStatuses);
    }

    private async checkEventStatus(
        eventId: string,
        allowedStatuses: string[],
    ): Promise<boolean> {
        const metadata = new Metadata();
        metadata.add('Set-Cookie', 'SameSite=None; Secure');

        const event = await lastValueFrom(
            this.eventService.getEventById({ id: eventId }),
        );

        if (!event || !event.event) {
            throw new BadRequestException('Event not found or event data is missing');
        }

        const status = event.event.status.toLowerCase();
        const normalizedAllowedStatuses = allowedStatuses.map((s) => s.toLowerCase());
        if (!normalizedAllowedStatuses.includes(status)) {
            switch (status) {
                case 'canceled':
                    throw new BadRequestException('Event is canceled');
                case 'finished':
                    throw new BadRequestException('Event is finished');
                case 'scheduled':
                    throw new BadRequestException('Event is scheduled');
                default:
                    throw new BadRequestException(
                        `Event status is not valid. Allowed statuses are: ${allowedStatuses.join(', ')}`,
                    );
            }
        }

        return true;
    }
}
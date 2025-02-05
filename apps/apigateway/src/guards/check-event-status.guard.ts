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
import { Types } from 'mongoose';

@Injectable()
export class CheckEventStatusGuard implements CanActivate {
    private eventService: EventServiceClient;

    constructor(
        @Inject(EVENT_SERVICE) private readonly eventClient: ClientGrpc,
        private readonly reflector: Reflector,
    ) { }

    onModuleInit() {
        this.eventService =
            this.eventClient.getService<EventServiceClient>(EVENT_SERVICE_NAME);
    }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
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
    ) {

        if (!Types.ObjectId.isValid(eventId)) {
            throw new BadRequestException('Invalid event ID');
        }

        const metadata = new Metadata();
        metadata.add('Set-Cookie', 'SameSite=None; Secure');

        try {
            let eventResponse = await lastValueFrom(
                this.eventService.getEventById({ id: eventId }),
            );
            const status = eventResponse.event.status.toLowerCase();
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
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}

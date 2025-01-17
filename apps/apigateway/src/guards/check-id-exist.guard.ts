import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Observable, lastValueFrom } from 'rxjs';
import {
  EventServiceClient,
  EVENT_SERVICE_NAME,
  EVENT_PACKAGE_NAME,
} from '../../../../libs/common/src/types/event';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { Reflector } from '@nestjs/core';
import {
  EVENT_SERVICE,
  // TICKET_SERVICE,
} from '../constants/service.constant';
import { Metadata } from '@grpc/grpc-js';
import {
  TICKET_PACKAGE_NAME,
  TicketServiceProtoClient,
  TICKET_SERVICE_PROTO_SERVICE_NAME,
} from '../../../../libs/common/src/types/ticket';
import { Types } from 'mongoose';

@Injectable()
export class CheckIdExistGuard implements CanActivate {
  private eventService: EventServiceClient;
  private ticketService: TicketServiceProtoClient;
  constructor(
    @Inject(EVENT_SERVICE) private readonly eventClient: ClientGrpc,
    // @Inject(TICKET_SERVICE)
    // private readonly ticketClient: ClientGrpc,
    private reflector: Reflector,
  ) { }

  onModuleInit() {
    this.eventService =
      this.eventClient.getService<EventServiceClient>(EVENT_SERVICE_NAME);
    // this.ticketService = this.ticketClient.getService<TicketServiceProtoClient>(
    //   TICKET_SERVICE_PROTO_SERVICE_NAME,
    // );
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const id = request.params.id;
    const serviceName = this.reflector.get<string>(
      'serviceName',
      context.getHandler(),
    );

    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid ID');
    }

    const handlerName = context.getHandler().name;
    switch (serviceName) {
      case EVENT_PACKAGE_NAME:
        return this.validateEventId(id);
      case TICKET_PACKAGE_NAME:
        if (handlerName.includes('Ticket')) {
          return this.validateTicketId(id);
        } else if (handlerName.includes('Participant')) {
          return this.validateParticipantId(id);
        }

      default:
        return true; // Hoặc throw lỗi nếu serviceName không hợp lệ
    }
  }

  private async validateEventId(id: string): Promise<boolean> {

    const metadata = new Metadata();
    metadata.add('Set-Cookie', 'SameSite=None; Secure');
    const result = await lastValueFrom(
      this.eventService.isExistEvent({ id }),
    );
    if (result.isExist) {
      return true;
    }
    throw new NotFoundException(`Event with ID ${id} not found`);
  }

  private async validateTicketId(id: string): Promise<boolean> {
    try {
      const metadata = new Metadata();
      metadata.add('Set-Cookie', 'SameSite=None; Secure');

      const result = await lastValueFrom(
        this.ticketService.getTicketById({ id }),
      );
      if (!result) {
        throw new NotFoundException(`Ticket with ID ${id} not found`);
      }
      return true;
    } catch (error) {
      throw new RpcException({
        message: error.details,
        code: error.code,
      });
    }
  }

  private async validateParticipantId(id: string): Promise<boolean> {
    try {
      const metadata = new Metadata();
      metadata.add('Set-Cookie', 'SameSite=None; Secure');

      const result = await lastValueFrom(
        this.ticketService.getParticipantById({ id }),
      );
      if (!result) {
        throw new NotFoundException(`Participant with ID ${id} not found`);
      }
      return true;
    } catch (error) {
      throw new RpcException({
        message: error.details,
        code: error.code,
      });
    }
  }
}
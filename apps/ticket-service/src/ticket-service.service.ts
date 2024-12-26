import { Injectable } from '@nestjs/common';

@Injectable()
export class TicketServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}

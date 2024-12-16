import { Controller } from '@nestjs/common';
import { GuestService } from './guest.service';

@Controller()
export class GuestController {
  constructor(private readonly guestService: GuestService) {}
}

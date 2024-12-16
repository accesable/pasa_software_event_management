import { Controller } from '@nestjs/common';
import { SpeakerService } from './speaker.service';

@Controller()
export class SpeakerController {
  constructor(private readonly speakerService: SpeakerService) {}
}

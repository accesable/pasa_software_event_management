import { Controller } from '@nestjs/common';
import { ReportServiceService } from './report-service.service';

@Controller('report-service')
export class ReportServiceController {
  constructor(private readonly reportServiceService: ReportServiceService) {}
}

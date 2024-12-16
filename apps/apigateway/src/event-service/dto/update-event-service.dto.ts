
import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from 'apps/apigateway/src/event-service/dto/create-event-service.dto';
import {
    IsOptional,
    IsEnum,
} from 'class-validator';

export class UpdateEventDto extends PartialType(CreateEventDto) {
    @IsOptional()
    @IsEnum(['scheduled', 'ongoing', 'canceled', 'finished'], { message: 'Invalid status' })
    status?: string;
}
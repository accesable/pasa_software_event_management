
import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event-service.dto';
import {
    IsOptional,
    IsEnum,
} from 'class-validator';

export class UpdateEventDto extends PartialType(CreateEventDto) {
    @IsOptional()
    @IsEnum(['SCHEDULED', 'CANCELED', 'FINISHED'], { message: 'Invalid status' })
    status?: string;
}
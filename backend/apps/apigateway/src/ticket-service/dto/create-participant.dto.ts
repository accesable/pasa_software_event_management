import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class CreateParticipantDto {
    @IsNotEmpty({ message: 'userId is required' })
    @IsString({ message: 'Name must be string' })
    userId: string;

    @IsNotEmpty({ message: 'eventId is required' })
    @IsString({ message: 'Description must be string' })
    eventId?: string;

    @IsNotEmpty({ message: 'sessionIds is required' })
    @IsArray({ message: 'sessionIds must be array' })
    sessionIds?: string[];
}
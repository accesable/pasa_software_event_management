import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateEventCategoryDto {
    @IsNotEmpty({ message: 'Name is required' })
    @IsString({ message: 'Name must be string' })
    name: string;

    @IsOptional()
    @IsString({ message: 'Description must be string' })
    description?: string;
}
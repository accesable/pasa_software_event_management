import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateGuestDto {
    @IsNotEmpty({ message: 'Name is required' })
    @IsString({ message: 'Name must be string' })
    name: string;

    @IsOptional()
    @IsUrl({}, { message: 'Invalid url' })
    avatar?: string;

    @IsNotEmpty({ message: 'Job title is required' })
    @IsString({ message: 'Job title must be string' })
    jobTitle: string;

    @IsOptional()
    @IsString({ message: 'Organization must be string' })
    organization?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Invalid url' })
    linkSocial?: string;
}
import { PartialType } from "@nestjs/mapped-types";
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateSpeakerDto {
    @IsNotEmpty({ message: 'Name is required' })
    @IsString({ message: 'Name must be string' })
    name: string;

    @IsNotEmpty({ message: 'Bio is required' })
    @IsString({ message: 'Bio must be string' })
    bio: string;

    @IsOptional()
    @IsUrl({}, { message: 'Invalid url' })
    linkFb?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Invalid url' })
    avatar?: string;

    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Invalid email' })
    @IsString()
    email: string;

    @IsOptional()
    @IsString({ message: 'Phone number must be string' })
    phone?: string;

    @IsNotEmpty({ message: 'Job title is required' })
    @IsString({ message: 'Job title must be string' })
    jobTitle: string;
}

export class UpdateSpeakerDto extends PartialType(CreateSpeakerDto) {}
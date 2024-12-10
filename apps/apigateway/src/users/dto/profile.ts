import { OmitType, PartialType } from '@nestjs/mapped-types';
import { RegisterDto } from 'apps/apigateway/src/users/dto/register';
import { IsNotEmpty, IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class ProfileDto extends PartialType(OmitType(RegisterDto, ['email'] as const)) {
    @IsOptional()
    @IsNotEmpty({ message: 'Phone number is required' })
    @IsString()
    @Length(3, 12)
    phoneNumber: string;
}
import { IsArray, IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UserDto {
    @IsEmail({}, { message: 'Email must be a valid email address' })
    @IsNotEmpty({ message: 'Email cannot be empty' })
    email: string;

    @IsString({ message: 'ID must be a string' })
    @IsNotEmpty({ message: 'ID cannot be empty' })
    id: string;
}

export class InviteUsersDto {
    @IsArray({ message: 'Users must be an array' })
    @ValidateNested({ each: true, message: 'Each item in users must be a valid object' })
    @Type(() => UserDto)
    @IsNotEmpty({ message: 'Users array cannot be empty' })
    users: UserDto[];
}

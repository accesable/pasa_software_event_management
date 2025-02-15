import { IsNotEmpty, IsString, Length } from "class-validator";

export class ChangePasswordDto {
    @IsNotEmpty({ message: 'Current password is required' })
    @IsString()
    @Length(6, 50)
    currentPassword: string;

    @IsNotEmpty({ message: 'New password is required' })
    @IsString()
    @Length(6, 50)
    newPassword: string;
}
import { IsEmail, IsNotEmpty, IsString, Length, Max, Min } from 'class-validator';

export class LoginDto {
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Invalid email' })
    @IsString()
    @Length(6, 50)
    email: string;

    @IsNotEmpty({ message: 'Password is required' })
    @IsString()
    @Length(6, 50)
    password: string;
}
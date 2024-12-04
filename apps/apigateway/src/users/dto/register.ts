import { LoginDto } from 'apps/apigateway/src/users/dto/login';
import { IsEmail, IsNotEmpty, IsString, Length, MaxLength, MinLength } from 'class-validator';

export class RegisterDto extends LoginDto {
    @IsNotEmpty({ message: 'Name is required' })
    @IsString()
    @Length(3, 50)
    name: string;
}
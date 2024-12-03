import { LoginDto } from 'apps/apigateway/src/users/dto/login';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto extends LoginDto {
    @IsNotEmpty({ message: 'Name is required' })
    name: string;
}
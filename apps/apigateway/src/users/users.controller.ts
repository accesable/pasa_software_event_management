import { Controller, Get, Post, Body, Param, Delete, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service';
import { ResponseMessage } from 'apps/auth/src/decorators/public.decorator';
import { RegisterDto } from 'apps/apigateway/src/users/dto/register';
import { LoginDto } from 'apps/apigateway/src/users/dto/login';

@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('register')
  @ResponseMessage('User created successfully')
  async register(@Body() registerDto: RegisterDto) {
    return this.usersService.register(registerDto);
  }

  @Post('login')
  @ResponseMessage('User logged in successfully')
  @HttpCode(200)
  login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}

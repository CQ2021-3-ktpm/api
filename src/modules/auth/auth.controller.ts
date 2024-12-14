import { Controller, Post, Body, HttpCode, HttpStatus, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  @UseInterceptors(new TransformInterceptor('User created successfully'))
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.register(createAuthDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseInterceptors(new TransformInterceptor('User logged in successfully'))
  signIn(@Body() createUserDto: CreateUserDto) {
    return this.authService.login(createUserDto);
  }
}

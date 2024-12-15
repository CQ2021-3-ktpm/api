import { PublicRoute } from './../../decorators/public-route.decorator';
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('/api/auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'User already exists',
  })
  @PublicRoute(true)
  @UseInterceptors(new TransformInterceptor('User created successfully'))
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.register(createAuthDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/login')
  @UseInterceptors(new TransformInterceptor('User logged in successfully'))
  signIn(@Body() createUserDto: CreateUserDto) {
    return this.authService.login(createUserDto);
  }
}

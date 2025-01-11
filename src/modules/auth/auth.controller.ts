import { PublicRoute } from '../../decorators';
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  Get,
  Param,
} from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { AuthUser } from 'src/decorators';
import { LoginDto } from './dto/login.dto';

@Controller('/api/v1/auth')
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

  @Get('/verify-email/:token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify user email' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User verified successfully',
  })
  @UseInterceptors(new TransformInterceptor('User verified successfully'))
  verify(@AuthUser() user: User, @Param('token') invitationId: string) {
    return this.authService.verify(user, invitationId);
  }

  @Get('/check-verification')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check user verification' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User verified successfully',
  })
  @UseInterceptors(new TransformInterceptor('User verified successfully'))
  checkVerification(@AuthUser() user: User) {
    return this.authService.checkVerification(user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/login')
  @PublicRoute(true)
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged in successfully',
  })
  @UseInterceptors(new TransformInterceptor('User logged in successfully'))
  signIn(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}

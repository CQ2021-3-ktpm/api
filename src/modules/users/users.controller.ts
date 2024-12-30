import { Controller, Get, UseInterceptors, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { AuthUser } from 'src/decorators';
import { User } from '@prisma/client';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';

@ApiTags('Users')
@Controller('/api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user info' })
  @ApiResponse({
    status: 200,
    description: 'Return all users',
  })
  @UseInterceptors(new TransformInterceptor('Users retrieved successfully'))
  async getUsers(@AuthUser() user: User) {
    return this.usersService.getUserById(user.user_id);
  }

  @Get('/vouchers')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all user vouchers' })
  @ApiResponse({
    status: 200,
    description: 'Return all user vouchers',
  })
  @UseInterceptors(
    new TransformInterceptor('User vouchers retrieved successfully'),
  )
  async getUserVouchers(
    @AuthUser() user: User,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.usersService.getUserVouchers(user.user_id, pageOptionsDto);
  }
}

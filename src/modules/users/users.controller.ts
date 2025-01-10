import { PublicRoute } from './../../decorators/public-route.decorator';
import {
  Controller,
  Get,
  UseInterceptors,
  Query,
  Post,
  Param,
  Body,
} from '@nestjs/common';
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
import { GiftVoucherDto } from './dto/gift-voucher.dto';
import { VoucherFilterDto } from './dto/voucher-filter.dto';
import { SearchUsersDto } from './dto/search-users.dto';

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
    @Query() filterDto: VoucherFilterDto,
  ) {
    return this.usersService.getUserVouchers(
      user.user_id,
      pageOptionsDto,
      filterDto,
    );
  }

  @Get('/search')
  @ApiOperation({ summary: 'Search users' })
  @ApiResponse({
    status: 200,
    description: 'Return searched users',
  })
  @PublicRoute(true)
  @UseInterceptors(new TransformInterceptor('Users retrieved successfully'))
  async searchUsers(@Query() searchDto: SearchUsersDto) {
    return this.usersService.searchUsers(searchDto);
  }

  @Get('/vouchers/:userVoucherId/redeem')
  @ApiOperation({ summary: 'Redeem a voucher' })
  @ApiResponse({
    status: 200,
    description: 'Voucher redeemed successfully',
  })
  @PublicRoute(true)
  @UseInterceptors(new TransformInterceptor('Voucher redeemed successfully'))
  async redeemVoucher(@Param('userVoucherId') userVoucherId: string) {
    return this.usersService.redeemVoucher(userVoucherId);
  }

  @Get('/vouchers/:userVoucherId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user voucher detail' })
  @ApiResponse({
    status: 200,
    description: 'Return user voucher detail',
  })
  @UseInterceptors(
    new TransformInterceptor('User voucher detail retrieved successfully'),
  )
  async getUserVoucherDetail(
    @AuthUser() user: User,
    @Param('userVoucherId') userVoucherId: string,
  ) {
    return this.usersService.getUserVoucherDetail(user.user_id, userVoucherId);
  }

  @Post('/vouchers/gift')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gift a voucher to another user' })
  @ApiResponse({
    status: 201,
    description: 'Voucher gifted successfully',
  })
  @UseInterceptors(new TransformInterceptor('Voucher gifted successfully'))
  async giftVoucher(
    @AuthUser() user: User,
    @Body() giftVoucherDto: GiftVoucherDto,
  ) {
    return this.usersService.giftVoucher(user.user_id, giftVoucherDto);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminService } from '@/modules/admin/admin.service';
import { Roles } from '@/decorators';
import { RoleType } from '@/common/constants';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { CreateAuthDto } from '@/modules/auth/dto/create-auth.dto';
import { CreateBrandDto } from '@/modules/admin/dto/create-brand.dto';
import { GetAllAccountsDto } from './dto/get-all-accounts.dto';

@ApiTags('Admin')
@Controller('/api/v1/admin')
@Roles([RoleType.ADMIN])
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/brand-owner')
  @ApiOperation({ summary: 'Register a new brand account' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Brand owner account created successfully',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Brand owner account already exists',
  })
  @UseInterceptors(
    new TransformInterceptor('Brand owner account created successfully'),
  )
  register(@Body() createAuthDto: CreateAuthDto) {
    return this.adminService.createBrandAccount(createAuthDto);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('/brand')
  @ApiOperation({ summary: 'Onboard new brand' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Brand created successfully',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Brand already exists',
  })
  @UseInterceptors(new TransformInterceptor('Brand created successfully'))
  create(@Body() dto: CreateBrandDto) {
    return this.adminService.onboardNewBrand(dto);
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @Delete('/account/:accountId')
  @ApiOperation({ summary: 'Deactivate account' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Account deactivated',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Account not exists',
  })
  @UseInterceptors(new TransformInterceptor('Account deactivated'))
  deactivateAccount(@Param('accountId') accountId: string) {
    return this.adminService.deactivateAccount(accountId);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/accounts')
  @ApiOperation({ summary: 'List accounts' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account list',
  })
  @ApiBadRequestResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Account not exists',
  })
  @UseInterceptors(new TransformInterceptor('List accounts'))
  getList(@Query() query: GetAllAccountsDto) {
    return this.adminService.listAccounts(query);
  }
}

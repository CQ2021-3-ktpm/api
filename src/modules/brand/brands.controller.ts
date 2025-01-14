import {
  Controller,
  Get,
  UseInterceptors,
  Post,
  Param,
  Body,
  Put,
  Query,
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { AuthUser } from 'src/decorators';
import { User, Brand } from '@prisma/client';
import { CreateBrandDto } from './dto/create-brand.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleType } from 'src/common/constants';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { InsightsDto, InsightsOptions } from './dto/insights.dto';

@ApiTags('Brands')
@Controller('/api/v1/brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  // @Post('/create')
  // @Roles([RoleType.BRAND])
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Create a new brand' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Brand created successfully',
  // })
  // @UseInterceptors(new TransformInterceptor('Brand created successfully'))
  // async createBrand(
  //   @AuthUser() user: User,
  //   @Body() createBrandDto: CreateBrandDto,
  // ) {
  //   return this.brandsService.createBrand(user.user_id, createBrandDto);
  // }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all campaigns for a brand' })
  @ApiResponse({
    status: 200,
    description: 'Return all campaigns for a brand',
  })
  async getCampaignsForBrand(@AuthUser() brand: Brand) {
    return this.brandsService.getCampaignsForBrand(brand.brand_id);
  }

  @Get('/profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get profile brand' })
  @ApiResponse({
    status: 200,
    description: 'Get profile brand',
  })
  async getProfileBrand(@AuthUser() brand: Brand) {
    return this.brandsService.getProfileBrand(brand.brand_id);
  }

  @Get('insights')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get insights for a brand' })
  @ApiResponse({
    status: 200,
    description: 'Return insights for a brand',
  })
  @ApiQuery({
    name: 'option',
    enum: InsightsOptions,
    required: false,
  })
  async getInsights(
    @AuthUser() user: User,
    @Query('option') option?: InsightsOptions,
  ) {
    return this.brandsService.getInsights(user, option);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get brand by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return brand information',
  })
  @UseInterceptors(new TransformInterceptor('Brand retrieved successfully'))
  async getBrand(@Param('id') id: string) {
    return this.brandsService.getBrandById(id);
  }

  @Put(':id')
  @Roles([RoleType.BRAND])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update brand information' })
  @ApiResponse({
    status: 200,
    description: 'Brand updated successfully',
  })
  @UseInterceptors(new TransformInterceptor('Brand updated successfully'))
  async updateBrand(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
    @AuthUser() user: User,
  ) {
    return this.brandsService.updateBrand(id, updateBrandDto, user);
  }
}

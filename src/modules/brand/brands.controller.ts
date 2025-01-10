import {
  Controller,
  Get,
  UseInterceptors,
  Post,
  Param,
  Body,
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { AuthUser } from 'src/decorators';
import { User } from '@prisma/client';
import { CreateBrandDto } from './dto/create-brand.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleType } from 'src/common/constants';

@ApiTags('Brands')
@Controller('/api/v1/brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post('/create')
  @Roles([RoleType.BRAND])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new brand' })
  @ApiResponse({
    status: 201,
    description: 'Brand created successfully',
  })
  @UseInterceptors(new TransformInterceptor('Brand created successfully'))
  async createBrand(
    @AuthUser() user: User,
    @Body() createBrandDto: CreateBrandDto,
  ) {
    return this.brandsService.createBrand(user.user_id, createBrandDto);
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
}

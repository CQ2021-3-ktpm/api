import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Delete,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { PublicRoute } from 'src/decorators';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { GetAllCampaignsDto } from './dto/requests/get-all-campaigns.dto';
import { AddToWishlistDto } from './dto/requests/add-to-wishlist.dto';
import { AuthUser } from 'src/decorators';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { User } from '@prisma/client';
import { CreateCampaignDto } from './dto/requests/create-campaign.dto';

@ApiTags('Campaigns')
@Controller('/api/v1/campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get('/')
  @PublicRoute(true)
  @ApiOperation({
    summary: 'Get all campaigns',
    description:
      'Get campaigns filtered by type (CURRENT/UPCOMING) and category_id. If filters are not specified, returns all campaigns.',
  })
  @ApiResponse({
    status: 200,
    description: 'Return filtered campaigns',
  })
  @UseInterceptors(new TransformInterceptor('Campaigns retrieved successfully'))
  getAll(@Query() getAllCampaignsDto: GetAllCampaignsDto) {
    return this.campaignsService.getCampaigns(getAllCampaignsDto);
  }

  @Get('/wishlist')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user wishlist' })
  @ApiResponse({
    status: 200,
    description: 'Return user wishlist',
  })
  @UseInterceptors(new TransformInterceptor('Wishlist retrieved successfully'))
  async getWishlist(
    @AuthUser() user: User,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return this.campaignsService.getUserWishlist(user.user_id, pageOptionsDto);
  }

  @Get('/categories')
  @PublicRoute(true)
  @ApiOperation({ summary: 'Get all campaign categories' })
  @ApiResponse({
    status: 200,
    description: 'Return all campaign categories',
  })
  @UseInterceptors(
    new TransformInterceptor('Campaign categories retrieved successfully'),
  )
  getAllCategories() {
    return this.campaignsService.getAllCategories();
  }

  @Get('/:id')
  @PublicRoute(true)
  @ApiOperation({ summary: 'Get campaign by id' })
  @ApiResponse({
    status: 200,
    description: 'Return campaign by id',
  })
  @UseInterceptors(new TransformInterceptor('Campaign retrieved successfully'))
  getById(@Param('id') id: string) {
    return this.campaignsService.getCampaignById(id);
  }

  @Post('/wishlist')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add campaign to wishlist' })
  @ApiResponse({
    status: 201,
    description: 'Campaign added to wishlist successfully',
  })
  @UseInterceptors(
    new TransformInterceptor('Campaign added to wishlist successfully'),
  )
  async addToWishlist(
    @AuthUser() user: User,
    @Body() addToWishlistDto: AddToWishlistDto,
  ) {
    return this.campaignsService.addToWishlist(
      user.user_id,
      addToWishlistDto.campaign_id,
    );
  }

  @Delete('/wishlist/:campaignId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove campaign from wishlist' })
  @ApiResponse({
    status: 200,
    description: 'Campaign removed from wishlist successfully',
  })
  @UseInterceptors(
    new TransformInterceptor('Campaign removed from wishlist successfully'),
  )
  async removeFromWishlist(
    @AuthUser() user: User,
    @Param('campaignId') campaignId: string,
  ) {
    return this.campaignsService.removeFromWishlist(user.user_id, campaignId);
  }

  @Post('/')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new campaign' })
  @ApiResponse({
    status: 201,
    description: 'Campaign created successfully',
  })
  @UseInterceptors(new TransformInterceptor('Campaign created successfully'))
  async createCampaign(
    @AuthUser() user: User,
    @Body() createCampaignDto: CreateCampaignDto,
  ) {
    return this.campaignsService.createCampaign(
      user.user_id,
      createCampaignDto,
    );
  }
}

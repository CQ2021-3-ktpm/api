import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { PublicRoute } from 'src/decorators';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { GetAllCampaignsDto } from './dto/get-all-campaigns.dto';

@ApiTags('Campaigns')
@Controller('/api/campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get('/')
  @PublicRoute(true)
  @ApiOperation({ summary: 'Get all campaigns' })
  @ApiResponse({
    status: 200,
    description: 'Return all campaigns',
  })
  @UseInterceptors(new TransformInterceptor('Campaigns retrieved successfully'))
  getAll(@Query() getAllCampaignsDto: GetAllCampaignsDto) {
    return this.campaignsService.getAll(getAllCampaignsDto);
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
}

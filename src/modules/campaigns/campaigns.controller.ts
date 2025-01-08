import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { PublicRoute } from 'src/decorators';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { GetAllCampaignsDto } from './dto/requests/get-all-campaigns.dto';

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
}

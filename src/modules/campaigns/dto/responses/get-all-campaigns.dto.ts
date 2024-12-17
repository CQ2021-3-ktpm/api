import { IsArray } from 'class-validator';
import { GetOverviewCampaignDto } from './get-overview-campaign.dto';

export class GetAllCampaignsResponseDto {
  @IsArray({
    each: true,
    message: 'Campaigns must be an array of GetOverviewCampaignDto',
  })
  campaigns!: GetOverviewCampaignDto[];
}

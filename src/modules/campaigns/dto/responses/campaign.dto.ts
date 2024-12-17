import { DateField, NumberField, StringFieldOptional } from 'src/decorators';
import { GetOverviewCampaignDto } from './get-overview-campaign.dto';

export class CampaignDto extends GetOverviewCampaignDto {
  @StringFieldOptional({
    description: 'The address of the campaign',
    example: '123 Main St, Springfield, IL 62701',
  })
  address?: string;

  @DateField({
    description: 'The end date of the campaign',
    example: new Date(),
  })
  end_date?: Date;

  @NumberField({
    description: 'The voucher quantity of the campaign',
    example: 100,
  })
  quantity?: number;

  @StringFieldOptional({
    description: 'The description of the campaign',
    example: 'This is a campaign description',
  })
  description?: string;

  // Game Info will be added here
}

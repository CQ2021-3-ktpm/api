import {
  DateField,
  NumberField,
  StringField,
  StringFieldOptional,
} from 'src/decorators';

export class GetOverviewCampaignDto {
  @StringField({
    description: 'The id of the campaign',
    example: '1',
  })
  campaign_id!: string;

  @StringField({
    description: 'The id of the brand',
    example: '1',
  })
  brand_id!: string;

  @StringField({
    description: 'The name of the campaign',
    example: 'Christmas campaign',
  })
  name!: string;

  @StringFieldOptional({
    description: 'The image url of the campaign',
    example: 'https://example.com/image.jpg',
  })
  image_url?: string;

  @DateField({
    description: 'The start date of the campaign',
    example: '2024-12-10',
  })
  start_date!: Date;

  @StringField({
    description: 'The name of the brand',
    example: 'Pepsi',
  })
  brand_name!: string;

  @NumberField({
    description: 'The value of the campaign',
    example: '20',
  })
  value!: number;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';

export enum CampaignType {
  CURRENT = 'CURRENT',
  UPCOMING = 'UPCOMING',
}

export class GetAllCampaignsDto extends PageOptionsDto {
  @ApiPropertyOptional({ enum: CampaignType })
  @IsEnum(CampaignType)
  @IsOptional()
  type?: CampaignType;

  @ApiPropertyOptional({
    description: 'Filter campaigns by category ID',
    example: 'category-123',
  })
  @IsString()
  @IsOptional()
  category_id?: string;

  @ApiPropertyOptional({
    description: 'Filter campaigns by brand ID',
    example: 'brand-123',
  })
  @IsString()
  @IsOptional()
  brand_id?: string;
}

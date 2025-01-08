import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddToWishlistDto {
  @ApiProperty({
    description: 'Campaign ID to add to wishlist',
    example: 'campaign-123'
  })
  @IsString()
  @IsNotEmpty()
  campaign_id: string;
} 

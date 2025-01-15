import { IsBoolean, IsOptional, IsString, IsNotEmpty, IsObject } from 'class-validator';

export class CreateGameDto {
  @IsString()
  @IsNotEmpty()
  brand_id: string;

  @IsString()
  @IsNotEmpty()
  campaign_id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  instructions: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsObject()
  @IsNotEmpty()
  metadata: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  item_exchange_enabled?: boolean;
}
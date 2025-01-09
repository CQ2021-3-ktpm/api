import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsDateString,
  IsOptional,
  IsNumber,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';

class VoucherDto {
  @ApiProperty({ example: 100000 })
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ example: 'Valid for all items' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2024-12-31T23:59:59.999Z' })
  @IsDateString()
  @IsNotEmpty()
  expiration_date: Date;
}

export class CreateCampaignDto {
  @ApiProperty({ example: 'Summer Sale 2024' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsString()
  @IsOptional()
  image_url?: string;

  @ApiProperty({ example: '2024-06-01T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  start_date: Date;

  @ApiProperty({ example: '2024-06-30T23:59:59.999Z' })
  @IsDateString()
  @IsNotEmpty()
  end_date: Date;

  @ApiProperty({ example: 'Big summer sale with amazing discounts!' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'category_123' })
  @IsString()
  @IsNotEmpty()
  category_id: string;

  @ApiProperty({ example: ['game1', 'game2'] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  games: string[];

  @ApiProperty({ type: [VoucherDto] })
  @ValidateNested({ each: true })
  @Type(() => VoucherDto)
  @ArrayMinSize(1)
  vouchers: VoucherDto[];
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  ValidateNested,
  IsNumber,
  IsUUID,
} from 'class-validator';

class UpdateVoucherDto {
  @ApiProperty()
  @IsUUID()
  voucher_id: string;

  @ApiProperty()
  @IsNumber()
  value: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsDateString()
  expiration_date: string;
}

class CreateVoucherDto {
  @ApiProperty()
  @IsNumber()
  value: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsDateString()
  expiration_date: string;
}

export class UpdateCampaignDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  image_url?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  end_date?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  category_id?: string;

  @ApiPropertyOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateVoucherDto)
  @IsArray()
  @IsOptional()
  updateVouchers?: UpdateVoucherDto[];

  @ApiPropertyOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateVoucherDto)
  @IsArray()
  @IsOptional()
  createVouchers?: CreateVoucherDto[];

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  deleteVouchers?: string[];
}

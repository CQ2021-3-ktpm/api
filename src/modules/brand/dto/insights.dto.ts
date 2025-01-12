import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

import { IsNotEmpty } from 'class-validator';

export class InsightsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  option: InsightsOptions;
}

export enum InsightsOptions {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

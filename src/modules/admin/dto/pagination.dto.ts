import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Sort criteria',
    example: '["title","ASC"]',
  })
  @IsOptional()
  sort?: string;

  @ApiPropertyOptional({
    description: 'Pagination range',
    example: '[0, 24]',
  })
  @IsOptional()
  range?: string;

  @ApiPropertyOptional({
    description: 'Filter criteria',
    example: '{"title":"bar"}',
  })
  @IsOptional()
  filter?: string;
}

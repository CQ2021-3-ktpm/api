import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetAllAccountsDto {
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
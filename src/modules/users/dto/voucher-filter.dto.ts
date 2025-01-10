import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { VoucherStatus } from '@prisma/client';

export class VoucherFilterDto {
  @ApiPropertyOptional({
    enum: VoucherStatus,
    description: 'Filter by voucher status',
  })
  @IsEnum(VoucherStatus)
  @IsOptional()
  status?: VoucherStatus;

  @ApiPropertyOptional({
    description: 'Filter by expiration date (ISO string)',
    example: '2024-12-31',
  })
  @IsOptional()
  expirationDate?: string;
}

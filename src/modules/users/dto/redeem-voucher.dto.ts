import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RedeemVoucherDto {
  @ApiProperty({
    description: 'Voucher ID to redeem',
    example: 'voucher-123',
  })
  @IsString()
  @IsNotEmpty()
  voucher_id: string;
}

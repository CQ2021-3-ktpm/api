import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class GiftVoucherDto {
  @ApiProperty({
    description: 'User voucher ID to gift',
    example: 'user-voucher-123',
  })
  @IsString()
  @IsNotEmpty()
  user_voucher_id: string;

  @ApiProperty({
    description: 'Email of recipient user',
    example: 'recipient@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  recipient_email: string;
}

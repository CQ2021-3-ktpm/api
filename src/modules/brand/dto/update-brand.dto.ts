import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBrandDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The name of the brand',
    example: 'Nike',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The industry of the brand',
    example: 'Sportswear',
  })
  industry: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The address of the brand',
    example: '123 Nike Street',
  })
  address: string;

  @IsNumber()
  @ApiProperty({
    description: 'The latitude of the brand location',
    example: 10.762622,
  })
  latitude: number;

  @IsNumber()
  @ApiProperty({
    description: 'The longitude of the brand location',
    example: 106.660172,
  })
  longitude: number;
}

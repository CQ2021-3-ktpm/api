import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';

export class SearchUsersDto extends PageOptionsDto {
  @ApiProperty({
    description: 'Search by name, email or phone',
    required: false,
    example: 'john',
  })
  @IsString()
  @IsOptional()
  q?: string;
}

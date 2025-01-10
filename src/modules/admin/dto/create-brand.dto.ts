import { EmailField, NumberField, StringField } from '@/decorators';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateBrandDto {
  @IsEmail()
  @IsNotEmpty()
  @EmailField({
    description: 'The email of the brand owner',
    example: 'cukhoaimon@gmail.com',
  })
  email: string;

  @IsNotEmpty()
  @StringField({
    description: 'The name of the brand',
    example: 'Khoai Mon Inc',
  })
  name: string;

  @IsNotEmpty()
  @StringField({
    description: 'Address of the brand',
    example: '227 NCV',
  })
  address: string;

  @IsNotEmpty()
  @StringField({
    description: 'The industry of the brand',
    example: 'Selling beer',
  })
  industry: string;

  @NumberField({
    description: 'longitude of the brand',
  })
  longitude?: number;

  @NumberField({
    description: 'latitude of the brand',
  })
  latitude?: number;
}

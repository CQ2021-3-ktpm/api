import { IsNotEmpty } from 'class-validator';
import { StringField } from '@/decorators';

export class PromptDto {
  @IsNotEmpty()
  @StringField({
    description: 'Prompt want to akjsdbajksbd',
    example: 'Khoai Mon Inc',
  })
  message: string;
}

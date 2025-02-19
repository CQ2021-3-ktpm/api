import { IsEmail, IsNotEmpty } from 'class-validator';
import {
  EmailField,
  PasswordField,
  StringField,
} from '../../../decorators/field.decorators';

export class CreateUserDto {
  @StringField({
    description: 'The name of the user',
    example: 'Tan Tran',
  })
  name?: string;

  @IsEmail()
  @IsNotEmpty()
  @EmailField({
    description: 'The email of the user',
    example: 'tantran.300803@gmail.com',
  })
  email: string;

  @IsNotEmpty()
  @PasswordField({
    description: 'The password of the user',
    example: 'tandeptrai123',
  })
  password: string;
}

import { IsEmail, IsNotEmpty } from 'class-validator';
import { EmailField, PasswordField } from 'src/decorators';

export class LoginDto {
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

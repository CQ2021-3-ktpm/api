import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
    name?: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    password: string;

    phone_number?: string;
}

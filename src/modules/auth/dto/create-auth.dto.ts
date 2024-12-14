import { IsEmail, IsString, IsNotEmpty, MinLength } from "class-validator";
import { IntersectionType, OmitType } from "@nestjs/mapped-types";
import { CreateUserDto } from "../../users/dto/create-user.dto";

export class CreateAuthDto extends IntersectionType(
    CreateUserDto,
){}

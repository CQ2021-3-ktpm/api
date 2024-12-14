import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users') 
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':email')
  @ApiBearerAuth()
  async findOne(@Param('email') email: string) {
    return this.usersService.findOne(email);
  }

  @Get()
  @ApiBearerAuth()
  async getUsers() {
    return this.usersService.getUsers();
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}

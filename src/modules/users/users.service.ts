import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(email: string): Promise<User | null> {
    if (!email) {
      throw new Error('Email is required');
    }
    
    return this.prisma.user.findUnique({
      where: { email: email },
    });
  }

  async getUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
  

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email: email },
    });
    
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const randomPhoneNumber = uuidv4().replace(/[^0-9]/g, '').slice(0, 10);;

    const newUser = await this.prisma.user.create({
      data: {
          email: createUserDto.email,
          password_hash: createUserDto.password,
          role: 'USER',
          name: createUserDto.name || 'Anonymous',
          phone_number: randomPhoneNumber, 
          gender: 'OTHER',
      },
    });

    return newUser;
  }
}

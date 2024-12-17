import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';

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

  async getUsers(user: User) {
    const result = await this.prisma.user.findUnique({
      where: { user_id: user.user_id },
    });

    if (!result) {
      throw new NotFoundException('User not found');
    }

    return result;
  }

  getUserVouchers(userId: string, pageOptionsDto: PageOptionsDto) {
    const { skip, take, order } = pageOptionsDto;

    const results = this.prisma.userVoucher.findMany({
      where: {
        user_id: userId,
      },
      skip,
      take,
      orderBy: {
        assigned_at: order,
      },
      include: {
        voucher: true,
      },
    });

    return results;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { User } from '@prisma/client';
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

  async getUserById(userId: string) {
    const result = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!result) {
      throw new NotFoundException('User not found');
    }

    return result;
  }

  async getUserVouchers(userId: string, pageOptionsDto: PageOptionsDto) {
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
        voucher: {
          select: {
            value: true,
            description: true,
            expiration_date: true,
            campaign: {
              select: {
                brand: {
                  select: {
                    name: true,
                    address: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return results;
  }
}

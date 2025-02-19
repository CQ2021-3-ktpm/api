import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Prisma, User, VoucherStatus } from '@prisma/client';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { handleError } from 'src/common/utils';
import { generateVoucherCode } from 'src/common/utils/generate-code';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import { GiftVoucherDto } from './dto/gift-voucher.dto';
import { VoucherFilterDto } from './dto/voucher-filter.dto';
import { SearchUsersDto } from './dto/search-users.dto';

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

  async getUserVouchers(
    userId: string,
    pageOptionsDto: PageOptionsDto,
    filterDto: VoucherFilterDto,
  ) {
    try {
      const { skip, take, order, q } = pageOptionsDto;
      const { status, expirationDate } = filterDto;

      const whereCondition: any = {
        user_id: userId,
        ...(status && {
          status,
        }),
        ...(expirationDate && {
          voucher: {
            expiration_date: {
              lte: new Date(expirationDate),
            },
          },
        }),
        ...(q && {
          voucher: {
            campaign: {
              OR: [
                {
                  name: {
                    contains: q,
                    mode: 'insensitive',
                  },
                },
                {
                  brand: {
                    name: {
                      contains: q,
                      mode: 'insensitive',
                    },
                  },
                },
              ],
            },
          },
        }),
      };

      const [userVouchers, total] = await Promise.all([
        this.prisma.userVoucher.findMany({
          where: whereCondition,
          skip: skip,
          take: take,
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
                    name: true,
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
        }),
        this.prisma.userVoucher.count({
          where: whereCondition,
        }),
      ]);

      const pageMetaDto = new PageMetaDto({
        itemCount: total,
        pageOptionsDto,
      });

      const enhancedUserVouchers = userVouchers.map((voucher) => ({
        ...voucher,
        isExpired: voucher.voucher.expiration_date < new Date(),
        daysUntilExpiration: Math.ceil(
          (voucher.voucher.expiration_date.getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        ),
        canBeUsed:
          voucher.status === VoucherStatus.UNUSED &&
          voucher.voucher.expiration_date > new Date(),
      }));

      return {
        data: enhancedUserVouchers,
        meta: pageMetaDto,
      };
    } catch (error) {
      throw handleError(error);
    }
  }

  async redeemVoucher(userVoucherId: string) {
    try {
      // Check if user voucher exists and belongs to the user
      const userVoucher = await this.prisma.userVoucher.findFirst({
        where: {
          user_voucher_id: userVoucherId,
          status: VoucherStatus.UNUSED,
        },
        include: {
          voucher: {
            include: {
              campaign: true,
            },
          },
        },
      });

      if (!userVoucher) {
        throw new NotFoundException('User voucher not found or already used');
      }

      // Check if campaign is still active
      const currentDate = new Date();
      if (
        userVoucher.voucher.campaign.status !== 'ACTIVE' ||
        userVoucher.voucher.campaign.end_date < currentDate
      ) {
        throw new ConflictException('Campaign is not active or has expired');
      }

      // Update user voucher status to USED
      const updatedUserVoucher = await this.prisma.userVoucher.update({
        where: {
          user_voucher_id: userVoucherId,
        },
        data: {
          status: VoucherStatus.USED,
          used_at: new Date(),
        },
        include: {
          voucher: {
            include: {
              campaign: {
                include: {
                  brand: true,
                },
              },
            },
          },
        },
      });

      return updatedUserVoucher;
    } catch (error) {
      throw handleError(error);
    }
  }

  async getUserVoucherDetail(userId: string, userVoucherId: string) {
    try {
      const userVoucher = await this.prisma.userVoucher.findFirst({
        where: {
          user_voucher_id: userVoucherId,
          user_id: userId,
        },
        include: {
          voucher: {
            include: {
              campaign: {
                include: {
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

      if (!userVoucher) {
        throw new NotFoundException('User voucher not found');
      }

      const result = {
        ...userVoucher,
        isExpired: userVoucher.voucher.expiration_date < new Date(),
        daysUntilExpiration: Math.ceil(
          (userVoucher.voucher.expiration_date.getTime() -
            new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        ),
        canBeUsed:
          userVoucher.status === VoucherStatus.UNUSED &&
          userVoucher.voucher.expiration_date > new Date() &&
          userVoucher.voucher.campaign.status === 'ACTIVE',
      };

      return result;
    } catch (error) {
      throw handleError(error);
    }
  }

  async giftVoucher(userId: string, giftVoucherDto: GiftVoucherDto) {
    try {
      const { user_voucher_id, recipient_email } = giftVoucherDto;

      const userVoucher = await this.prisma.userVoucher.findFirst({
        where: {
          user_voucher_id,
          user_id: userId,
          status: VoucherStatus.UNUSED,
        },
        include: {
          voucher: {
            include: {
              campaign: true,
            },
          },
        },
      });

      if (!userVoucher) {
        throw new NotFoundException('User voucher not found or already used');
      }

      // Check if campaign is still valid
      const currentDate = new Date();
      if (
        userVoucher.voucher.campaign.status !== 'ACTIVE' ||
        userVoucher.voucher.campaign.end_date < currentDate
      ) {
        throw new ConflictException('Campaign is not active or has expired');
      }

      // Check if recipient exists
      const recipient = await this.findOne(recipient_email);
      if (!recipient) {
        throw new NotFoundException('Recipient not found');
      }

      // Check if recipient already has this voucher
      const existingRecipientVoucher = await this.prisma.userVoucher.findFirst({
        where: {
          user_id: recipient.user_id,
          voucher_id: userVoucher.voucher_id,
        },
      });

      if (existingRecipientVoucher) {
        throw new ConflictException('Recipient already has this voucher');
      }

      // Execute transaction to transfer voucher
      return await this.prisma.$transaction(async (tx) => {
        // Update old user voucher status
        await tx.userVoucher.update({
          where: {
            user_voucher_id,
          },
          data: {
            status: VoucherStatus.USED,
            used_at: new Date(),
          },
        });

        // Create new user voucher for recipient
        const newUserVoucher = await tx.userVoucher.create({
          data: {
            user_id: recipient.user_id,
            voucher_id: userVoucher.voucher_id,
            code: generateVoucherCode(),
            status: VoucherStatus.UNUSED,
          },
          include: {
            voucher: {
              include: {
                campaign: {
                  include: {
                    brand: true,
                  },
                },
              },
            },
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        });

        // Có thể thêm notification hoặc gửi email thông báo cho recipient ở đây

        return {
          message: 'Voucher gifted successfully',
          recipient: {
            email: recipient.email,
            name: recipient.name,
          },
          voucher: {
            code: newUserVoucher.code,
            campaign_name: newUserVoucher.voucher.campaign.name,
            brand_name: newUserVoucher.voucher.campaign.brand.name,
            value: newUserVoucher.voucher.value,
          },
        };
      });
    } catch (error) {
      throw handleError(error);
    }
  }

  async searchUsers(searchDto: SearchUsersDto) {
    try {
      const { q } = searchDto;
      const skip = Number(searchDto.skip) || 0;
      const take = Number(searchDto.take) || 10;

      const whereCondition = {
        role: 'USER',
        ...(q && {
          OR: [
            {
              name: {
                contains: q,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: q,
                mode: 'insensitive',
              },
            },
            {
              phone_number: {
                contains: q,
                mode: 'insensitive',
              },
            },
          ],
        }),
      };

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where: whereCondition as Prisma.UserWhereInput,
          select: {
            user_id: true,
            name: true,
            email: true,
            phone_number: true,
            avatar_url: true,
            created_at: true,
          },
          skip,
          take,
          orderBy: {
            created_at: 'desc',
          },
        }),
        this.prisma.user.count({
          where: whereCondition as Prisma.UserWhereInput,
        }),
      ]);

      const pageMetaDto = new PageMetaDto({
        itemCount: total,
        pageOptionsDto: searchDto,
      });

      return {
        data: users,
        meta: pageMetaDto,
      };
    } catch (error) {
      throw handleError(error);
    }
  }
}

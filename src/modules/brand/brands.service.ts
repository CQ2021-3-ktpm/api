import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Brand, User } from '@prisma/client';

import { handleError } from 'src/common/utils';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { InsightsDto, InsightsOptions } from './dto/insights.dto';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  async createBrand(
    userId: string,
    createBrandDto: CreateBrandDto,
  ): Promise<Brand> {
    try {
      return await this.prisma.brand.create({
        data: {
          ...createBrandDto,
          user_id: userId,
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async getBrandById(brandId: string): Promise<Brand> {
    const brand = await this.prisma.brand.findUnique({
      where: { brand_id: brandId },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand;
  }

  async getCampaignsForBrand(brand_id: string) {
    const brandWithCampaigns = await this.prisma.brand.findMany({
      where: {
        user_id: brand_id,
      },
      include: {
        campaigns: {
          where: {
            brand_id: brand_id,
          },
        },
      },
    });

    return {
      campaigns: brandWithCampaigns[0].campaigns,
      total: brandWithCampaigns[0].campaigns.length,
    };
  }

  async listAll() {
    return this.prisma.brand.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });
  }

  async listByNames(names: string[]) {
    return this.prisma.brand.findMany({
      where: {
        name: {
          in: names,
        },
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });
  }

  async updateBrand(
    brandId: string,
    updateBrandDto: UpdateBrandDto,
    user: User,
  ): Promise<Brand> {
    const brand = await this.getBrandById(brandId);

    if (brand.user_id !== user.user_id) {
      throw new ForbiddenException(
        'You are not authorized to update this brand',
      );
    }

    try {
      return await this.prisma.brand.update({
        where: { brand_id: brandId },
        data: updateBrandDto,
      });
    } catch (error) {
      handleError(error);
    }
  }

  async getInsights(user: User, option: InsightsOptions) {
    const brand = await this.prisma.brand.findFirst({
      where: {
        user_id: user.user_id,
      },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    let startDate: Date;
    switch (option) {
      case InsightsOptions.DAY:
        startDate = new Date(new Date().setDate(new Date().getDate() - 1));
        break;
      case InsightsOptions.WEEK:
        startDate = new Date(new Date().setDate(new Date().getDate() - 7));
        break;
      case InsightsOptions.MONTH:
        startDate = new Date(new Date().setMonth(new Date().getMonth() - 1));
        break;
      case InsightsOptions.YEAR:
        startDate = new Date(
          new Date().setFullYear(new Date().getFullYear() - 1),
        );
        break;
      default:
        startDate = new Date(new Date().setDate(new Date().getDate() - 1));
        break;
    }

    const campaigns = await this.prisma.campaign.findMany({
      where: {
        brand_id: brand.brand_id,
        created_at: {
          gte: startDate,
        },
      },
    });

    const games = await this.prisma.game.count({
      where: {
        brand_id: brand.brand_id,
        created_at: {
          gte: startDate,
        },
      },
    });

    const vouchers = await this.prisma.voucher.findMany({
      where: {
        campaign_id: {
          in: campaigns.map((campaign) => campaign.campaign_id),
        },
        created_at: {
          gte: startDate,
        },
      },
    });

    const releases_voucher = vouchers.reduce((acc, voucher) => {
      return acc + voucher.quantity;
    }, 0);

    const used_voucher = await this.prisma.userVoucher.count({
      where: {
        voucher_id: {
          in: campaigns.map((campaign) => campaign.campaign_id),
        },
        used_at: {
          gte: startDate,
        },
      },
    });

    return {
      campaigns: campaigns.length,
      games,
      releases_voucher,
      used_voucher,
    };
  }
}

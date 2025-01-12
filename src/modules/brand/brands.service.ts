import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Brand, User } from '@prisma/client';

import { handleError } from 'src/common/utils';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

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
}

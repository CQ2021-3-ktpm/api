import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Brand } from '@prisma/client';

import { handleError } from 'src/common/utils';
import { CreateBrandDto } from './dto/create-brand.dto';

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
}

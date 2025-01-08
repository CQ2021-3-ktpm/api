import { handleError } from 'src/common/utils';
import { PrismaService } from 'nestjs-prisma';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { GetAllCampaignsDto } from './dto/requests/get-all-campaigns.dto';
import { CampaignType } from './dto/requests/get-all-campaigns.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCategories() {
    try {
      const categories = await this.prisma.category.findMany();

      const filteredCategories = categories.map((category) => {
        const { created_at, updated_at, ...rest } = category;
        return rest;
      });

      return filteredCategories;
    } catch (error) {
      throw handleError(error);
    }
  }

  async getCampaigns(getAllCampaignsDto: GetAllCampaignsDto) {
    try {
      const { skip, take, q, type, category_id } = getAllCampaignsDto;
      const currentDate = new Date();

      const whereCondition = {
        status: 'ACTIVE',
        OR: [
          {
            brand: {
              name: {
                contains: q,
                mode: 'insensitive',
              },
            },
          },
          {
            name: {
              contains: q,
              mode: 'insensitive',
            },
          },
        ],
        // Filter by campaign type
        ...(type === CampaignType.CURRENT && {
          start_date: { lte: currentDate },
          end_date: { gte: currentDate },
        }),
        ...(type === CampaignType.UPCOMING && {
          start_date: { gt: currentDate },
        }),
        // Filter by category_id if provided
        ...(category_id && {
          category_id: category_id,
        }),
      };

      const campaigns = await this.prisma.campaign.findMany({
        skip,
        take,
        where: whereCondition as Prisma.CampaignWhereInput,
        include: {
          brand: {
            select: {
              name: true,
            },
          },
          vouchers: {
            orderBy: {
              value: 'asc',
            },
            select: {
              value: true,
            },
          },
          Category: {
            select: {
              name: true,
            },
          },
        },
      });

      const filteredCampaigns = {
        campaigns: campaigns.flatMap((campaign) => {
          const { brand, vouchers, Category, ...rest } = campaign;
          return {
            ...rest,
            brand_name: brand.name,
            category_name: Category?.name,
            values: vouchers.map((voucher) => voucher.value),
          };
        }),
      };

      const pageMetaDto = new PageMetaDto({
        itemCount: campaigns.length,
        pageOptionsDto: getAllCampaignsDto,
      });

      return { filteredCampaigns, pageMetaDto };
    } catch (error) {
      throw handleError(error);
    }
  }

  async getCampaignById(id: string) {
    try {
      const campaign = await this.prisma.campaign.findUnique({
        where: {
          campaign_id: id,
        },
        include: {
          brand: true,
          vouchers: true,
        },
      });

      if (!campaign) {
        throw new NotFoundException('Campaign not found');
      }

      return campaign;
    } catch (error) {
      throw handleError(error);
    }
  }
}

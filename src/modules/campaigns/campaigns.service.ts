import { handleError } from 'src/common/utils';
import { PrismaService } from 'nestjs-prisma';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { GetAllCampaignsDto } from './dto/requests/get-all-campaigns.dto';

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
      const { skip, take, q } = getAllCampaignsDto;

      const campaigns = await this.prisma.campaign.findMany({
        skip,
        take,
        where: {
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
        },
        include: {
          brand: {
            select: {
              name: true,
            },
          },
          vouchers: {
            orderBy: { created_at: 'asc' },
            select: {
              value: true,
            },
          },
        },
      });

      const filteredCampaigns = {
        campaigns: campaigns.flatMap((campaign) => {
          const { brand, vouchers, ...rest } = campaign;
          return {
            ...rest,
            brand_name: brand.name,
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

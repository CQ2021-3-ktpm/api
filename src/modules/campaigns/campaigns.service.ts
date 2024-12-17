import { handleError } from 'src/common/utils';
import { GetAllCampaignsDto } from './dto/requests/get-all-campaigns.dto';
import { PrismaService } from 'nestjs-prisma';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { GetAllCampaignsResponseDto } from './dto/responses/get-all-campaigns.dto';
import { SearchCampaignsDto } from './dto/requests/search-campaigns.dto';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(getAllCampaignsDto: GetAllCampaignsDto) {
    try {
      const { skip, take } = getAllCampaignsDto;

      const campaigns = await this.prisma.campaign.findMany({
        where: {
          status: 'ACTIVE',
        },
        include: {
          brand: {
            select: {
              name: true,
            },
          },
          vouchers: {
            skip,
            take,
            select: {
              value: true,
            },
          },
        },
      });

      const filteredCampaigns: GetAllCampaignsResponseDto = {
        campaigns: campaigns.flatMap((campaign) => {
          const { brand, vouchers, ...rest } = campaign;
          return vouchers.map((voucher) => ({
            ...rest,
            brand_name: brand.name,
            value: voucher.value,
          }));
        }),
      };

      const pageMetaDto = new PageMetaDto({
        itemCount: filteredCampaigns.campaigns.length,
        pageOptionsDto: getAllCampaignsDto,
      });

      return { filteredCampaigns, pageMetaDto };
    } catch (error) {
      throw handleError(error);
    }
  }

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

  async search(searchCampaignsDto: SearchCampaignsDto) {
    try {
      const { skip, take, q } = searchCampaignsDto;

      const campaigns = await this.prisma.campaign.findMany({
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
            skip,
            take,
            select: {
              value: true,
            },
          },
        },
      });

      const filteredCampaigns: GetAllCampaignsResponseDto = {
        campaigns: campaigns.flatMap((campaign) => {
          const { brand, vouchers, ...rest } = campaign;
          return vouchers.map((voucher) => ({
            ...rest,
            brand_name: brand.name,
            value: voucher.value,
          }));
        }),
      };

      const pageMetaDto = new PageMetaDto({
        itemCount: filteredCampaigns.campaigns.length,
        pageOptionsDto: searchCampaignsDto,
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

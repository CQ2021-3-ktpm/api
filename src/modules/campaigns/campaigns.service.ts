import { handleError } from 'src/common/utils';
import { PrismaService } from 'nestjs-prisma';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  GetAllCampaignsDto,
  CampaignType,
} from './dto/requests/get-all-campaigns.dto';
import { Prisma } from '@prisma/client';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';

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

  async addToWishlist(userId: string, campaignId: string) {
    try {
      // Kiểm tra campaign có tồn tại và là upcoming campaign
      const campaign = await this.prisma.campaign.findFirst({
        where: {
          campaign_id: campaignId,
          status: 'ACTIVE',
          start_date: {
            gt: new Date(),
          },
        },
      });

      if (!campaign) {
        throw new NotFoundException('Campaign not found or not upcoming');
      }

      // Thêm vào wishlist
      const wishlist = await this.prisma.campaignWishlist.create({
        data: {
          user_id: userId,
          campaign_id: campaignId,
        },
        include: {
          campaign: {
            include: {
              brand: {
                select: {
                  name: true,
                },
              },
              Category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return wishlist;
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Campaign already in wishlist');
      }
      throw handleError(error);
    }
  }

  async removeFromWishlist(userId: string, campaignId: string) {
    try {
      const wishlist = await this.prisma.campaignWishlist.delete({
        where: {
          user_id_campaign_id: {
            user_id: userId,
            campaign_id: campaignId,
          },
        },
      });

      return wishlist;
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException('Campaign not found in wishlist');
      }
      throw handleError(error);
    }
  }

  async getUserWishlist(userId: string, pageOptionsDto: PageOptionsDto) {
    try {
      const { skip, take } = pageOptionsDto;

      const wishlists = await this.prisma.campaignWishlist.findMany({
        where: {
          user_id: userId,
        },
        skip: skip,
        take: take,
        include: {
          campaign: {
            include: {
              brand: {
                select: {
                  name: true,
                },
              },
              Category: {
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
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      const filteredWishlists = wishlists.map(({ campaign, ...rest }) => {
        const { brand, vouchers, Category, ...campaignRest } = campaign;
        return {
          ...rest,
          campaign: {
            ...campaignRest,
            brand_name: brand.name,
            category_name: Category?.name,
            values: vouchers.map((v) => v.value),
          },
        };
      });

      const pageMetaDto = new PageMetaDto({
        itemCount: wishlists.length,
        pageOptionsDto,
      });

      return { wishlists: filteredWishlists, pageMetaDto };
    } catch (error) {
      throw handleError(error);
    }
  }

  async checkWishlist(userId: string, campaignId: string) {
    try {
      const wishlistItem = await this.prisma.campaignWishlist.findUnique({
        where: {
          user_id_campaign_id: {
            user_id: userId,
            campaign_id: campaignId,
          },
        },
        include: {
          campaign: {
            select: {
              name: true,
              brand: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return {
        isInWishlist: !!wishlistItem,
        campaign: wishlistItem?.campaign,
      };
    } catch (error) {
      throw handleError(error);
    }
  }
}

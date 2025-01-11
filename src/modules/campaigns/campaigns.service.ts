import { handleError } from 'src/common/utils';
import { PrismaService } from 'nestjs-prisma';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import {
  GetAllCampaignsDto,
  CampaignType,
} from './dto/requests/get-all-campaigns.dto';
import { Prisma } from '@prisma/client';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { CreateCampaignDto } from './dto/requests/create-campaign.dto';
import { UpdateCampaignDto } from './dto/requests/update-campaign.dto';

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

  async createCampaign(userId: string, createCampaignDto: CreateCampaignDto) {
    try {
      // Check if user has a brand
      const brand = await this.prisma.brand.findFirst({
        where: {
          user_id: userId,
          status: 'ACTIVE',
        },
      });

      if (!brand) {
        throw new ForbiddenException('User does not have an active brand');
      }

      // Validate dates
      const startDate = new Date(createCampaignDto.start_date);
      const endDate = new Date(createCampaignDto.end_date);
      const now = new Date();

      if (startDate <= now) {
        throw new ForbiddenException('Start date must be in the future');
      }

      if (endDate <= startDate) {
        throw new ForbiddenException('End date must be after start date');
      }

      // Create campaign with vouchers and games in a transaction
      const campaign = await this.prisma.$transaction(async (prisma) => {
        const newCampaign = await prisma.campaign.create({
          data: {
            brand_id: brand.brand_id,
            name: createCampaignDto.name,
            image_url: createCampaignDto.image_url,
            start_date: startDate,
            end_date: endDate,
            description: createCampaignDto.description,
            category_id: createCampaignDto.category_id,
            games: createCampaignDto.games,
          },
        });

        // Create vouchers for the campaign
        await prisma.voucher.createMany({
          data: createCampaignDto.vouchers.map((voucher) => ({
            campaign_id: newCampaign.campaign_id,
            value: voucher.value,
            quantity: voucher.quantity,
            description: voucher.description,
            expiration_date: new Date(voucher.expiration_date),
          })),
        });

        // Create games for the campaign
        if (createCampaignDto.games && createCampaignDto.games.length > 0) {
          await prisma.game.createMany({
            data: createCampaignDto.games.map((gameName) => ({
              brand_id: brand.brand_id,
              campaign_id: newCampaign.campaign_id,
              name: `${newCampaign.name} - ${gameName}`,
              type: gameName,
              metadata: null,
              instructions: 'Default game instructions', // You might want to make this configurable
            })),
          });
        }

        return newCampaign;
      });

      return campaign;
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

  async deleteCampaign(userId: string, campaignId: string) {
    try {
      // Check if campaign exists and belongs to user's brand
      console.log(userId, campaignId);
      const campaign = await this.prisma.campaign.findFirst({
        where: {
          campaign_id: campaignId,
          brand: {
            user_id: userId,
            status: 'ACTIVE',
          },
        },
      });

      if (!campaign) {
        throw new NotFoundException('Campaign not found or unauthorized');
      }

      // Update campaign status to INACTIVE
      const updatedCampaign = await this.prisma.campaign.update({
        where: {
          campaign_id: campaignId,
        },
        data: {
          status: 'INACTIVE',
        },
      });

      return updatedCampaign;
    } catch (error) {
      throw handleError(error);
    }
  }

  async updateCampaign(
    userId: string,
    campaignId: string,
    updateCampaignDto: UpdateCampaignDto,
  ) {
    try {
      // Check if campaign exists and belongs to user's brand
      const campaign = await this.prisma.campaign.findFirst({
        where: {
          campaign_id: campaignId,
          brand: {
            user_id: userId,
            status: 'ACTIVE',
          },
        },
        include: {
          vouchers: true,
        },
      });

      if (!campaign) {
        throw new NotFoundException('Campaign not found or unauthorized');
      }

      // Validate dates if provided
      if (updateCampaignDto.start_date || updateCampaignDto.end_date) {
        const startDate = new Date(
          updateCampaignDto.start_date || campaign.start_date,
        );
        const endDate = new Date(
          updateCampaignDto.end_date || campaign.end_date,
        );
        const now = new Date();

        if (startDate <= now) {
          throw new ForbiddenException('Start date must be in the future');
        }

        if (endDate <= startDate) {
          throw new ForbiddenException('End date must be after start date');
        }
      }

      // Update campaign and handle vouchers in a transaction
      const updatedCampaign = await this.prisma.$transaction(async (prisma) => {
        // Update campaign details
        const updated = await prisma.campaign.update({
          where: {
            campaign_id: campaignId,
          },
          data: {
            name: updateCampaignDto.name,
            image_url: updateCampaignDto.image_url,
            start_date:
              updateCampaignDto.start_date &&
              new Date(updateCampaignDto.start_date),
            end_date:
              updateCampaignDto.end_date &&
              new Date(updateCampaignDto.end_date),
            description: updateCampaignDto.description,
            category_id: updateCampaignDto.category_id,
          },
        });

        // Handle voucher updates
        if (updateCampaignDto.updateVouchers?.length) {
          await Promise.all(
            updateCampaignDto.updateVouchers.map((voucher) =>
              prisma.voucher.update({
                where: { voucher_id: voucher.voucher_id },
                data: {
                  value: voucher.value,
                  quantity: voucher.quantity,
                  description: voucher.description,
                  expiration_date: new Date(voucher.expiration_date),
                },
              }),
            ),
          );
        }

        // Handle voucher creations
        if (updateCampaignDto.createVouchers?.length) {
          await prisma.voucher.createMany({
            data: updateCampaignDto.createVouchers.map((voucher) => ({
              campaign_id: campaignId,
              value: voucher.value,
              quantity: voucher.quantity,
              description: voucher.description,
              expiration_date: new Date(voucher.expiration_date),
            })),
          });
        }

        // Handle voucher deletions (set expiration_date to yesterday)
        if (updateCampaignDto.deleteVouchers?.length) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          await prisma.voucher.updateMany({
            where: {
              voucher_id: {
                in: updateCampaignDto.deleteVouchers,
              },
            },
            data: {
              expiration_date: yesterday,
            },
          });
        }

        return updated;
      });

      return updatedCampaign;
    } catch (error) {
      throw handleError(error);
    }
  }
}

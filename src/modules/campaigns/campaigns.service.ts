import { handleError } from 'src/common/utils';
import { GetAllCampaignsDto } from './dto/get-all-campaigns.dto';
import { PrismaService } from 'nestjs-prisma';
import { PageMetaDto } from 'src/common/dto/page-meta.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(getAllCampaignsDto: GetAllCampaignsDto) {
    try {
      const { skip, take } = getAllCampaignsDto;

      console.log('skip', skip);
      console.log('take', take);

      const campaigns = await this.prisma.campaign.findMany({
        skip,
        take,
        where: {
          status: 'ACTIVE',
        },
      });

      const pageMetaDto = new PageMetaDto({
        itemCount: campaigns.length,
        pageOptionsDto: getAllCampaignsDto,
      });

      return { campaigns, pageMetaDto };
    } catch (error) {
      throw handleError(error);
    }
  }
}

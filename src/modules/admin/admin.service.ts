import { PrismaService } from 'nestjs-prisma';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { MailService } from '@/modules/auth/services/mail.service';
import { CreateBrandDto } from '@/modules/admin/dto/create-brand.dto';
import { Role, Status } from '@prisma/client';
import { PaginationDto } from './dto/pagination.dto';
import { LlmService, PromptMailResponse } from '@/modules/llm/llm.service';
import { PromptDto } from '@/modules/admin/dto/prompt-dto';
import { Queue } from 'bullmq';
import { JobName, QueueName } from '@/modules/queue/queue.consumer';
import { InjectQueue } from '@nestjs/bullmq';
import { SendEmailsPayload } from '@/modules/queue/payloads/send-emails.payload';
import { BrandsService } from '@/modules/brand/brands.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly mailService: MailService,
    private readonly llmService: LlmService,
    private readonly prisma: PrismaService,
    private readonly brandsService: BrandsService,
    @InjectQueue(QueueName.Default)
    private readonly defaultQueue: Queue<SendEmailsPayload>,
  ) {}

  async createBrandAccount(dto: CreateUserDto) {
    const { email, password, name } = dto;

    return this.prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new BadRequestException('User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await tx.user.create({
        data: {
          email,
          password_hash: hashedPassword,
          name,
          role: Role.BRAND,
        },
      });

      const invitation = await tx.invitation.create({
        data: {
          email,
          user_id: newUser.user_id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      const link = `${process.env.NEXT_PUBLIC_API_URL}/confirm-email?token=${invitation.invitation_id}`;
      await this.mailService.sendSignInEmail(newUser.email, link);

      return {
        ...newUser,
        id: newUser.user_id,
      };
    });
  }

  async onboardNewBrand(dto: CreateBrandDto) {
    const { email, name, address, industry, latitude, longitude } = dto;

    return this.prisma.$transaction(async (tx) => {
      const owner = await tx.user.findUnique({
        where: { email },
      });

      if (!owner) {
        throw new BadRequestException('User not exists');
      }

      return tx.brand.create({
        data: {
          name,
          address,
          industry,
          latitude,
          longitude,
          user_id: owner.user_id,
        },
      });
    });
  }

  async deactivateAccount(accountId: string) {
    return this.prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { user_id: accountId },
      });

      if (!existingUser) {
        throw new BadRequestException('User not exists');
      }

      return tx.user.update({
        where: { user_id: accountId },
        data: { status: Status.INACTIVE },
      });
    });
  }

  async listAccounts(query: PaginationDto) {
    const { sort, range, filter } = query;

    const [offset, limit] = range ? JSON.parse(range) : [0, 10];
    const whereCondition = filter ? JSON.parse(filter) : {};

    const accounts = await this.prisma.user.findMany({
      where: { status: Status.ACTIVE },
      skip: offset,
      take: limit,
    });

    return {
      accounts,
      total: accounts.length,
    };
  }

  async listBrand(query: PaginationDto) {
    const { sort, range, filter } = query;

    const [offset, limit] = range ? JSON.parse(range) : [0, 10];

    const brands = await this.prisma.brand.findMany({
      where: { status: Status.ACTIVE },
      skip: offset,
      take: limit,
    });

    return {
      brands: brands,
      total: brands.length,
    };
  }

  async processMessage(dto: PromptDto) {
    this.logger.log('INFO: processing llm message');
    this.llmService
      .prompt(dto.message)
      .then(async (response: PromptMailResponse) => {
        this.logger.log('INFO: done processing llm message');

        const payload = response;

        if (payload.recipients[0] === 'all') {
          const brands = await this.brandsService.listAll();
          payload['recipients'] = brands.map((brand) => brand.user.email);
        } else {
          const brands = await this.brandsService.listByNames(
            response.recipients,
          );
          payload['recipients'] = brands.map((brand) => brand.user.email);
        }

        this.logger.log(`INFO: attempt to send job to queue with payloads`);
        this.logger.log(payload.recipients);
        await this.defaultQueue.add(JobName.SendEmail, response);
      });

    return {
      message: 'ok',
    };
  }
}

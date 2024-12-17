import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuthDto } from './../dto/create-auth.dto';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MailService } from './mail.service';
import { PrismaService } from 'nestjs-prisma';
import { User } from '@prisma/client';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  async register(createAuthDto: CreateAuthDto) {
    const { email, password, name } = createAuthDto;

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
        access_token: await this.jwtService.signAsync(newUser),
        email: newUser.email,
      };
    });
  }

  async verify(user: User, invitationId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { invitation_id: invitationId },
    });

    if (!invitation || invitation.email !== user.email) {
      throw new UnauthorizedException('Invalid invitation');
    }

    if (invitation.expiresAt < new Date()) {
      throw new UnauthorizedException('Invitation expired');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { user_id: invitation.user_id },
        data: { is_verified: true },
      });

      await tx.invitation.update({
        where: { invitation_id: invitationId },
        data: { status: 'ACCEPTED' },
      });
    });

    return {
      message: 'User verified successfully',
    };
  }

  async checkVerification(user: User) {
    return {
      is_verified: user.is_verified,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOne(loginDto.email);

    if (!user) {
      throw new NotFoundException('Invalid email');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new NotFoundException('Invalid password');
    }

    return {
      access_token: await this.jwtService.signAsync(user),
      email: user.email,
      s,
    };
  }
}

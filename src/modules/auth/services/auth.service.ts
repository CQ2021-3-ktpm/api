import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { CreateAuthDto } from './../dto/create-auth.dto';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MailService } from './mail.service';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  async register(createAuthDto: CreateAuthDto) {
    const { email, password, name, phone_number } = createAuthDto;

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
          phone_number,
        },
      });

      const invitation = await tx.invitation.create({
        data: {
          email,
          user_id: newUser.user_id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      const link = `${process.env.NEXT_PUBLIC_API_URL}/auth/sign-in?id=${invitation.invitation_id}`;
      await this.mailService.sendSignInEmail(newUser.email, link);

      return { ...newUser };
    });
  }

  async login(createUserDto: CreateUserDto) {
    const user = await this.usersService.findOne(createUserDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      createUserDto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      access_token: await this.jwtService.signAsync(user),
      email: user.email,
    };
  }
}

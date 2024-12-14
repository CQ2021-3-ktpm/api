import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { MailService } from './services/mail.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, MailService],
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1h' },
        global: true,
      }),
    }),
  ],
  exports: [MailService],
})
export class AuthModule {}

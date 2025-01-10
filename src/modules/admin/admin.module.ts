import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MailService } from '@/modules/auth/services/mail.service';
import { UsersModule } from '@/modules/users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [AdminService, MailService],
  controllers: [AdminController],
  exports: [AdminService],
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
})
export class AdminModule {}

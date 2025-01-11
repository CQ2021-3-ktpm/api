import { Module } from '@nestjs/common';
import { StorageProvider } from '@/modules/storage/provider/s3';
import { S3Service } from '@/modules/storage/s3.service';
import { StorageController } from '@/modules/storage/storage.controller';

@Module({
  controllers: [StorageController],
  providers: [StorageProvider, S3Service],
  exports: [S3Service],
})
export class StorageModule {}

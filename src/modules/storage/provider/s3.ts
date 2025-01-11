import { S3 } from '@aws-sdk/client-s3';
import { Provider } from '@nestjs/common';

export const StorageServiceLib = 'lib:storage-service';

const S3Config = new S3({
  forcePathStyle: true,
  endpoint: process.env.STORAGE_ENDPOINT,
  region: process.env.STORAGE_REGION,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY,
    secretAccessKey: process.env.STORAGE_SECRET_KEY,
  },
});

export const StorageProvider: Provider<S3> = {
  provide: StorageServiceLib,
  useValue: S3Config,
};

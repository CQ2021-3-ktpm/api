import { ServiceException } from '@smithy/smithy-client';
import { S3 } from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import { StorageServiceLib } from '@/modules/storage/provider/s3';

@Injectable()
export class S3Service {
  private readonly bucketName = 'public';

  constructor(@Inject(StorageServiceLib) private readonly s3: S3) {}

  /**
   * Uploads a file to the specified S3 bucket.
   * @param file - The file to upload.
   * @param folderName - Optional folder name within the bucket.
   * @returns The file's public URL.
   */
  public async uploadFile(
    file: Express.Multer.File,
    folderName?: string,
  ): Promise<string> {
    const fileName = folderName
      ? `${folderName}/${Date.now()}_${file.originalname}`
      : `${Date.now()}_${file.originalname}`;

    try {
      await this.s3.putObject({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ACL: 'public-read',
      });
      return `/${this.bucketName}/${fileName}`;
    } catch (error) {
      const errorMessage =
        error instanceof ServiceException
          ? error.message
          : 'Something went wrong';
      throw new Error(
        `FileService_ERROR: ${errorMessage}, bucket: ${this.bucketName}`,
      );
    }
  }

  /**
   * Deletes a file from the specified S3 bucket.
   * @param fileName - The name of the file to delete.
   * @returns A success message.
   */
  public async deleteFile(fileName: string): Promise<string> {
    try {
      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: fileName,
      });
      return 'Object deleted successfully';
    } catch (error) {
      const errorMessage =
        error instanceof ServiceException
          ? error.message
          : 'Something went wrong';
      throw new Error(
        `FileService_ERROR: ${errorMessage}, bucket: ${this.bucketName}`,
      );
    }
  }
}

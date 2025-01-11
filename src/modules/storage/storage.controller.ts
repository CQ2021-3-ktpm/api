import { S3Service } from '@/modules/storage/s3.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicRoute } from '@/decorators';

@Controller('/file')
@ApiTags('File')
// Kệ mẹ ik, xài public cho lẹ
// @ApiBearerAuth()
@PublicRoute(true)
export class StorageController {
  constructor(private readonly s3FileService: S3Service) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  public async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.s3FileService.uploadFile(file);
  }

  @Delete('/delete/:fileName')
  public async deleteFile(@Param('fileName') fileName: string) {
    await this.s3FileService.deleteFile(fileName);
  }
}

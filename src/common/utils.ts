import { HttpException, InternalServerErrorException } from '@nestjs/common';

export function handleError(error: unknown): HttpException {
  if (error instanceof HttpException) {
    throw error;
  }

  throw new InternalServerErrorException(error);
}

import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { type Request } from 'express';

export function AuthUser() {
  return createParamDecorator((_data: unknown, context: ExecutionContext) => {
    const request: Request = context.switchToHttp().getRequest();

    return request.user;
  })();
}

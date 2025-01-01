import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { PublicRoute } from './decorators';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @PublicRoute(true)
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @PublicRoute(true)
  health(): string {
    return "I'm alive!";
  }

  @Get('hello/:name')
  getHelloName(@Param('name') name: string): string {
    return this.appService.getHelloName(name);
  }
}

import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { LlmService } from '@/modules/llm/llm.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [LlmService],
  exports: [LlmService],
})
export class LlmModule {}

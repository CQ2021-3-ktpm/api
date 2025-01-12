import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

export interface PromptMailResponse {
  recipients: string[];
  subject: string;
  body: string;
}

@Injectable()
export class LlmService {
  constructor(private readonly httpService: HttpService) {}

  async prompt(message: string): Promise<any> {
    const response = await this.httpService.axiosRef.post(
      'http://127.0.0.1:8000/prompt',
      {
        prompt: message,
      },
    );
    return response.data;
  }
}

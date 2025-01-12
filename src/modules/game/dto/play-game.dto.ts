import { IsArray, IsString } from 'class-validator';

export class PlayGameDto {
  @IsString()
  playerId: string;

  @IsArray()
  answers: number[];
}

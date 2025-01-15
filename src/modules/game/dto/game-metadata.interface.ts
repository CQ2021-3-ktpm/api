import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsDateString,
  IsOptional,
  IsNumber,
  ValidateNested,
  ArrayMinSize,
  isNumber,
} from 'class-validator';

export class addQuestion {
  @IsNotEmpty()
  question: string;

  @IsNotEmpty()
  choices: string[];

  @IsNotEmpty()
  @IsNumber()
  correctAnswer: number;
}

export interface Question {
  question: string;
  choices: string[];
  correctAnswer: number;
}

export interface GameMetadata {
  startTime: number;
  totalPoints: number;
  totalPlayers: number;
  questions: Question[];
}

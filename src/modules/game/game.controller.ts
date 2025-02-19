import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  ForbiddenException,
  NotFoundException,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { GameService } from './game.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthUser } from 'src/decorators/auth-user.decorator';
import { User } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateGameDto } from '@/modules/game/dto/create-game.dto';
import { addQuestion, Question } from '@/modules/game/dto/game-metadata.interface';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  @ApiBearerAuth()
  async createGame(@Body() createGameDto: CreateGameDto) {
    return this.gameService.createGame(createGameDto);
  }

  @Patch(':gameId/update-turn')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the turn of a game' })
  @ApiResponse({
    status: 200,
    description: 'Return the updated game',
  })
  async updateTurn(
    @Param('gameId') gameId: string,
    @Body() body: { turn: number },
    @AuthUser() user: User,
  ) {
    const result = await this.gameService.updateTurn(gameId, body.turn, user);
    if (!result) {
      throw new ForbiddenException('Game not found');
    }
    return result;
  }

  @Patch(':gameId/update-credit')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the credit of a game' })
  @ApiResponse({
    status: 200,
    description: 'Return the updated game',
  })
  async updateCredit(
    @Param('gameId') gameId: string,
    @Body() body: { credit: number },
    @AuthUser() user: User,
  ) {
    const result = await this.gameService.updateCredit(
      gameId,
      body.credit,
      user,
    );
    if (!result) {
      throw new ForbiddenException('Game not found');
    }
    return result;
  }

  @Get(':gameId/user-credit')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the credit of a user' })
  @ApiResponse({
    status: 200,
    description: 'Return the credit of a user',
  })
  async getUserCredit(@AuthUser() user: User, @Param('gameId') gameId: string) {
    const result = await this.gameService.getUserCredit(user, gameId);
    if (!result) {
      throw new ForbiddenException('Game not found');
    }
    return result;
  }

  @Get(':gameId')
  @ApiBearerAuth()
  async getGame(@Param('gameId') gameId: string) {
    const game = await this.gameService.getGame(gameId);
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return game;
  }

  @Get(':campaignId/games')
  @ApiBearerAuth()
  async getGameByCampaignId(@Param('campaignId') campaignId: string) {
    const campaign = await this.gameService.getGameByCampaignId(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    return campaign;
  }

  @Patch(':gameId/add-question')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add questions to a game' })
  @ApiResponse({
    status: 200,
    description: 'Return the updated game',
  })
  async addQuestionsToGame(
    @Param('gameId') gameId: string,
    @Body() question: addQuestion,
  ) {
    const result = await this.gameService.addQuestionsToGame(gameId, question);
    if (!result) {
      throw new ForbiddenException('Game not found');
    }
    return result;
  }

  @Patch(':gameId/update-start-time')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update the start time of a game' })
  @ApiResponse({
    status: 200,
    description: 'Return the updated game',
  })
  async updateMetadataForGame(
    @Param('gameId') gameId: string,
    @Body() body: { startTime: number },
  ) {
    const result = await this.gameService.updateMetadataForGame(gameId, body.startTime);
    if (!result) {
      throw new ForbiddenException('Game not found');
    }
    return result;
  }
}

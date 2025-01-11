import { Controller, Get, Param, Post, Body, ForbiddenException, NotFoundException } from '@nestjs/common';
import { GameService } from './game.service';
import { PlayGameDto } from './dto/play-game.dto';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get(':gameId')
  async getGame(@Param('gameId') gameId: string) {
    const game = await this.gameService.getGame(gameId);
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return game;
  }

  @Post(':gameId/play')
  async playGame(@Param('gameId') gameId: string, @Body() playGameDto: PlayGameDto) {
    const result = await this.gameService.playGame(gameId, playGameDto);
    if (!result.canPlay) {
      throw new ForbiddenException(result.message);
    }
    return result;
  }
}
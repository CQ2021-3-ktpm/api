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
import { PlayGameDto } from './dto/play-game.dto';
import { AuthUser } from 'src/decorators/auth-user.decorator';
import { User } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

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

  @Get(':gameId')
  async getGame(@Param('gameId') gameId: string) {
    const game = await this.gameService.getGame(gameId);
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return game;
  }

  @Post(':gameId/play')
  async playGame(
    @Param('gameId') gameId: string,
    @Body() playGameDto: PlayGameDto,
  ) {
    const result = await this.gameService.playGame(gameId, playGameDto);
    if (!result.canPlay) {
      throw new ForbiddenException(result.message);
    }
    return result;
  }
}

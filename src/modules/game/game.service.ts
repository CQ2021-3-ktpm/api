import { Injectable } from '@nestjs/common';
import { PlayGameDto } from './dto/play-game.dto';
import { PrismaService } from 'nestjs-prisma';
import { GameMetadata } from '@/modules/game/dto/game-metadata.interface';
import { User } from '@prisma/client';
import { CreateGameDto } from '@/modules/game/dto/create-game.dto';

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

  async getGame(gameId: string) {
    return this.prisma.game.findUnique({
      where: { game_id: gameId },
    });
  }

  async createGame(createGameDto: CreateGameDto) {
    if (createGameDto.type === 'quiz') {
      createGameDto.metadata.totalPoints = 1000
      createGameDto.metadata.totalPlayers = 0
    }

    return this.prisma.game.create({
      data: {
        ...createGameDto,
      },
    });
  }

  async updateTurn(gameId: string, turn: number, user: User) {
    const game = await this.getGame(gameId);
    if (!game) {
      return { canPlay: false, message: 'Game not found' };
    }

    const userCredit = await this.prisma.credit.findUnique({
      where: { player_id: user.user_id },
    });

    return await this.prisma.credit.update({
      where: { player_id: user.user_id },
      data: {
        shake_turn:
          turn < 0 ? userCredit.shake_turn - 1 : userCredit.shake_turn,
      },
    });
  }

  async updateCredit(gameId: string, credit: number, user: User) {
    const game = await this.getGame(gameId);
    if (!game) {
      return { canPlay: false, message: 'Game not found' };
    }

    const userCredit = await this.prisma.credit.findUnique({
      where: { player_id: user.user_id },
    });

    return await this.prisma.credit.update({
      where: { player_id: user.user_id },
      data: { credits: userCredit.credits + credit },
    });
  }

  async getUserCredit(user: User, gameId: string) {
    const game = await this.getGame(gameId);
    if (!game) {
      return { canPlay: false, message: 'Game not found' };
    }

    let userCredit = await this.prisma.credit.findUnique({
      where: { player_id: user.user_id },
    });

    if (!userCredit) {
      userCredit = await this.prisma.credit.create({
        data: { player_id: user.user_id, credits: 0, shake_turn: 10 },
      });
    }

    return userCredit;
  }
}

import { Injectable } from '@nestjs/common';
import { PlayGameDto } from './dto/play-game.dto';
import { PrismaService } from 'nestjs-prisma';
import { GameMetadata } from '@/modules/game/dto/game-metadata.interface';

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

  async getGame(gameId: string) {
    return this.prisma.game.findUnique({
      where: { game_id: gameId },
    });
  }

  async playGame(gameId: string, playGameDto: PlayGameDto) {
    const game = await this.getGame(gameId);
    if (!game) {
      return { canPlay: false, message: 'Game not found' };
    }

    const { playerId, answers } = playGameDto;
    const now = new Date();

    if (game.created_at > now) {
      return { canPlay: false, message: 'Game has not started yet' };
    }

    const metadata = game.metadata as unknown as GameMetadata;
    if (!metadata || !metadata.questions) {
      return { canPlay: false, message: 'Invalid game metadata' };
    }

    const correctAnswers = metadata.questions.map((q) => q.correctAnswer);
    if (answers.length !== correctAnswers.length || !answers.every((ans, i) => ans === correctAnswers[i])) {
      return { canPlay: false, message: 'Incorrect answer. Game over.' };
    }

    const participants = await this.prisma.credit.findMany({
      where: { credits_used: 0 },
    });

    const totalPoints = 100; // Example: Total points for the game
    const pointsPerUser = Math.floor(totalPoints / participants.length);

    await Promise.all(
      participants.map((participant) =>
        this.prisma.credit.update({
          where: { credit_id: participant.credit_id },
          data: { credits: participant.credits + pointsPerUser },
        }),
      ),
    );

    return { canPlay: true, message: 'Game completed successfully', pointsEarned: pointsPerUser };
  }
}
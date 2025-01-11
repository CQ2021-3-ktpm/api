import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'nestjs-prisma';

interface Question {
  question: string;
  choices: string[];
  correctAnswer: number;
}

interface GameMetadata {
  startTime: number;
  questions: Question[];
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly prisma: PrismaService) {}

  private gameAnswers: Record<string, Record<number, number[]>> = {};
  private validUsers: Record<string, boolean> = {};

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(client: Socket, payload: {gameId: string, playerId: string, joinTime: number}) {
    const game = await this.prisma.game.findUnique({
      where: {
        game_id: payload.gameId,
      }
    })

    const metadata = game?.metadata as unknown as GameMetadata;
    const questionResponse = metadata.questions.map(q => {
      return {
        question: q.question,
        choices: q.choices,
      }
    })

    const startTime = new Date(metadata.startTime);
    let valid: boolean = false;
    if (startTime.getTime() > payload.joinTime) {
      this.validUsers[payload.playerId] = true;
      valid = true;
    }

    client.emit('joinGameResponse', {valid: valid, questions: questionResponse});
  }

  @SubscribeMessage('answer')
  async handleAnswer(client: Socket, payload: { gameId: string; currentQuestion: number; answer: number }) {
    const { gameId, currentQuestion, answer } = payload;

    if (!this.gameAnswers[gameId]) {
      this.gameAnswers[gameId] = {};
    }

    if (!this.gameAnswers[gameId][currentQuestion]) {
      // Initialize the array with default values [0, 0, 0, 0]
      this.gameAnswers[gameId][currentQuestion] = [0, 0, 0, 0];
    }

    this.gameAnswers[gameId][currentQuestion][answer]++

    const answers = Object.values(this.gameAnswers[gameId][currentQuestion]);
    const totalAnswers = answers.reduce((acc, val) => {
      return acc + val;
    }, 0);

    const percentages = answers.map((ans) => Math.round((ans / totalAnswers) * 100));

    this.server.emit('answerStats', { gameId, stats: percentages });
  }

  @SubscribeMessage('getCorrectAnswer')
  async handleGetCorrectAnswer(client: Socket, payload: {gameId: string; currentQuestion: number}) {
    const game = await this.prisma.game.findUnique({
      where: {
        game_id: payload.gameId,
      }
    })

    const metadata = game?.metadata as unknown as GameMetadata;

    this.server.emit('correctAnswer', {index: metadata.questions[payload.currentQuestion].correctAnswer})
  }

  @SubscribeMessage('hostStartGame')
  handleHostStartGame(client: Socket, payload: {gameId: string}) {
    const { gameId} = payload;

    this.server.emit('hostStarted', {gameId})
  }
}